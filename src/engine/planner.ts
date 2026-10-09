import { ING } from '../data/ingredients';
import type { MealKey, PlannedMeal, Priority, Profile, Recipe, Slot } from '../types';
import { recipeCost, type PriceContext } from './cost';
import { rng } from './rng';
import { byDaySlot, isMeal, mealKeys, slotOf } from './slots';

export interface PlanInput {
  profile: Profile;
  recipes: Recipe[];
  /** Recipe ids of previous weeks, most recent first — used for "never the same week twice". */
  recent?: string[][];
  favorites?: string[];
  seed: number;
  /** Meals to keep untouched (locked meals, or the rest of the week when swapping). */
  keep?: PlannedMeal[];
  ctx: PriceContext;
}

export interface PlanResult {
  meals: PlannedMeal[];
  total: number;
  overBudget: boolean;
  /** Meals we couldn't fill because too few recipes match the filters. */
  unfilled: MealKey[];
}

/** Hard constraints: diet, allergies, dislikes, appliances, kid-friendly. */
export function isEligible(r: Recipe, p: Profile): boolean {
  if (p.diets.some((d) => !r.diets.includes(d))) return false;
  if (r.allergens.some((a) => p.allergens.includes(a))) return false;
  if (r.ingredientIds.some((id) => p.dislikes.includes(id))) return false;
  if (p.kidFriendly && !r.kid) return false;
  if (p.appliances.length) {
    for (const need of r.appliances) {
      const options = Array.isArray(need) ? need : [need];
      if (!options.some((a) => p.appliances.includes(a))) return false;
    }
  }
  return true;
}

const FRESH_AISLES = new Set(['fruit_veg', 'chilled_dairy']);
const freshIds = (r: Recipe) => r.ingredientIds.filter((id) => FRESH_AISLES.has(ING[id].aisle) && !ING[id].pantry);

/** Soft preference score — higher is better. Deterministic given the jitter source. */
function baseScore(r: Recipe, input: PlanInput, jitter: () => number): number {
  const { profile, recent = [], favorites = [] } = input;
  let s = 1;
  for (const pr of profile.priorities) if (r.tags.includes(pr)) s += 1.6;
  if (favorites.includes(r.id)) s += 0.8;
  const penalties = [4, 2, 1];
  recent.slice(0, 3).forEach((week, i) => {
    if (week.includes(r.id)) s -= penalties[i];
  });
  return s + jitter() * 2;
}

/** Priorities that narrow the plan to meals carrying their badge, not just nudge it. */
export const FOCUS: Priority[] = ['balance', 'anti_inflammatory'];

/**
 * With a focus priority chosen (Her Balance, Anti-inflammatory), plan only from meals with its badge when they
 * can fill the week: enough of them (and enough lunch-worthy ones) after diets, dislikes and kitchen, and —
 * when a cost is given — a week of the cheapest ones still fits the budget. Both chosen: meals with both
 * badges first, then each on its own (in FOCUS order). Otherwise use everything; the priorities still
 * prefer them. Budget stays the promise.
 */
export function focusPool(pool: Recipe[], profile: Profile, need: MealKey[], cost?: (r: Recipe) => number, budget = Infinity): Recipe[] {
  const wanted = FOCUS.filter((f) => profile.priorities.includes(f));
  if (!wanted.length) return pool;
  const lunches = need.filter((k) => k.slot === 'lunch').length;
  const fits = (rs: Recipe[]) => {
    if (rs.length < need.length || rs.filter((r) => r.lunch).length < lunches) return false;
    if (!cost) return true;
    const cheapest = rs
      .map(cost)
      .sort((x, y) => x - y)
      .slice(0, need.length)
      .reduce((t, c) => t + c, 0);
    return cheapest <= budget;
  };
  const tries = wanted.length > 1 ? [wanted, ...wanted.map((f) => [f])] : [wanted];
  for (const tags of tries) {
    const focused = pool.filter((r) => tags.every((t) => r.tags.includes(t)));
    if (fits(focused)) return focused;
  }
  return pool;
}

