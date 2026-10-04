import { describe, expect, it } from 'vitest';
import { RECIPES, RECIPE_BY_ID } from '../data/recipes';
import { ALLERGENS, DIETS, PRIORITIES } from '../data/taxonomy';
import type { Appliance, Profile } from '../types';
import { recipeCost, weekCost } from './cost';
import { buildList } from './groceryList';
import { generateWeek, isEligible, swapOptions } from './planner';
import { rng } from './rng';
import { formatBuyQty, formatLineQty, formatWeight, niceNumber } from './units';
import { ING } from '../data/ingredients';

const base: Profile = {
  country: 'US',
  storeId: 'walmart',
  weeklyBudget: 80,
  household: 2,
  kidFriendly: false,
  diets: [],
  allergens: [],
  dislikes: [],
  priorities: [],
  appliances: ['stove', 'oven', 'air_fryer', 'microwave'],
  days: [0, 1, 2, 3, 4, 5, 6],
  units: 'auto',
};
const ctx = { country: 'US' as const, storeId: 'walmart' };

function randomProfile(seed: number): Profile {
  const r = rng(seed);
  const pick = <T>(xs: T[], p: number) => xs.filter(() => r() < p);
  const appliances = pick<Appliance>(['stove', 'oven', 'air_fryer', 'microwave', 'rice_cooker'], 0.7);
  return {
    ...base,
    weeklyBudget: 25 + Math.round(r() * 22) * 5,
    household: 1 + Math.floor(r() * 4),
    kidFriendly: r() < 0.2,
    diets: pick(
      DIETS.map((d) => d.id),
      0.12,
    ),
    allergens: pick(
      ALLERGENS.map((a) => a.id),
      0.1,
    ),
    dislikes: pick(['cilantro', 'mushrooms', 'eggplant', 'olives', 'shrimp'], 0.25),
    priorities: pick(
      PRIORITIES.map((p) => p.id),
      0.3,
    ),
    appliances: appliances.length ? appliances : ['stove'],
    days: pick([0, 1, 2, 3, 4, 5, 6], 0.85),
  };
}

describe('planner', () => {
  it('never violates hard constraints, never repeats, fills every day it can', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const profile = randomProfile(seed);
      const res = generateWeek({ profile, recipes: RECIPES, seed, ctx });
      const ids = res.meals.map((m) => m.recipeId);
      expect(new Set(ids).size, `seed ${seed} repeats`).toBe(ids.length);
      for (const m of res.meals) {
        expect(isEligible(RECIPE_BY_ID[m.recipeId], profile), `seed ${seed} ${m.recipeId}`).toBe(true);
        expect(profile.days).toContain(m.day);
        expect(m.servings).toBe(profile.household);
      }
      const eligible = RECIPES.filter((r) => isEligible(r, profile)).length;
      expect(res.meals.length + res.unfilled.length).toBe(profile.days.length);
      expect(res.meals.length).toBe(Math.min(profile.days.length, eligible));
    }
  });

  it('lands under budget whenever the cheapest possible week fits', () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const profile = randomProfile(seed);
      const res = generateWeek({ profile, recipes: RECIPES, seed, ctx });
      const cheapest = RECIPES.filter((r) => isEligible(r, profile))
        .map((r) => recipeCost(r, profile.household, ctx))
        .sort((a, b) => a - b)
        .slice(0, res.meals.length)
        .reduce((s, c) => s + c, 0);
      if (cheapest <= profile.weeklyBudget * 0.9) {
        checked++;
        expect(res.total, `seed ${seed}`).toBeLessThanOrEqual(profile.weeklyBudget + 0.01);
        expect(res.overBudget).toBe(false);
      }
      expect(res.total).toBeCloseTo(weekCost(res.meals, RECIPE_BY_ID, ctx), 6);
    }
    expect(checked).toBeGreaterThan(100);
  });

  it('is deterministic per seed and Redo (new seed) gives a different week', () => {
    const a = generateWeek({ profile: base, recipes: RECIPES, seed: 42, ctx });
    const b = generateWeek({ profile: base, recipes: RECIPES, seed: 42, ctx });
    const c = generateWeek({ profile: base, recipes: RECIPES, seed: 43, ctx });
    expect(a.meals).toEqual(b.meals);
    expect(c.meals.map((m) => m.recipeId)).not.toEqual(a.meals.map((m) => m.recipeId));
  });

  it('avoids last week’s meals', () => {
    const w1 = generateWeek({ profile: base, recipes: RECIPES, seed: 7, ctx });
    const w2 = generateWeek({ profile: base, recipes: RECIPES, seed: 8, ctx, recent: [w1.meals.map((m) => m.recipeId)] });
    const overlap = w2.meals.filter((m) => w1.meals.some((x) => x.recipeId === m.recipeId));
    expect(overlap.length).toBeLessThanOrEqual(1);
  });

  it('honours priorities', () => {
    const profile = { ...base, priorities: ['plant_forward' as const], weeklyBudget: 135 };
    const res = generateWeek({ profile, recipes: RECIPES, seed: 3, ctx });
    const veg = res.meals.filter((m) => RECIPE_BY_ID[m.recipeId].tags.includes('plant_forward')).length;
    expect(veg).toBeGreaterThanOrEqual(5);
  });

  it('keeps locked meals and does not reuse them', () => {
    const keep = [{ day: 2, recipeId: 'lasagne', servings: 2, removed: [] }];
    const res = generateWeek({ profile: base, recipes: RECIPES, seed: 5, ctx, keep });
    expect(res.meals.find((m) => m.day === 2)?.recipeId).toBe('lasagne');
    expect(res.meals.filter((m) => m.recipeId === 'lasagne')).toHaveLength(1);
  });

  it('offers swap options that are new, eligible and budget-aware', () => {
    const profile = { ...base, diets: ['vegetarian' as const] };
    const res = generateWeek({ profile, recipes: RECIPES, seed: 11, ctx });
    const opts = swapOptions({ profile, recipes: RECIPES, seed: 99, ctx, meals: res.meals, day: 3 });
    expect(opts.length).toBeGreaterThan(3);
    for (const o of opts) {
      expect(res.meals.some((m) => m.recipeId === o.recipe.id)).toBe(false);
      expect(o.recipe.diets).toContain('vegetarian');
    }
    // budget-fitting options come first
    const firstMiss = opts.findIndex((o) => !o.fitsBudget);
    if (firstMiss >= 0) expect(opts.slice(firstMiss).every((o) => !o.fitsBudget)).toBe(true);
  });
});

