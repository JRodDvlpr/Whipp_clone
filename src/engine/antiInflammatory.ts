import type { Recipe, RecipeSource } from '../types';
import { lineGrams } from './units';

/**
 * Anti-inflammatory meals, Mediterranean-style — the eating pattern with the best evidence for lowering
 * chronic inflammation (CRP, IL-6). Computed from each recipe's ingredients, so the badge can't drift:
 *  - no red or processed meat, nothing deep-fried, little added sugar
 *  - plenty of plants: 150 g+ vegetables (not counting potatoes) and 6 g+ fiber a serving
 *  - easy on saturated fat (cream, butter, hard cheese, coconut milk) and refined grains (white pasta, rice, bread)
 *  - at least two anti-inflammatory "stars" in real amounts: omega-3, olive oil, leafy or cruciferous greens,
 *    legumes, whole grains, colourful veg, turmeric or ginger, nuts and avocado
 * General healthy-eating guidance, not medical advice.
 */
export const ANTI = { vegGrams: 150, fiber: 6, satFatFoods: 30, refined: 50, sugar: 8, stars: 2 } as const;

export type Star = 'omega3' | 'olive_oil' | 'greens' | 'cruciferous' | 'legumes' | 'wholegrain' | 'colour' | 'spice' | 'good_fats';

export const STARS: Record<Star, { label: string; why: string; ids: string[]; min: number }> = {
  omega3: {
    label: 'Omega-3',
    why: 'Oily fish and walnut fats turn down the body’s inflammation signals.',
    ids: ['salmon', 'sardines', 'tuna', 'walnuts'],
    min: 30,
  },
  olive_oil: { label: 'Olive oil', why: 'Its polyphenols work like a gentle, natural anti-inflammatory.', ids: ['olive_oil'], min: 5 },
  greens: {
    label: 'Leafy greens',
    why: 'Vitamin K, folate and antioxidants that calm inflammation.',
    ids: ['spinach', 'kale', 'arugula', 'bok_choy', 'asparagus'],
    min: 30,
  },
  cruciferous: {
    label: 'Cruciferous veg',
    why: 'Broccoli-family veg contain sulforaphane, which switches on the body’s own antioxidant defences.',
    ids: ['broccoli', 'cauliflower', 'cabbage', 'red_cabbage', 'bok_choy', 'kale', 'arugula'],
    min: 40,
  },
  legumes: {
    label: 'Legumes',
    why: 'Fiber feeds gut bacteria that make anti-inflammatory short-chain fats.',
    ids: ['red_lentils', 'green_lentils', 'chickpeas', 'black_beans', 'kidney_beans', 'butter_beans', 'cannellini', 'edamame', 'hummus'],
    min: 40,
  },
  wholegrain: {
    label: 'Whole grains',
    why: 'Whole grains are linked to lower CRP, a key inflammation marker.',
    ids: ['quinoa', 'freekeh', 'brown_rice'],
    min: 25,
  },
  colour: {
    label: 'Colourful veg',
    why: 'Red, orange and purple veg are rich in carotenoids and polyphenols.',
    ids: [
      'tomato',
      'cherry_tomatoes',
      'canned_tomatoes',
      'red_pepper',
      'sweet_potato',
      'butternut',
      'carrot',
      'red_cabbage',
      'eggplant',
      'pomegranate',
    ],
    min: 80,
  },
  spice: {
    label: 'Turmeric & ginger',
    why: 'Curcumin and gingerols have well-studied anti-inflammatory effects.',
    ids: ['turmeric', 'ginger'],
    min: 1.5,
  },
  good_fats: {
    label: 'Nuts & avocado',
    why: 'Unsaturated fats and vitamin E that support healthy cells.',
    ids: ['avocado', 'walnuts', 'cashews', 'tahini'],
    min: 15,
  },
};

