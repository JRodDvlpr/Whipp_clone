import { enrich } from '../../engine/enrich';
import type { Recipe, RecipeSource } from '../../types';
import { BATCH2_MEAT } from './batch2-meat';
import { BATCH2_VEGGIE } from './batch2-veggie';
import { BATCH3_MEAT } from './batch3-meat';
import { BATCH3_VEGGIE } from './batch3-veggie';
import { BALANCE_MEALS } from './balance';
import { BATCH4 } from './batch4';
import { CHICKEN } from './chicken';
import { PROTEIN_PLATES } from './protein';
import { MEAT } from './meat';
import { SEAFOOD } from './seafood';
import { VEGGIE } from './veggie';

export const RECIPE_SOURCES: RecipeSource[] = [
  ...CHICKEN,
  ...MEAT,
  ...SEAFOOD,
  ...VEGGIE,
  ...BATCH2_MEAT,
  ...BATCH2_VEGGIE,
  ...BATCH3_MEAT,
  ...BATCH3_VEGGIE,
  ...BATCH4,
  ...BALANCE_MEALS,
  ...PROTEIN_PLATES,
];

export const RECIPES: Recipe[] = RECIPE_SOURCES.map(enrich);

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