type Chosen = { key: MealKey; recipe: Recipe };

/** How well `r` fits alongside the meals already chosen. `perDay` scales the repeat limits for lunch + dinner weeks. */
function varietyScore(r: Recipe, key: MealKey, chosen: Chosen[], perDay = 1): number {
  let s = 0;
  const sameProtein = chosen.filter((c) => c.recipe.mainProtein && c.recipe.mainProtein === r.mainProtein);
  // No main protein twice in a row: same meal on neighbouring days, or lunch and dinner on the same day.
  const close = (c: Chosen) => (c.key.slot === key.slot && Math.abs(c.key.day - key.day) === 1) || (c.key.day === key.day && c.key.slot !== key.slot);
  if (sameProtein.some(close)) s -= 2.5;
  if (sameProtein.length >= 2 * perDay) s -= 1.5 * (sameProtein.length - 2 * perDay + 1);
  const sameCuisine = chosen.filter((c) => c.recipe.cuisine === r.cuisine).length;
  s -= sameCuisine >= 2 * perDay ? 2 : sameCuisine * (0.5 / perDay);
  // Reward sharing fresh ingredients — half a bag of spinach gets used twice, less waste.
  const fresh = new Set(chosen.flatMap((c) => freshIds(c.recipe)));
  const shared = freshIds(r).filter((id) => fresh.has(id)).length;
  s += Math.min(1.2, shared * 0.35);
  return s;
}

/** Lunches are drawn only from quick, lighter recipes. */
const fitsSlot = (r: Recipe, slot: Slot) => slot === 'dinner' || r.lunch;

export function generateWeek(input: PlanInput): PlanResult {
  const { profile, recipes, ctx } = input;
  const rand = rng(input.seed);
  const household = profile.household;
  const keys = mealKeys(profile.days, profile.meals?.length ? profile.meals : ['dinner']);
  const perDay = Math.max(1, keys.length / Math.max(1, profile.days.length));
  const keep = (input.keep ?? []).filter((m) => keys.some((k) => isMeal(m, k)));
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));

  const isKeptKey = (k: MealKey) => keep.some((m) => isMeal(m, k));
  const keptBudget = keep.reduce((t, m) => t + (byId[m.recipeId] ? recipeCost(byId[m.recipeId], m.servings, ctx, m.removed) : 0), 0);
  const pool = focusPool(
    recipes.filter((r) => isEligible(r, profile)),
    profile,
    keys.filter((k) => !isKeptKey(k)),
    (r) => recipeCost(r, household, ctx),
    profile.weeklyBudget - keptBudget,
  );
  const score = new Map(pool.map((r) => [r.id, baseScore(r, input, rand)]));
  const cost = new Map(pool.map((r) => [r.id, recipeCost(r, household, ctx)]));

  const chosen: (Chosen & { meal: PlannedMeal })[] = keep
    .filter((m) => byId[m.recipeId])
    .map((m) => ({ key: { day: m.day, slot: slotOf(m) }, recipe: byId[m.recipeId], meal: m }));
  const used = new Set(chosen.map((c) => c.recipe.id));
  const keptCost = keep.reduce((s, m) => s + (byId[m.recipeId] ? recipeCost(byId[m.recipeId], m.servings, ctx, m.removed) : 0), 0);
  const isKept = (k: MealKey) => keep.some((m) => isMeal(m, k));

  let remainingBudget = profile.weeklyBudget - keptCost;
  const open = keys.filter((k) => !isKept(k));
  const unfilled: MealKey[] = [];

  open.forEach((key, idx) => {
    const target = remainingBudget / (open.length - idx);
    let best: Recipe | null = null;
    let bestScore = -Infinity;
    for (const r of pool) {
      if (used.has(r.id) || !fitsSlot(r, key.slot)) continue;
      const c = cost.get(r.id)!;
      const budgetFit = c > target ? (-3 * (c - target)) / Math.max(target, 1) : Math.min(0.5, (0.3 * (target - c)) / Math.max(target, 1));
      const s = score.get(r.id)! + varietyScore(r, key, chosen, perDay) + budgetFit;
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    }
    if (!best) {
      unfilled.push(key);
      return;
    }
    used.add(best.id);
    remainingBudget -= cost.get(best.id)!;
    chosen.push({ key, recipe: best, meal: { day: key.day, slot: key.slot, recipeId: best.id, servings: household, removed: [] } });
  });

  // Budget fit: swap the worst value-for-money meal for a cheaper candidate until under the cap.
  const total = () => chosen.reduce((s, c) => s + recipeCost(c.recipe, c.meal.servings, ctx, c.meal.removed), 0);
  for (let i = 0; i < 60 && total() > profile.weeklyBudget; i++) {
    let bestSwap: { idx: number; r: Recipe; metric: number } | null = null;
    chosen.forEach((c, idx) => {
      if (isKept(c.key)) return;
      const cur = cost.get(c.recipe.id)!;
      const others = chosen.filter((_, j) => j !== idx);
      const curScore = score.get(c.recipe.id)! + varietyScore(c.recipe, c.key, others, perDay);
      for (const r of pool) {
        if (used.has(r.id) || !fitsSlot(r, c.key.slot)) continue;
        const saving = cur - cost.get(r.id)!;
        if (saving <= 0.01) continue;
        const metric = (curScore - (score.get(r.id)! + varietyScore(r, c.key, others, perDay))) / saving;
        if (!bestSwap || metric < bestSwap.metric) bestSwap = { idx, r, metric };
      }
    });
    if (!bestSwap) break;
    const { idx, r } = bestSwap as { idx: number; r: Recipe };
    used.delete(chosen[idx].recipe.id);
    used.add(r.id);
    chosen[idx] = { ...chosen[idx], recipe: r, meal: { ...chosen[idx].meal, recipeId: r.id, removed: [] } };
  }

  const meals = chosen.map((c) => c.meal).sort(byDaySlot);
  const t = total();
  return { meals, total: t, overBudget: t > profile.weeklyBudget + 0.005, unfilled };
}