describe('grocery list', () => {
  const plan = generateWeek({ profile: base, recipes: RECIPES, seed: 21, ctx });

  it('totals match the week cost and pantry items are pre-ticked and free', () => {
    const list = buildList({ meals: plan.meals, checks: {}, custom: [] }, RECIPE_BY_ID, ctx);
    expect(list.total).toBeCloseTo(plan.total, 6);
    const pantry = list.groups.find((g) => g.aisle === 'pantry');
    expect(pantry?.items.every((i) => i.checked && i.cost === 0)).toBe(true);
    expect(list.inCart).toBe(0);
    expect(list.count).toBe(list.groups.flatMap((g) => g.items).filter((i) => !i.pantry).length);
  });

  it('merges duplicate ingredients across meals and respects removed ingredients', () => {
    const meals = [
      { day: 0, recipeId: 'teriyaki-chicken-rice', servings: 2, removed: [] },
      { day: 1, recipeId: 'chicken-fried-rice', servings: 2, removed: ['peas'] },
    ];
    const list = buildList({ meals, checks: { chicken_thigh: true }, custom: [{ id: 'c1', name: 'Kitchen roll' }] }, RECIPE_BY_ID, ctx);
    const items = list.groups.flatMap((g) => g.items);
    expect(items.filter((i) => i.ingredientId === 'chicken_thigh')).toHaveLength(1);
    expect(items.find((i) => i.ingredientId === 'chicken_thigh')?.grams).toBeCloseTo(650);
    expect(items.find((i) => i.ingredientId === 'chicken_thigh')?.checked).toBe(true);
    expect(items.find((i) => i.ingredientId === 'peas')).toBeUndefined();
    expect(items.find((i) => i.key === 'c1')?.name).toBe('Kitchen roll');
    expect(list.inCart).toBe(1);
  });

  it('scales with household size', () => {
    const one = buildList({ meals: [{ day: 0, recipeId: 'pad-thai', servings: 2, removed: [] }], checks: {}, custom: [] }, RECIPE_BY_ID, ctx);
    const two = buildList({ meals: [{ day: 0, recipeId: 'pad-thai', servings: 4, removed: [] }], checks: {}, custom: [] }, RECIPE_BY_ID, ctx);
    expect(two.total).toBeCloseTo(one.total * 2, 6);
  });
});

describe('units', () => {
  it('formats fractions and weights like Whipp', () => {
    expect(niceNumber(0.5)).toBe('½');
    expect(niceNumber(1.25)).toBe('1¼');
    expect(niceNumber(0.25)).toBe('¼');
    expect(niceNumber(2.98)).toBe('3');
    expect(formatWeight(397, false)).toBe('14 oz');
    expect(formatWeight(600, false)).toBe('1.32 lb');
    expect(formatWeight(397, true)).toBe('395g');
    expect(formatLineQty(['soy_sauce', 0.25, 'cup'], 1, 'US')).toBe('¼ cup');
    expect(formatLineQty(['scallion', 2, 'each'], 1, 'US')).toBe('2 whole');
    expect(formatLineQty(['garlic', 2, 'clove'], 1, 'US')).toBe('2 cloves');
    expect(formatLineQty(['chickpeas', 1, 'can'], 2, 'UK')).toBe('2 cans');
    expect(formatBuyQty(ING.onion, 160, 'US')).toBe('1');
    expect(formatBuyQty(ING.chickpeas, 480, 'US')).toBe('2 cans');
    expect(formatBuyQty(ING.chicken_stock, 400, 'US')).toBe('14 fl oz');
  });
});
