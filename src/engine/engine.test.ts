import { describe, expect, it } from 'vitest';
import { RECIPES, RECIPE_BY_ID } from '../data/recipes';
import { ALLERGENS, DIETS, PRIORITIES } from '../data/taxonomy';
import type { Appliance, Profile } from '../types';
import { recipeCost, weekCost } from './cost';
import { buildList } from './groceryList';
import { antiInflammatoryCheck } from './antiInflammatory';
import { balanceCheck } from './balance';
import { BREAKFAST_REPEATS, generateWeek, isEligible, swapOptions } from './planner';
import { proteinCheck } from './protein';
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
  meals: ['dinner'],
  reminder: { on: false, day: 6, time: '17:00' },
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
    meals: ([['dinner'], ['lunch', 'dinner'], ['breakfast', 'dinner'], ['breakfast', 'lunch', 'dinner']] as Profile['meals'][])[Math.floor(r() * 4)],
  };
}

describe('planner', () => {
  it('never violates hard constraints, never repeats, fills every day it can', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const profile = randomProfile(seed);
      const res = generateWeek({ profile, recipes: RECIPES, seed, ctx });
      // Lunches and dinners never repeat; a breakfast may appear up to BREAKFAST_REPEATS times.
      const ids = res.meals.filter((m) => m.slot !== 'breakfast').map((m) => m.recipeId);
      expect(new Set(ids).size, `seed ${seed} repeats`).toBe(ids.length);
      const bf = res.meals.filter((m) => m.slot === 'breakfast').map((m) => m.recipeId);
      for (const id of bf) {
        expect(RECIPE_BY_ID[id].breakfast, `seed ${seed} breakfast slot`).toBe(true);
        expect(bf.filter((x) => x === id).length).toBeLessThanOrEqual(BREAKFAST_REPEATS);
      }
      for (const m of res.meals) if (m.slot !== 'breakfast') expect(RECIPE_BY_ID[m.recipeId].breakfast, `seed ${seed} main`).toBe(false);
      for (const m of res.meals) {
        expect(isEligible(RECIPE_BY_ID[m.recipeId], profile), `seed ${seed} ${m.recipeId}`).toBe(true);
        expect(profile.days).toContain(m.day);
        expect(m.servings).toBe(profile.household);
      }
      const eligible = RECIPES.filter((r) => isEligible(r, profile) && !r.breakfast).length;
      const slots = profile.days.length * profile.meals.length;
      expect(res.meals.length + res.unfilled.length).toBe(slots);
      if (profile.meals.length === 1) expect(res.meals.length).toBe(Math.min(slots, eligible));
      for (const m of res.meals) if (m.slot === 'lunch') expect(RECIPE_BY_ID[m.recipeId].lunch, `seed ${seed} lunch`).toBe(true);
    }
  });

  it('lands under budget whenever the cheapest possible week fits', () => {
    let checked = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const profile = randomProfile(seed);
      const res = generateWeek({ profile, recipes: RECIPES, seed, ctx });
      // Cheapest possible week: cheapest mains for lunch/dinner slots plus the cheapest breakfast (it may repeat).
      const nMains = res.meals.filter((m) => m.slot !== 'breakfast').length;
      const nBreakfasts = res.meals.length - nMains;
      const mainCosts = RECIPES.filter((r) => isEligible(r, profile) && !r.breakfast)
        .map((r) => recipeCost(r, profile.household, ctx))
        .sort((a, b) => a - b);
      const bfCosts = RECIPES.filter((r) => isEligible(r, profile) && r.breakfast)
        .map((r) => recipeCost(r, profile.household, ctx))
        .sort((a, b) => a - b);
      const cheapest =
        mainCosts.slice(0, nMains).reduce((s, c) => s + c, 0) +
        bfCosts.slice(0, Math.ceil(nBreakfasts / BREAKFAST_REPEATS)).reduce((s, c) => s + c * BREAKFAST_REPEATS, 0);
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
    const opts = swapOptions({ profile, recipes: RECIPES, seed: 99, ctx, meals: res.meals, key: { day: 3, slot: 'dinner' } });
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

describe('lunch and dinner', () => {
  const profile: Profile = { ...base, meals: ['lunch', 'dinner'], weeklyBudget: 135 };

  it('plans 14 meals with light, quick lunches and no repeats', () => {
    const res = generateWeek({ profile, recipes: RECIPES, seed: 4, ctx });
    expect(res.meals).toHaveLength(14);
    expect(new Set(res.meals.map((m) => m.recipeId)).size).toBe(14);
    const lunches = res.meals.filter((m) => m.slot === 'lunch');
    expect(lunches).toHaveLength(7);
    for (const m of lunches) expect(RECIPE_BY_ID[m.recipeId].lunch).toBe(true);
    expect(res.total).toBeLessThanOrEqual(135.01);
  });

  it('has enough lunch recipes for every diet', () => {
    for (const d of DIETS.map((x) => x.id)) {
      const n = RECIPES.filter((r) => r.lunch && r.diets.includes(d)).length;
      expect(n, `${d} lunches`).toBeGreaterThanOrEqual(7);
    }
  });

  it('swaps a lunch only for lunch-worthy recipes', () => {
    const res = generateWeek({ profile, recipes: RECIPES, seed: 9, ctx });
    const opts = swapOptions({ profile, recipes: RECIPES, seed: 1, ctx, meals: res.meals, key: { day: 2, slot: 'lunch' } });
    expect(opts.length).toBeGreaterThan(0);
    for (const o of opts) expect(o.recipe.lunch).toBe(true);
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

describe('weekly reminder', () => {
  it('finds the next occurrence and builds a recurring calendar event', async () => {
    const { nextOccurrence, reminderIcs } = await import('./reminder');
    const now = new Date(2026, 9, 4, 12, 0); // Sunday Oct 4 2026, noon
    const r = { on: true, day: 6, time: '17:00' };
    expect(nextOccurrence(r, now)).toEqual(new Date(2026, 9, 4, 17, 0));
    expect(nextOccurrence({ ...r, time: '09:00' }, now)).toEqual(new Date(2026, 9, 11, 9, 0));
    expect(nextOccurrence({ ...r, day: 0 }, now)).toEqual(new Date(2026, 9, 5, 17, 0));
    const ics = reminderIcs(r, 'https://example.com/app/', now);
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SU');
    expect(ics).toContain('DTSTART:20261004T170000');
    expect(ics).toContain('BEGIN:VALARM');
  });
});

describe('Her Balance', () => {
  const her: Profile = { ...base, priorities: ['balance'], weeklyBudget: 120 };

  it('tags only meals that meet every rule, and there are plenty of them', () => {
    const tagged = RECIPES.filter((r) => r.tags.includes('balance'));
    for (const r of tagged) {
      const c = balanceCheck(r);
      expect(c.ok, `${r.id}: ${c.misses.join(', ')}`).toBe(true);
      expect(r.nutrition.kcal).toBeLessThanOrEqual(650);
      expect(r.nutrition.protein).toBeGreaterThanOrEqual(25);
      expect(r.nutrition.fiber).toBeGreaterThanOrEqual(7);
      expect(c.highlights.length).toBeGreaterThan(0);
    }
    expect(tagged.length).toBeGreaterThanOrEqual(30);
    expect(tagged.filter((r) => r.lunch).length).toBeGreaterThanOrEqual(14);
    expect(tagged.filter((r) => r.diets.includes('vegetarian')).length).toBeGreaterThanOrEqual(6);
  });

  it('plans whole weeks (dinners, or lunch + dinner) from Her Balance meals only', () => {
    for (const meals of [['dinner'], ['lunch', 'dinner']] as Profile['meals'][]) {
      for (let seed = 1; seed <= 20; seed++) {
        const res = generateWeek({ profile: { ...her, meals }, recipes: RECIPES, seed, ctx });
        expect(res.unfilled).toEqual([]);
        for (const m of res.meals) expect(RECIPE_BY_ID[m.recipeId].tags, m.recipeId).toContain('balance');
      }
    }
  });

  it('still respects diets and offers Her Balance swaps', () => {
    const veg: Profile = { ...her, diets: ['vegetarian'] };
    const res = generateWeek({ profile: veg, recipes: RECIPES, seed: 3, ctx });
    for (const m of res.meals) expect(RECIPE_BY_ID[m.recipeId].diets).toContain('vegetarian');
    const week = generateWeek({ profile: her, recipes: RECIPES, seed: 5, ctx });
    const opts = swapOptions({ profile: her, recipes: RECIPES, seed: 5, ctx, meals: week.meals, key: { day: 0, slot: 'dinner' } });
    expect(opts.length).toBeGreaterThan(0);
    for (const o of opts) expect(o.recipe.tags).toContain('balance');
  });
});

describe('Anti-inflammatory', () => {
  const anti: Profile = { ...base, priorities: ['anti_inflammatory'], weeklyBudget: 120 };

  it('tags only meals that meet every rule, with good variety', () => {
    const tagged = RECIPES.filter((r) => r.tags.includes('anti_inflammatory'));
    for (const r of tagged) {
      const c = antiInflammatoryCheck(r);
      expect(c.ok, `${r.id}: ${c.misses.join(', ')}`).toBe(true);
      expect(['beef', 'pork', 'lamb']).not.toContain(r.mainProtein);
      expect(c.stars.length).toBeGreaterThanOrEqual(2);
      expect(c.vegGrams).toBeGreaterThanOrEqual(150);
    }
    expect(tagged.length).toBeGreaterThanOrEqual(35);
    expect(tagged.filter((r) => r.lunch).length).toBeGreaterThanOrEqual(14);
    expect(tagged.filter((r) => r.diets.includes('vegan')).length).toBeGreaterThanOrEqual(7);
  });

  it('plans weeks from anti-inflammatory meals, and from meals with both badges when Her Balance is on too', () => {
    for (let seed = 1; seed <= 15; seed++) {
      const week = generateWeek({ profile: anti, recipes: RECIPES, seed, ctx });
      expect(week.unfilled).toEqual([]);
      for (const m of week.meals) expect(RECIPE_BY_ID[m.recipeId].tags).toContain('anti_inflammatory');
      const both = generateWeek({ profile: { ...anti, priorities: ['balance', 'anti_inflammatory'] }, recipes: RECIPES, seed, ctx });
      expect(both.unfilled).toEqual([]);
      for (const m of both.meals) expect(RECIPE_BY_ID[m.recipeId].tags).toEqual(expect.arrayContaining(['balance', 'anti_inflammatory']));
    }
  });
});

describe('High protein', () => {
  it('tags protein-packed whole-food meals only', () => {
    const tagged = RECIPES.filter((r) => r.tags.includes('high_protein'));
    for (const r of tagged) {
      expect(r.nutrition.protein, r.id).toBeGreaterThanOrEqual(40);
      expect((r.nutrition.protein * 4) / r.nutrition.kcal, r.id).toBeGreaterThanOrEqual(0.3);
      expect(proteinCheck(r).ok, r.id).toBe(true);
    }
    expect(tagged.length).toBeGreaterThanOrEqual(40);
    expect(RECIPE_BY_ID['steak-avocado-crispy-potatoes'].tags).toContain('high_protein');
  });

  it('plans protein-packed weeks within budget', () => {
    const p: Profile = { ...base, priorities: ['high_protein'], weeklyBudget: 120 };
    for (let seed = 1; seed <= 15; seed++) {
      const week = generateWeek({ profile: p, recipes: RECIPES, seed, ctx });
      expect(week.unfilled).toEqual([]);
      expect(week.overBudget).toBe(false);
      for (const m of week.meals) expect(RECIPE_BY_ID[m.recipeId].tags).toContain('high_protein');
    }
  });
});

describe('breakfast', () => {
  it('plans 21 meals for breakfast, lunch & dinner with breakfasts only at breakfast', () => {
    const p: Profile = { ...base, meals: ['breakfast', 'lunch', 'dinner'], weeklyBudget: 150 };
    for (let seed = 1; seed <= 10; seed++) {
      const res = generateWeek({ profile: p, recipes: RECIPES, seed, ctx });
      expect(res.meals).toHaveLength(21);
      expect(res.overBudget).toBe(false);
      for (const m of res.meals) expect(RECIPE_BY_ID[m.recipeId].breakfast, `${m.slot} ${m.recipeId}`).toBe(m.slot === 'breakfast');
      const bf = res.meals.filter((m) => m.slot === 'breakfast');
      expect(new Set(bf.map((m) => m.recipeId)).size).toBeGreaterThanOrEqual(4);
    }
  });

  it('fills every breakfast for a vegan by repeating, and keeps a High protein focus for mains', () => {
    const vegan = generateWeek({ profile: { ...base, diets: ['vegan'], meals: ['breakfast', 'dinner'] }, recipes: RECIPES, seed: 2, ctx });
    expect(vegan.meals.filter((m) => m.slot === 'breakfast')).toHaveLength(
      Math.min(7, RECIPES.filter((r) => r.breakfast && r.diets.includes('vegan')).length * BREAKFAST_REPEATS),
    );
    const hp = generateWeek({
      profile: { ...base, priorities: ['high_protein'], meals: ['breakfast', 'dinner'], weeklyBudget: 140 },
      recipes: RECIPES,
      seed: 4,
      ctx,
    });
    for (const m of hp.meals) if (m.slot === 'dinner') expect(RECIPE_BY_ID[m.recipeId].tags).toContain('high_protein');
  });

  it('swaps a breakfast only for breakfasts', () => {
    const p: Profile = { ...base, meals: ['breakfast', 'dinner'] };
    const week = generateWeek({ profile: p, recipes: RECIPES, seed: 9, ctx });
    const opts = swapOptions({ profile: p, recipes: RECIPES, seed: 9, ctx, meals: week.meals, key: { day: 2, slot: 'breakfast' } });
    expect(opts.length).toBeGreaterThan(3);
    for (const o of opts) expect(o.recipe.breakfast).toBe(true);
  });
});
