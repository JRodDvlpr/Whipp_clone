import type { Recipe, RecipeSource } from '../types';
import { lineGrams } from './units';

/**
 * "High protein": a protein-packed plate, not just a big portion — 40 g+ protein a serving with at least
 * 30% of the calories coming from protein, from whole foods (no processed meat, nothing deep-fried).
 * Good for building or keeping muscle, recovery after training, and staying full.
 */
export const PROTEIN = { grams: 40, share: 0.3 } as const;

const PROCESSED = new Set(['sausages', 'bacon', 'chorizo']);
const FRIED = new Set(['breaded_fish', 'fries']);

export function proteinCheck(
  r: Pick<Recipe, 'ingredients' | 'serves' | 'nutrition'> | (Pick<RecipeSource, 'ingredients' | 'serves'> & { nutrition: Recipe['nutrition'] }),
) {
  const n = r.nutrition;
  const share = n.kcal ? (n.protein * 4) / n.kcal : 0;
  const ids = new Set(r.ingredients.filter((l) => lineGrams(l) > 0).map((l) => l[0]));
  const misses: string[] = [];
  if (n.protein < PROTEIN.grams) misses.push('protein');
  if (share < PROTEIN.share) misses.push('protein share');
  if ([...ids].some((id) => PROCESSED.has(id))) misses.push('processed meat');
  if ([...ids].some((id) => FRIED.has(id))) misses.push('fried');
  return { ok: misses.length === 0, grams: n.protein, share, misses };
}
