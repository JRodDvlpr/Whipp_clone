import { ING } from '../data/ingredients';
import type { PlannedMeal, Profile, Recipe } from '../types';
import { recipeCost, type PriceContext } from './cost';
import { rng } from './rng';

export interface PlanInput {
  profile: Profile;
  recipes: Recipe[];
  /** Recipe ids of previous weeks, most recent first — used for "never the same week twice". */
  recent?: string[][];
  favorites?: string[];
  seed: number;
  /** Meals to keep untouched (locked days, or the rest of the week when swapping). */
  keep?: PlannedMeal[];
  ctx: PriceContext;
}

export interface PlanResult {
  meals: PlannedMeal[];
  total: number;
  overBudget: boolean;
  /** Days we couldn't fill because too few recipes match the filters. */
  unfilled: number[];
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

/** How well `r` fits alongside the meals already chosen. */
function varietyScore(r: Recipe, day: number, chosen: { day: number; recipe: Recipe }[]): number {
  let s = 0;
  const sameProtein = chosen.filter((c) => c.recipe.mainProtein && c.recipe.mainProtein === r.mainProtein);
  if (sameProtein.some((c) => Math.abs(c.day - day) === 1)) s -= 2.5;
  if (sameProtein.length >= 2) s -= 1.5 * (sameProtein.length - 1);
  const sameCuisine = chosen.filter((c) => c.recipe.cuisine === r.cuisine).length;
  s -= sameCuisine >= 2 ? 2 : sameCuisine * 0.5;
  // Reward sharing fresh ingredients — half a bag of spinach gets used twice, less waste.
  const fresh = new Set(chosen.flatMap((c) => freshIds(c.recipe)));
  const shared = freshIds(r).filter((id) => fresh.has(id)).length;
  s += Math.min(1.2, shared * 0.35);
  return s;
}

export function generateWeek(input: PlanInput): PlanResult {
  const { profile, recipes, ctx } = input;
  const rand = rng(input.seed);
  const household = profile.household;
  const days = [...profile.days].sort((a, b) => a - b);
  const keep = (input.keep ?? []).filter((m) => days.includes(m.day));
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));

  const pool = recipes.filter((r) => isEligible(r, profile));
  const score = new Map(pool.map((r) => [r.id, baseScore(r, input, rand)]));
  const cost = new Map(pool.map((r) => [r.id, recipeCost(r, household, ctx)]));

  const chosen: { day: number; recipe: Recipe; meal: PlannedMeal }[] = keep
    .filter((m) => byId[m.recipeId])
    .map((m) => ({ day: m.day, recipe: byId[m.recipeId], meal: m }));
  const used = new Set(chosen.map((c) => c.recipe.id));
  const keptCost = keep.reduce((s, m) => s + (byId[m.recipeId] ? recipeCost(byId[m.recipeId], m.servings, ctx, m.removed) : 0), 0);

  let remainingBudget = profile.weeklyBudget - keptCost;
  const openDays = days.filter((d) => !keep.some((m) => m.day === d));
  const unfilled: number[] = [];

  openDays.forEach((day, idx) => {
    const target = remainingBudget / (openDays.length - idx);
    let best: Recipe | null = null;
    let bestScore = -Infinity;
    for (const r of pool) {
      if (used.has(r.id)) continue;
      const c = cost.get(r.id)!;
      const budgetFit = c > target ? (-3 * (c - target)) / Math.max(target, 1) : Math.min(0.5, (0.3 * (target - c)) / Math.max(target, 1));
      const s = score.get(r.id)! + varietyScore(r, day, chosen) + budgetFit;
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    }
    if (!best) {
      unfilled.push(day);
      return;
    }
    used.add(best.id);
    remainingBudget -= cost.get(best.id)!;
    chosen.push({ day, recipe: best, meal: { day, recipeId: best.id, servings: household, removed: [] } });
  });

  // Budget fit: swap the worst value-for-money meal for a cheaper candidate until under the cap.
  const total = () => chosen.reduce((s, c) => s + recipeCost(c.recipe, c.meal.servings, ctx, c.meal.removed), 0);
  for (let i = 0; i < 40 && total() > profile.weeklyBudget; i++) {
    let bestSwap: { idx: number; r: Recipe; metric: number } | null = null;
    chosen.forEach((c, idx) => {
      if (keep.some((k) => k.day === c.day)) return;
      const cur = cost.get(c.recipe.id)!;
      for (const r of pool) {
        if (used.has(r.id)) continue;
        const saving = cur - cost.get(r.id)!;
        if (saving <= 0.01) continue;
        const others = chosen.filter((_, j) => j !== idx);
        const loss = score.get(c.recipe.id)! + varietyScore(c.recipe, c.day, others) - (score.get(r.id)! + varietyScore(r, c.day, others));
        const metric = loss / saving;
        if (!bestSwap || metric < bestSwap.metric) bestSwap = { idx, r, metric };
      }
    });
    if (!bestSwap) break;
    const { idx, r } = bestSwap as { idx: number; r: Recipe };
    used.delete(chosen[idx].recipe.id);
    used.add(r.id);
    chosen[idx] = { ...chosen[idx], recipe: r, meal: { ...chosen[idx].meal, recipeId: r.id, removed: [] } };
  }

  const meals = chosen.map((c) => c.meal).sort((a, b) => a.day - b.day);
  const t = total();
  return { meals, total: t, overBudget: t > profile.weeklyBudget + 0.005, unfilled };
}

export interface SwapOption {
  recipe: Recipe;
  /** Week total if this option replaces the meal on `day`. */
  newTotal: number;
  delta: number;
  fitsBudget: boolean;
}

/** Ranked alternatives for one day, keeping the rest of the week. */
export function swapOptions(input: PlanInput & { meals: PlannedMeal[]; day: number; limit?: number }): SwapOption[] {
  const { profile, recipes, ctx, meals, day } = input;
  const rand = rng(input.seed);
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const current = meals.find((m) => m.day === day);
  const others = meals.filter((m) => m.day !== day && byId[m.recipeId]);
  const othersCost = others.reduce((s, m) => s + recipeCost(byId[m.recipeId], m.servings, ctx, m.removed), 0);
  const curCost = current && byId[current.recipeId] ? recipeCost(byId[current.recipeId], current.servings, ctx, current.removed) : 0;
  const inWeek = new Set(meals.map((m) => m.recipeId));
  const chosen = others.map((m) => ({ day: m.day, recipe: byId[m.recipeId] }));
  const servings = current?.servings ?? profile.household;

  return recipes
    .filter((r) => !inWeek.has(r.id) && isEligible(r, profile))
    .map((r) => {
      const c = recipeCost(r, servings, ctx);
      const newTotal = othersCost + c;
      return {
        recipe: r,
        newTotal,
        delta: c - curCost,
        fitsBudget: newTotal <= profile.weeklyBudget + 0.005,
        s: baseScore(r, input, rand) + varietyScore(r, day, chosen),
      };
    })
    .sort((a, b) => Number(b.fitsBudget) - Number(a.fitsBudget) || b.s - a.s)
    .slice(0, input.limit ?? 8)
    .map(({ s: _s, ...o }) => o);
}