export interface SwapOption {
  recipe: Recipe;
  /** Week total if this option replaces the meal at `key`. */
  newTotal: number;
  delta: number;
  fitsBudget: boolean;
}

/** Ranked alternatives for one meal, keeping the rest of the week. */
export function swapOptions(input: PlanInput & { meals: PlannedMeal[]; key: MealKey; limit?: number }): SwapOption[] {
  const { profile, recipes, ctx, meals, key } = input;
  const rand = rng(input.seed);
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const current = meals.find((m) => isMeal(m, key));
  const others = meals.filter((m) => !isMeal(m, key) && byId[m.recipeId]);
  const othersCost = others.reduce((s, m) => s + recipeCost(byId[m.recipeId], m.servings, ctx, m.removed), 0);
  const curCost = current && byId[current.recipeId] ? recipeCost(byId[current.recipeId], current.servings, ctx, current.removed) : 0;
  const inWeek = new Set(meals.map((m) => m.recipeId));
  const chosen = others.map((m) => ({ key: { day: m.day, slot: slotOf(m) }, recipe: byId[m.recipeId] }));
  const servings = current?.servings ?? profile.household;
  const perDay = Math.max(1, profile.meals?.length ?? 1);

  const candidates = recipes.filter((r) => !inWeek.has(r.id) && isEligible(r, profile) && fitsSlot(r, key.slot));
  return focusPool(
    candidates,
    profile,
    Array.from({ length: Math.min(4, input.limit ?? 8) }, () => key),
  )
    .map((r) => {
      const c = recipeCost(r, servings, ctx);
      const newTotal = othersCost + c;
      return {
        recipe: r,
        newTotal,
        delta: c - curCost,
        fitsBudget: newTotal <= profile.weeklyBudget + 0.005,
        s: baseScore(r, input, rand) + varietyScore(r, key, chosen, perDay),
      };
    })
    .sort((a, b) => Number(b.fitsBudget) - Number(a.fitsBudget) || b.s - a.s)
    .slice(0, input.limit ?? 8)
    .map(({ s: _s, ...o }) => o);
}
