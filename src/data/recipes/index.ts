import { enrich } from '../../engine/enrich';
import type { Recipe, RecipeSource } from '../../types';
import { CHICKEN } from './chicken';
import { MEAT } from './meat';
import { SEAFOOD } from './seafood';
import { VEGGIE } from './veggie';

export const RECIPE_SOURCES: RecipeSource[] = [...CHICKEN, ...MEAT, ...SEAFOOD, ...VEGGIE];

export const RECIPES: Recipe[] = RECIPE_SOURCES.map(enrich);

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
