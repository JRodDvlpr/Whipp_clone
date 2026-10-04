import { ING } from '../data/ingredients';
import type { Country, PlannedMeal, Recipe } from '../types';
import { costOf, type PriceOverrides } from './pricing';
import { lineGrams } from './units';

export interface PriceContext {
  country: Country;
  storeId: string;
  overrides?: PriceOverrides;
}

/** Cost of one ingredient line at a given scale (0 for pantry staples). */
export function lineCost(line: Recipe['ingredients'][number], scale: number, ctx: PriceContext): number {
  if (ING[line[0]].pantry) return 0;
  return costOf(line[0], lineGrams(line, scale), ctx.country, ctx.storeId, ctx.overrides);
}

/** Total cost of a recipe for `servings`, excluding removed ingredients and pantry staples. */
export function recipeCost(recipe: Recipe, servings: number, ctx: PriceContext, removed: string[] = []): number {
  const scale = servings / recipe.serves;
  let total = 0;
  for (const line of recipe.ingredients) {
    if (removed.includes(line[0])) continue;
    total += lineCost(line, scale, ctx);
  }
  return total;
}

export const perServing = (recipe: Recipe, ctx: PriceContext) => recipeCost(recipe, recipe.serves, ctx) / recipe.serves;

export function mealCost(meal: PlannedMeal, recipes: Record<string, Recipe>, ctx: PriceContext): number {
  const r = recipes[meal.recipeId];
  return r ? recipeCost(r, meal.servings, ctx, meal.removed) : 0;
}

export function weekCost(meals: PlannedMeal[], recipes: Record<string, Recipe>, ctx: PriceContext): number {
  return meals.reduce((s, m) => s + mealCost(m, recipes, ctx), 0);
}
