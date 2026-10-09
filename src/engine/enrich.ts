import { ING } from '../data/ingredients';
import { localPhoto, photoUrl } from '../data/photos';
import { antiInflammatoryCheck } from './antiInflammatory';
import { balanceCheck } from './balance';
import { proteinCheck } from './protein';
import type { Allergen, Diet, Nutrition, Priority, ProteinKind, Recipe, RecipeSource } from '../types';
import { lineGrams } from './units';

const PROTEIN_WEIGHT: Record<ProteinKind, number> = {
  chicken: 3,
  beef: 3,
  pork: 3,
  lamb: 3,
  turkey: 3,
  fish: 3,
  shellfish: 3,
  tofu: 2,
  cheese: 1.5,
  egg: 1.2,
  legume: 1,
};

export function nutritionOf(src: RecipeSource): Nutrition {
  const total = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const line of src.ingredients) {
    const ing = ING[line[0]];
    const g = lineGrams(line);
    const [kcal, p, c, f, fi] = ing.n;
    total.kcal += (kcal * g) / 100;
    total.protein += (p * g) / 100;
    total.carbs += (c * g) / 100;
    total.fat += (f * g) / 100;
    total.fiber += (fi * g) / 100;
  }
  const per = (v: number) => Math.round(v / src.serves);
  return { kcal: per(total.kcal), protein: per(total.protein), carbs: per(total.carbs), fat: per(total.fat), fiber: per(total.fiber) };
}

/** Derive diets and allergens from ingredients so tags can never lie. */
export function classify(src: RecipeSource): { diets: Diet[]; allergens: Allergen[] } {
  const animals = new Set<string>();
  const allergens = new Set<Allergen>();
  for (const [id] of src.ingredients) {
    const ing = ING[id];
    if (ing.animal) animals.add(ing.animal);
    ing.allergens?.forEach((a) => allergens.add(a));
  }
  const has = (...a: string[]) => a.some((x) => animals.has(x));
  const diets: Diet[] = [];
  if (!has('meat', 'poultry')) diets.push('pescatarian');
  if (!has('meat', 'poultry', 'fish', 'shellfish')) diets.push('vegetarian');
  if (animals.size === 0) diets.push('vegan');
  if (!allergens.has('gluten')) diets.push('gluten_free');
  if (!allergens.has('dairy')) diets.push('dairy_free');
  if (!allergens.has('peanut') && !allergens.has('tree_nut')) diets.push('nut_free');
  return { diets, allergens: [...allergens] };
}

function mainProteinOf(src: RecipeSource): ProteinKind | null {
  let best: ProteinKind | null = null;
  let bestScore = 0;
  for (const line of src.ingredients) {
    const kind = ING[line[0]].protein;
    if (!kind) continue;
    const score = lineGrams(line) * PROTEIN_WEIGHT[kind];
    if (score > bestScore) {
      best = kind;
      bestScore = score;
    }
  }
  return best;
}

export function enrich(src: RecipeSource): Recipe {
  const nutrition = nutritionOf(src);
  const { diets, allergens } = classify(src);
  const tags = new Set<Priority>(src.tags);
  if (src.time <= 30) tags.add('quick');
  // "High protein" is computed, never authored: 40 g+ and 30%+ of calories from protein (engine/protein.ts).
  tags.delete('high_protein');
  if (proteinCheck({ ingredients: src.ingredients, serves: src.serves, nutrition }).ok) tags.add('high_protein');
  if (nutrition.carbs <= 30) tags.add('low_carb');
  if (diets.includes('vegetarian')) tags.add('plant_forward');
  const check = { ingredients: src.ingredients, serves: src.serves, nutrition };
  if (balanceCheck(check).ok) tags.add('balance');
  if (antiInflammatoryCheck(check).ok) tags.add('anti_inflammatory');
  return {
    ...src,
    steps: src.steps.map((s) => (typeof s === 'string' ? { text: s } : s)),
    tags: [...tags],
    nutrition,
    diets,
    allergens,
    mainProtein: mainProteinOf(src),
    ingredientIds: src.ingredients.map((l) => l[0]),
    image: photoUrl(src.photo) ?? localPhoto(src.id),
    // Lunch-worthy: quick and on the lighter side (salads, soups, bowls, wraps, stir-fries).
    lunch: (src.time <= 30 && nutrition.kcal <= 720) || (tags.has('healthy') && src.time <= 35 && nutrition.kcal <= 700),
  };
}