const RED_OR_PROCESSED = new Set([
  'ground_beef',
  'steak',
  'beef_chuck',
  'pork_chop',
  'pork_tenderloin',
  'ground_pork',
  'ground_lamb',
  'lamb_leg',
  'sausages',
  'bacon',
  'chorizo',
]);
const FRIED = new Set(['breaded_fish', 'fries']);
const SUGARY: Record<string, number> = { sugar: 1, brown_sugar: 1, honey: 0.82, maple_syrup: 0.6, hoisin: 0.35, sweet_chili: 0.45, ketchup: 0.23 };
const SAT_FAT_FOODS = new Set([
  'heavy_cream',
  'butter',
  'sour_cream',
  'cheddar',
  'mozzarella',
  'parmesan',
  'halloumi',
  'paneer',
  'coconut_milk',
  'mayo',
]);
const REFINED = new Set([
  'spaghetti',
  'linguine',
  'penne',
  'rigatoni',
  'fusilli',
  'orzo',
  'fettuccine',
  'lasagne_sheets',
  'cannelloni',
  'macaroni',
  'egg_noodles',
  'rice_noodles',
  'udon',
  'jasmine_rice',
  'basmati_rice',
  'arborio_rice',
  'couscous',
  'flour_tortilla',
  'pita',
  'naan',
  'baguette',
  'burger_bun',
  'pizza_dough',
  'gnocchi',
  'panko',
  'flour',
]);
/** Veg that count towards the 150 g (herbs, lemons and potatoes don't). */
const VEG = new Set([
  'onion',
  'red_onion',
  'shallot',
  'scallion',
  'red_pepper',
  'green_pepper',
  'broccoli',
  'carrot',
  'cherry_tomatoes',
  'tomato',
  'canned_tomatoes',
  'passata',
  'spinach',
  'zucchini',
  'eggplant',
  'mushrooms',
  'sweet_potato',
  'butternut',
  'cucumber',
  'lettuce',
  'green_beans',
  'snap_peas',
  'cabbage',
  'red_cabbage',
  'bok_choy',
  'fennel',
  'celery',
  'bean_sprouts',
  'kale',
  'asparagus',
  'corn_cob',
  'cauliflower',
  'arugula',
  'peas',
  'mixed_veg',
  'avocado',
  'pomegranate',
]);

function perServing(src: Pick<RecipeSource, 'ingredients' | 'serves'>): Map<string, number> {
  const g = new Map<string, number>();
  for (const line of src.ingredients) g.set(line[0], (g.get(line[0]) ?? 0) + lineGrams(line) / src.serves);
  return g;
}

const sum = (g: Map<string, number>, keep: (id: string) => boolean, w: (id: string) => number = () => 1) =>
  [...g].reduce((t, [id, grams]) => t + (keep(id) ? grams * w(id) : 0), 0);

export function starsOf(src: Pick<RecipeSource, 'ingredients' | 'serves'>): Star[] {
  const g = perServing(src);
  return (Object.keys(STARS) as Star[]).filter((s) => STARS[s].ids.some((id) => (g.get(id) ?? 0) >= STARS[s].min));
}

/** Why a recipe is (or isn't) anti-inflammatory. */
export function antiInflammatoryCheck(r: Pick<Recipe, 'ingredients' | 'serves' | 'nutrition'>): {
  ok: boolean;
  stars: Star[];
  misses: string[];
  vegGrams: number;
} {
  const g = perServing(r);
  const has = (set: Set<string>) => [...g.keys()].some((id) => set.has(id));
  const stars = starsOf(r);
  const misses: string[] = [];
  if (has(RED_OR_PROCESSED)) misses.push('red or processed meat');
  if (has(FRIED)) misses.push('fried');
  if (
    sum(
      g,
      (id) => id in SUGARY,
      (id) => SUGARY[id],
    ) > ANTI.sugar
  )
    misses.push('added sugar');
  if (r.nutrition.fiber < ANTI.fiber) misses.push('fiber');
  const vegGrams = Math.round(sum(g, (id) => VEG.has(id)));
  if (vegGrams < ANTI.vegGrams) misses.push('vegetables');
  if (sum(g, (id) => SAT_FAT_FOODS.has(id)) > ANTI.satFatFoods) misses.push('saturated fat');
  if (sum(g, (id) => REFINED.has(id)) > ANTI.refined) misses.push('refined grains');
  if (stars.length < ANTI.stars) misses.push('anti-inflammatory foods');
  return { ok: misses.length === 0, stars, misses, vegGrams };
}
