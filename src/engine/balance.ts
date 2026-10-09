import type { Recipe, RecipeSource } from '../types';
import { lineGrams } from './units';

/**
 * "Her Balance": meals for a woman losing weight who wants them to support hormones and nutrients.
 * Every rule is computed from the recipe's own ingredients and nutrition, so the label can't drift:
 *  - 350–650 kcal a serving: a satisfying meal inside a modest calorie deficit
 *  - ≥ 25 g protein: keeps you full and helps hold on to muscle while losing weight
 *  - ≥ 7 g fiber and ≤ 60 g net carbs (carbs minus fiber): steadier blood sugar (insulin) and a happy gut,
 *    which also helps clear used estrogen
 *  - little added sugar, no processed meat, nothing deep-fried
 *  - at least one nutrient women often run short on, in a real amount (iron, calcium, omega-3, folate-rich greens…)
 * It's general healthy-eating guidance, not medical advice.
 */
export const BALANCE = { kcal: [350, 650], protein: 25, fiber: 7, netCarbs: 60, sugar: 8 } as const;

export type Highlight = 'omega3' | 'iron' | 'calcium' | 'greens' | 'cruciferous' | 'legumes' | 'wholegrain';

export const HIGHLIGHTS: Record<Highlight, { label: string; why: string; ids: string[]; min?: number }> = {
  omega3: {
    label: 'Omega-3',
    why: 'Oily fish and walnut fats that calm inflammation and support mood and cycles.',
    ids: ['salmon', 'sardines', 'tuna', 'walnuts'],
  },
  iron: {
    label: 'Iron',
    why: 'Replaces what’s lost each month; low iron leaves you tired.',
    ids: [
      'steak',
      'ground_beef',
      'beef_chuck',
      'ground_lamb',
      'lamb_leg',
      'red_lentils',
      'green_lentils',
      'chickpeas',
      'black_beans',
      'kidney_beans',
      'tofu',
      'spinach',
      'kale',
      'edamame',
    ],
  },
  calcium: {
    label: 'Calcium',
    why: 'Protects bones, which matters more as estrogen falls with age.',
    ids: [
      'greek_yogurt',
      'feta',
      'parmesan',
      'cheddar',
      'mozzarella',
      'ricotta',
      'halloumi',
      'paneer',
      'milk',
      'tofu',
      'sardines',
      'kale',
      'bok_choy',
      'tahini',
      'sesame_seeds',
    ],
    min: 20,
  },
  greens: {
    label: 'Leafy greens',
    why: 'Folate and magnesium for energy, mood and PMS.',
    ids: ['spinach', 'kale', 'arugula', 'bok_choy', 'asparagus'],
  },
  cruciferous: {
    label: 'Cruciferous veg',
    why: 'Broccoli-family veg help the liver process estrogen.',
    ids: ['broccoli', 'cauliflower', 'cabbage', 'red_cabbage', 'bok_choy', 'kale', 'arugula'],
  },
  legumes: {
    label: 'Legumes',
    why: 'Fiber plus plant protein for steady blood sugar.',
    ids: ['red_lentils', 'green_lentils', 'chickpeas', 'black_beans', 'kidney_beans', 'butter_beans', 'cannellini', 'edamame', 'hummus'],
  },
  wholegrain: { label: 'Whole grains', why: 'Slow-release carbs that keep energy even.', ids: ['quinoa', 'freekeh', 'brown_rice'] },
};

const SUGARY: Record<string, number> = { sugar: 1, brown_sugar: 1, honey: 0.82, maple_syrup: 0.6, hoisin: 0.35, sweet_chili: 0.45, ketchup: 0.23 };
const PROCESSED = new Set(['sausages', 'bacon', 'chorizo']);
const FRIED = new Set(['breaded_fish', 'fries']);

/** Grams of each ingredient per serving. */
function perServing(src: Pick<RecipeSource, 'ingredients' | 'serves'>): Map<string, number> {
  const g = new Map<string, number>();
  for (const line of src.ingredients) g.set(line[0], (g.get(line[0]) ?? 0) + lineGrams(line) / src.serves);
  return g;
}

/** Nuts and seeds count in smaller amounts than veg, beans or fish. */
const SMALL = new Set(['walnuts', 'sesame_seeds', 'tahini']);

export function highlightsOf(src: Pick<RecipeSource, 'ingredients' | 'serves'>): Highlight[] {
  const g = perServing(src);
  const enough = (h: Highlight, id: string) => (g.get(id) ?? 0) >= (SMALL.has(id) ? 7 : (HIGHLIGHTS[h].min ?? 30));
  return (Object.keys(HIGHLIGHTS) as Highlight[]).filter((h) => HIGHLIGHTS[h].ids.some((id) => enough(h, id)));
}

/** Why a recipe is (or isn't) a Her Balance meal. */
export function balanceCheck(r: Pick<Recipe, 'ingredients' | 'serves' | 'nutrition'>): { ok: boolean; highlights: Highlight[]; misses: string[] } {
  const n = r.nutrition;
  const g = perServing(r);
  const sugar = [...g].reduce((s, [id, grams]) => s + grams * (SUGARY[id] ?? 0), 0);
  const highlights = highlightsOf(r);
  const misses: string[] = [];
  if (n.kcal < BALANCE.kcal[0] || n.kcal > BALANCE.kcal[1]) misses.push('calories');
  if (n.protein < BALANCE.protein) misses.push('protein');
  if (n.fiber < BALANCE.fiber) misses.push('fiber');
  if (n.carbs - n.fiber > BALANCE.netCarbs) misses.push('carbs');
  if (sugar > BALANCE.sugar) misses.push('added sugar');
  if ([...g.keys()].some((id) => PROCESSED.has(id))) misses.push('processed meat');
  if ([...g.keys()].some((id) => FRIED.has(id))) misses.push('fried');
  if (!highlights.length) misses.push('key nutrients');
  return { ok: misses.length === 0, highlights, misses };
}
