// Core domain types shared by data, engine and UI.

export type Country = 'US' | 'UK' | 'CA' | 'AU';

export type Aisle = 'fruit_veg' | 'meat_fish' | 'chilled_dairy' | 'bakery' | 'cupboard' | 'frozen' | 'pantry';

export type Allergen = 'gluten' | 'dairy' | 'egg' | 'peanut' | 'tree_nut' | 'soy' | 'fish' | 'shellfish' | 'sesame';

export type AnimalSource = 'meat' | 'poultry' | 'fish' | 'shellfish' | 'dairy' | 'egg' | 'honey';

export type ProteinKind = 'chicken' | 'beef' | 'pork' | 'lamb' | 'turkey' | 'fish' | 'shellfish' | 'tofu' | 'egg' | 'legume' | 'cheese';

export type Diet = 'vegetarian' | 'vegan' | 'pescatarian' | 'gluten_free' | 'dairy_free' | 'nut_free';

export type Priority =
  | 'quick'
  | 'high_protein'
  | 'family'
  | 'healthy'
  | 'low_carb'
  | 'gut_friendly'
  | 'comfort'
  | 'plant_forward'
  | 'batch_cook'
  /** "Her Balance": weight-loss friendly, hormone-supportive meals (computed, see engine/balance.ts). */
  | 'balance';

/** Display-only tags shown on cards in addition to priorities. */
export type ExtraTag = 'budget' | 'one_pan' | 'veggie' | 'vegan' | 'spicy';

export type Appliance = 'stove' | 'oven' | 'air_fryer' | 'microwave' | 'rice_cooker';

/** How an ingredient is bought and shown on the grocery list. */
export type BuyAs = 'count' | 'weight' | 'volume';

export type PricePer = 'kg' | 'l' | 'each';

/** [price, per] e.g. [6.6, 'kg'] or [0.5, 'each'] */
export type Price = [number, PricePer];

export interface Ingredient {
  id: string;
  name: string;
  /** UK/AU name when different (coriander, spring onion, courgette...). */
  nameUK?: string;
  emoji: string;
  aisle: Aisle;
  /** kcal, protein g, carbs g, fat g, fiber g per 100 g. */
  n: [number, number, number, number, number];
  /** Grams per one whole item (needed when unit 'each' is used or price is per each). */
  each?: number;
  /** Grams per ml (default 1). Used for tbsp/tsp/cup/ml conversions. */
  density?: number;
  /** Override grams per cup when not density-derived (e.g. flour, rice). */
  cup?: number;
  allergens?: Allergen[];
  animal?: AnimalSource;
  protein?: ProteinKind;
  /** Pantry staples: shown as "Pantry", excluded from totals, pre-ticked on the list. */
  pantry?: boolean;
  buy: BuyAs;
  /** Typical shelf price. US and UK required; CA/AU derived when absent. */
  price: { US: Price; UK: Price; CA?: Price; AU?: Price };
}

export type Unit = 'g' | 'ml' | 'each' | 'tbsp' | 'tsp' | 'cup' | 'clove' | 'slice' | 'can' | 'pinch';

/** Recipe ingredient line: [ingredientId, qty, unit, note?] — compact for authoring. */
export type RecipeLine = [string, number, Unit, string?];

export interface Step {
  text: string;
  /** Optional timer in minutes offered in cook mode. */
  timer?: number;
}

/** Each entry is required; an inner array means "any one of these". */
export type ApplianceNeed = Appliance | Appliance[];

export interface RecipeSource {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  /** Total time in minutes. */
  time: number;
  /** Servings the quantities are written for. */
  serves: number;
  /** Authored priority tags. quick/high_protein/low_carb/plant_forward are also computed. */
  tags: Priority[];
  extra?: ExtraTag[];
  kid?: boolean;
  appliances: ApplianceNeed[];
  ingredients: RecipeLine[];
  steps: (string | Step)[];
  /** TheMealDB meal id for the photo — omitted recipes get an illustrated card. */
  photo?: string;
  /** Emoji + hue for the illustrated fallback card. */
  art?: { emoji: string; hue: number };
}

export interface Nutrition {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe extends Omit<RecipeSource, 'steps' | 'tags'> {
  steps: Step[];
  /** Authored + computed priority tags. */
  tags: Priority[];
  /** Per serving. */
  nutrition: Nutrition;
  diets: Diet[];
  allergens: Allergen[];
  mainProtein: ProteinKind | null;
  ingredientIds: string[];
  /** Resolved photo URL. */
  image?: string;
  /** Light and quick enough to offer as a lunch. */
  lunch: boolean;
}

export interface Store {
  id: string;
  name: string;
  country: Country;
  /** Brand colour for the text tile. */
  color: string;
  /** Multiplier on the country's base prices. */
  index: number;
  /** Website search URL; `{q}` is replaced by the encoded query. */
  search: string;
  home: string;
}

export type Slot = 'lunch' | 'dinner';

/** Identifies one meal in a week: a day and a slot. */
export interface MealKey {
  day: number;
  slot: Slot;
}

export interface Reminder {
  on: boolean;
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  /** "HH:MM", 24-hour. */
  time: string;
}

export interface Profile {
  country: Country;
  storeId: string;
  weeklyBudget: number;
  household: number;
  kidFriendly: boolean;
  diets: Diet[];
  allergens: Allergen[];
  dislikes: string[];
  priorities: Priority[];
  appliances: Appliance[];
  /** 0 = Monday … 6 = Sunday. */
  days: number[];
  /** Which meals to plan each day — Whipp's "Meals per day". */
  meals: Slot[];
  reminder: Reminder;
  units: 'auto' | 'metric' | 'imperial';
}

export interface PlannedMeal {
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  /** Missing on plans saved before lunches existed — treat as dinner. */
  slot?: Slot;
  recipeId: string;
  servings: number;
  removed: string[];
  locked?: boolean;
}

export interface WeekPlan {
  /** ISO date of the Monday, e.g. 2026-10-05. */
  week: string;
  createdAt: number;
  storeId: string;
  country: Country;
  budget: number;
  household: number;
  seed: number;
  meals: PlannedMeal[];
  /** Grocery list ticks keyed by ingredient id or custom item id. */
  checks: Record<string, boolean>;
  custom: { id: string; name: string }[];
  /** Set when the planner couldn't fit the budget. */
  overBudget?: boolean;
}
