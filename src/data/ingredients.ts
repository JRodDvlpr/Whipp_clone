import type { Aisle, Allergen, AnimalSource, BuyAs, Ingredient, Price, ProteinKind } from '../types';

// Canonical ingredient catalog — the single source of truth for nutrition, allergens and prices.
//
// n:     kcal, protein, carbs, fat, fiber per 100 g (USDA / McCance & Widdowson reference values, rounded)
// price: typical 2026 shelf price. US = Walmart, UK = Tesco. CA/AU are derived in engine/pricing.ts.
// each:  grams per whole item / can (drained weight for beans).

type Opts = {
  uk?: string;
  each?: number;
  density?: number;
  cup?: number;
  allergens?: Allergen[];
  animal?: AnimalSource;
  protein?: ProteinKind;
  pantry?: boolean;
  buy?: BuyAs;
  countUnit?: string;
};

export interface CatalogIngredient extends Ingredient {
  /** Shown after counts on the list, e.g. "2 cans". */
  countUnit?: string;
}

const make =
  (aisle: Aisle, defaultBuy: BuyAs) =>
  (id: string, name: string, emoji: string, n: Ingredient['n'], us: Price, uk: Price, o: Opts = {}): CatalogIngredient => ({
    id,
    name,
    nameUK: o.uk,
    emoji,
    aisle,
    n,
    each: o.each,
    density: o.density,
    cup: o.cup,
    allergens: o.allergens,
    animal: o.animal,
    protein: o.protein,
    pantry: o.pantry,
    buy: o.buy ?? defaultBuy,
    countUnit: o.countUnit,
    price: { US: us, UK: uk },
  });

const veg = make('fruit_veg', 'weight');
const meat = make('meat_fish', 'weight');
const dairy = make('chilled_dairy', 'weight');
const bakery = make('bakery', 'count');
const cupboard = make('cupboard', 'weight');
const frozen = make('frozen', 'weight');
const pantry = (id: string, name: string, emoji: string, n: Ingredient['n'], us: Price, uk: Price, o: Opts = {}) =>
  make('pantry', 'weight')(id, name, emoji, n, us, uk, { ...o, pantry: true });

const SPICE: Ingredient['n'] = [300, 12, 50, 10, 25];
const OIL: Ingredient['n'] = [884, 0, 0, 100, 0];

export const INGREDIENTS: CatalogIngredient[] = [
  // ── Fruit & veg ────────────────────────────────────────────────────────────
  veg('onion', 'Onion', '🧅', [40, 1.1, 9.3, 0.1, 1.7], [0.4, 'each'], [0.18, 'each'], { each: 150, buy: 'count' }),
  veg('red_onion', 'Red Onion', '🧅', [40, 1.1, 9.3, 0.1, 1.7], [0.55, 'each'], [0.25, 'each'], { each: 150, buy: 'count' }),
  veg('shallot', 'Shallot', '🧅', [72, 2.5, 17, 0.1, 3.2], [0.4, 'each'], [0.2, 'each'], { each: 40, buy: 'count' }),
  veg('ginger', 'Ginger', '🫚', [80, 1.8, 18, 0.8, 2], [7.5, 'kg'], [6, 'kg'], { density: 0.4 }),
  veg('scallion', 'Scallion', '🧅', [32, 1.8, 7.3, 0.2, 2.6], [0.11, 'each'], [0.09, 'each'], { uk: 'Spring Onion', each: 15, buy: 'count' }),
  veg('red_pepper', 'Red Bell Pepper', '🫑', [31, 1, 6, 0.3, 2.1], [1.0, 'each'], [0.55, 'each'], { uk: 'Red Pepper', each: 160, buy: 'count' }),
  veg('green_pepper', 'Green Bell Pepper', '🫑', [20, 0.9, 4.6, 0.2, 1.7], [0.8, 'each'], [0.5, 'each'], {
    uk: 'Green Pepper',
    each: 160,
    buy: 'count',
  }),
  veg('broccoli', 'Broccoli', '🥦', [34, 2.8, 6.6, 0.4, 2.6], [4.4, 'kg'], [2.1, 'kg']),
  veg('carrot', 'Carrot', '🥕', [41, 0.9, 9.6, 0.2, 2.8], [0.12, 'each'], [0.06, 'each'], { each: 70, buy: 'count' }),
  veg('cherry_tomatoes', 'Cherry Tomatoes', '🍅', [18, 0.9, 3.9, 0.2, 1.2], [8.8, 'kg'], [4.8, 'kg']),
  veg('tomato', 'Tomato', '🍅', [18, 0.9, 3.9, 0.2, 1.2], [0.5, 'each'], [0.25, 'each'], { each: 120, buy: 'count' }),
  veg('spinach', 'Baby Spinach', '🥬', [23, 2.9, 3.6, 0.4, 2.2], [10.5, 'kg'], [5.5, 'kg']),
  veg('zucchini', 'Zucchini', '🥒', [17, 1.2, 3.1, 0.3, 1], [0.75, 'each'], [0.45, 'each'], { uk: 'Courgette', each: 200, buy: 'count' }),
  veg('eggplant', 'Eggplant', '🍆', [25, 1, 6, 0.2, 3], [1.5, 'each'], [0.8, 'each'], { uk: 'Aubergine', each: 300, buy: 'count' }),
  veg('mushrooms', 'Mushrooms', '🍄', [22, 3.1, 3.3, 0.3, 1], [9, 'kg'], [3.6, 'kg']),
  veg('potato', 'Potatoes', '🥔', [77, 2, 17, 0.1, 2.2], [1.9, 'kg'], [1.0, 'kg'], { each: 300 }),
  veg('baby_potatoes', 'Baby Potatoes', '🥔', [70, 1.9, 15.9, 0.1, 1.8], [4.2, 'kg'], [1.8, 'kg'], { uk: 'New Potatoes' }),
  veg('sweet_potato', 'Sweet Potato', '🍠', [86, 1.6, 20, 0.1, 3], [2.6, 'kg'], [1.5, 'kg']),
  veg('butternut', 'Butternut Squash', '🎃', [45, 1, 11.7, 0.1, 2], [3.3, 'kg'], [1.3, 'kg']),
  veg('cucumber', 'Cucumber', '🥒', [15, 0.7, 3.6, 0.1, 0.5], [0.7, 'each'], [0.6, 'each'], { each: 300, buy: 'count' }),
  veg('lettuce', 'Romaine Lettuce', '🥬', [17, 1.2, 3.3, 0.3, 2.1], [1.0, 'each'], [0.5, 'each'], {
    uk: 'Little Gem Lettuce',
    each: 250,
    buy: 'count',
  }),
  veg('avocado', 'Avocado', '🥑', [160, 2, 8.5, 14.7, 6.7], [0.95, 'each'], [0.7, 'each'], { each: 150, buy: 'count' }),
  veg('lemon', 'Lemon', '🍋', [29, 1.1, 9, 0.3, 2.8], [0.6, 'each'], [0.3, 'each'], { each: 100, buy: 'count' }),
  veg('lime', 'Lime', '🍋‍🟩', [30, 0.7, 10.5, 0.2, 2.8], [0.32, 'each'], [0.3, 'each'], { each: 67, buy: 'count' }),
  veg('cilantro', 'Cilantro', '🌿', [23, 2.1, 3.7, 0.5, 2.8], [0.8, 'each'], [0.75, 'each'], { uk: 'Coriander', each: 30, density: 0.15 }),
  veg('parsley', 'Parsley', '🌿', [36, 3, 6.3, 0.8, 3.3], [0.8, 'each'], [0.75, 'each'], { each: 30, density: 0.15 }),
  veg('basil', 'Basil', '🌿', [23, 3.2, 2.7, 0.6, 1.6], [2.4, 'each'], [0.8, 'each'], { each: 21, density: 0.1 }),
  veg('mint', 'Mint', '🌿', [44, 3.3, 8.4, 0.7, 6.8], [2.4, 'each'], [0.8, 'each'], { each: 21, density: 0.1 }),
  veg('green_beans', 'Green Beans', '🫛', [31, 1.8, 7, 0.2, 2.7], [4.4, 'kg'], [4, 'kg']),
  veg('snap_peas', 'Sugar Snap Peas', '🫛', [42, 2.8, 7.5, 0.2, 2.6], [9, 'kg'], [6, 'kg']),
  veg('cabbage', 'Green Cabbage', '🥬', [25, 1.3, 5.8, 0.1, 2.5], [2, 'kg'], [0.9, 'kg']),
  veg('red_cabbage', 'Red Cabbage', '🥬', [31, 1.4, 7.4, 0.2, 2.1], [2.4, 'kg'], [1, 'kg']),
  veg('bok_choy', 'Bok Choy', '🥬', [13, 1.5, 2.2, 0.2, 1], [4.4, 'kg'], [5, 'kg'], { uk: 'Pak Choi' }),
  veg('fennel', 'Fennel', '🌱', [31, 1.2, 7.3, 0.2, 3.1], [2.5, 'each'], [1, 'each'], { each: 250, buy: 'count' }),
  veg('celery', 'Celery', '🥬', [16, 0.7, 3, 0.2, 1.6], [3.2, 'kg'], [1.8, 'kg']),
  veg('chili', 'Red Chili', '🌶️', [40, 1.9, 9, 0.4, 1.5], [0.2, 'each'], [0.2, 'each'], { uk: 'Red Chilli', each: 15, buy: 'count' }),
  veg('jalapeno', 'Jalapeño', '🌶️', [29, 0.9, 6.5, 0.4, 2.8], [0.12, 'each'], [0.25, 'each'], { each: 20, buy: 'count' }),
  veg('apple', 'Apple', '🍎', [52, 0.3, 14, 0.2, 2.4], [0.6, 'each'], [0.3, 'each'], { each: 180, buy: 'count' }),
  veg('bean_sprouts', 'Bean Sprouts', '🌱', [30, 3, 6, 0.2, 1.8], [5.5, 'kg'], [3, 'kg']),
  veg('kale', 'Kale', '🥬', [49, 4.3, 8.8, 0.9, 3.6], [8, 'kg'], [4, 'kg']),
  veg('asparagus', 'Asparagus', '🌱', [20, 2.2, 3.9, 0.1, 2.1], [8.8, 'kg'], [8, 'kg']),
  veg('mango', 'Mango', '🥭', [60, 0.8, 15, 0.4, 1.6], [1, 'each'], [0.9, 'each'], { each: 200, buy: 'count' }),
  veg('pineapple', 'Pineapple', '🍍', [50, 0.5, 13, 0.1, 1.4], [2.5, 'each'], [1.2, 'each'], { each: 900, buy: 'count' }),
  veg('corn_cob', 'Corn on the Cob', '🌽', [86, 3.3, 19, 1.4, 2.4], [0.5, 'each'], [0.5, 'each'], { each: 150, buy: 'count' }),

  // ── Meat & fish ────────────────────────────────────────────────────────────
  meat('chicken_breast', 'Chicken Breast', '🍗', [120, 22.5, 0, 2.6, 0], [7.3, 'kg'], [6.6, 'kg'], { animal: 'poultry', protein: 'chicken' }),
  meat('chicken_thigh', 'Chicken Thigh', '🍗', [135, 19, 0, 6, 0], [6.6, 'kg'], [6, 'kg'], { animal: 'poultry', protein: 'chicken' }),
  meat('chicken_drumstick', 'Chicken Drumsticks', '🍗', [115, 13, 0, 7, 0], [3.3, 'kg'], [3, 'kg'], { animal: 'poultry', protein: 'chicken' }),
  meat('ground_beef', 'Ground Beef', '🥩', [215, 18.6, 0, 15, 0], [11.9, 'kg'], [7, 'kg'], { uk: 'Beef Mince', animal: 'meat', protein: 'beef' }),
  meat('steak', 'Sirloin Steak', '🥩', [160, 21, 0, 8, 0], [20, 'kg'], [17, 'kg'], { animal: 'meat', protein: 'beef' }),
  meat('pork_chop', 'Pork Loin Chop', '🥩', [150, 21, 0, 7, 0], [7.7, 'kg'], [7, 'kg'], { each: 170, animal: 'meat', protein: 'pork' }),
  meat('pork_tenderloin', 'Pork Tenderloin', '🥩', [120, 21, 0, 3.5, 0], [8.8, 'kg'], [9, 'kg'], {
    uk: 'Pork Fillet',
    animal: 'meat',
    protein: 'pork',
  }),
  meat('ground_pork', 'Ground Pork', '🥩', [263, 17, 0, 21, 0], [8.8, 'kg'], [6, 'kg'], { uk: 'Pork Mince', animal: 'meat', protein: 'pork' }),
  meat('sausages', 'Pork Sausages', '🌭', [300, 13, 3, 26, 0], [9.5, 'kg'], [6, 'kg'], {
    each: 67,
    animal: 'meat',
    protein: 'pork',
    allergens: ['gluten'],
  }),
  meat('bacon', 'Smoked Bacon', '🥓', [417, 12.6, 1.4, 40, 0], [13.2, 'kg'], [9, 'kg'], { animal: 'meat', protein: 'pork' }),
  meat('chorizo', 'Chorizo', '🌭', [455, 24, 2, 38, 0], [15, 'kg'], [13, 'kg'], { animal: 'meat', protein: 'pork' }),
  meat('ground_lamb', 'Ground Lamb', '🥩', [282, 16.6, 0, 23.4, 0], [19.8, 'kg'], [10, 'kg'], { uk: 'Lamb Mince', animal: 'meat', protein: 'lamb' }),
  meat('lamb_leg', 'Lamb Leg Steaks', '🥩', [165, 20, 0, 9, 0], [22, 'kg'], [16, 'kg'], { animal: 'meat', protein: 'lamb' }),
  meat('ground_turkey', 'Ground Turkey', '🦃', [150, 19.7, 0, 8, 0], [8.8, 'kg'], [8, 'kg'], {
    uk: 'Turkey Mince',
    animal: 'poultry',
    protein: 'turkey',
  }),
  meat('salmon', 'Salmon Fillet', '🐟', [208, 20, 0, 13, 0], [21, 'kg'], [17, 'kg'], {
    each: 140,
    animal: 'fish',
    protein: 'fish',
    allergens: ['fish'],
  }),
  meat('white_fish', 'White Fish Fillet', '🐟', [82, 18, 0, 0.7, 0], [11, 'kg'], [13, 'kg'], {
    uk: 'Cod Fillet',
    animal: 'fish',
    protein: 'fish',
    allergens: ['fish'],
  }),
  meat('shrimp', 'Raw Shrimp', '🦐', [85, 20, 0, 0.5, 0], [17.6, 'kg'], [15, 'kg'], {
    uk: 'King Prawns',
    animal: 'shellfish',
    protein: 'shellfish',
    allergens: ['shellfish'],
  }),
  meat('smoked_haddock', 'Smoked Haddock', '🐟', [101, 23, 0, 0.6, 0], [22, 'kg'], [14, 'kg'], {
    animal: 'fish',
    protein: 'fish',
    allergens: ['fish'],
  }),

  // ── Chilled & dairy ────────────────────────────────────────────────────────
  dairy('eggs', 'Eggs', '🥚', [143, 12.6, 0.7, 9.5, 0], [0.26, 'each'], [0.27, 'each'], {
    each: 50,
    buy: 'count',
    animal: 'egg',
    protein: 'egg',
    allergens: ['egg'],
  }),
  dairy('tofu', 'Firm Tofu', '🧊', [144, 15.8, 3, 8.7, 2.3], [5, 'kg'], [6, 'kg'], { protein: 'tofu', allergens: ['soy'] }),
  dairy('halloumi', 'Halloumi', '🧀', [321, 21, 1.6, 25, 0], [24, 'kg'], [10, 'kg'], { animal: 'dairy', protein: 'cheese', allergens: ['dairy'] }),
  dairy('paneer', 'Paneer', '🧀', [321, 25, 3.6, 25, 0], [20, 'kg'], [9, 'kg'], { animal: 'dairy', protein: 'cheese', allergens: ['dairy'] }),
  dairy('feta', 'Feta', '🧀', [264, 14, 4, 21, 0], [18, 'kg'], [9, 'kg'], { animal: 'dairy', allergens: ['dairy'] }),
  dairy('parmesan', 'Parmesan', '🧀', [392, 36, 3, 26, 0], [26, 'kg'], [14, 'kg'], { animal: 'dairy', allergens: ['dairy'] }),
  dairy('cheddar', 'Cheddar', '🧀', [403, 25, 1.3, 33, 0], [9.5, 'kg'], [8, 'kg'], { animal: 'dairy', allergens: ['dairy'] }),
  dairy('mozzarella', 'Mozzarella', '🧀', [300, 22, 2.2, 22, 0], [9.5, 'kg'], [8, 'kg'], { animal: 'dairy', allergens: ['dairy'] }),
  dairy('ricotta', 'Ricotta', '🧀', [174, 11, 3, 13, 0], [8.2, 'kg'], [6, 'kg'], { animal: 'dairy', allergens: ['dairy'] }),
  dairy('greek_yogurt', 'Greek Yogurt', '🥛', [97, 9, 3.9, 5, 0], [5, 'kg'], [3, 'kg'], {
    uk: 'Greek Yoghurt',
    density: 1.05,
    animal: 'dairy',
    allergens: ['dairy'],
  }),
  dairy('sour_cream', 'Sour Cream', '🥛', [198, 2.4, 4.6, 19, 0], [4.4, 'kg'], [4.4, 'kg'], {
    uk: 'Soured Cream',
    density: 1,
    animal: 'dairy',
    allergens: ['dairy'],
  }),
  dairy('heavy_cream', 'Heavy Cream', '🥛', [340, 2.8, 2.8, 36, 0], [5.5, 'l'], [4, 'l'], {
    uk: 'Double Cream',
    buy: 'volume',
    animal: 'dairy',
    allergens: ['dairy'],
  }),
  dairy('milk', 'Milk', '🥛', [61, 3.2, 4.8, 3.3, 0], [1.0, 'l'], [0.75, 'l'], {
    buy: 'volume',
    density: 1.03,
    animal: 'dairy',
    allergens: ['dairy'],
  }),
  dairy('hummus', 'Hummus', '🫘', [166, 8, 14, 10, 6], [8, 'kg'], [4, 'kg'], { allergens: ['sesame'] }),

  // ── Bakery ────────────────────────────────────────────────────────────────
  bakery('flour_tortilla', 'Flour Tortillas', '🫓', [312, 8, 52, 8, 3], [0.3, 'each'], [0.15, 'each'], {
    uk: 'Tortilla Wraps',
    each: 45,
    allergens: ['gluten'],
  }),
  bakery('corn_tortilla', 'Corn Tortillas', '🌮', [218, 5.7, 45, 2.9, 6], [0.08, 'each'], [0.2, 'each'], { each: 26 }),
  bakery('pita', 'Pita Bread', '🫓', [275, 9, 56, 1.2, 2.2], [0.4, 'each'], [0.15, 'each'], { each: 60, allergens: ['gluten'] }),
  bakery('naan', 'Naan Bread', '🫓', [290, 9, 50, 6, 2], [0.9, 'each'], [0.5, 'each'], { each: 90, allergens: ['gluten', 'dairy'], animal: 'dairy' }),
  bakery('baguette', 'Crusty Bread', '🥖', [270, 9, 52, 3, 2.5], [1.5, 'each'], [0.85, 'each'], { each: 250, allergens: ['gluten'] }),
  bakery('burger_bun', 'Burger Buns', '🍞', [279, 9, 50, 4.5, 2.5], [0.35, 'each'], [0.2, 'each'], { each: 55, allergens: ['gluten'] }),

  // ── Cupboard ──────────────────────────────────────────────────────────────
  cupboard('jasmine_rice', 'Jasmine Rice', '🍚', [365, 7, 80, 0.6, 1.3], [2.6, 'kg'], [2.2, 'kg'], { cup: 185 }),
  cupboard('basmati_rice', 'Basmati Rice', '🍚', [360, 8, 78, 0.9, 1.2], [3.5, 'kg'], [2.4, 'kg'], { cup: 185 }),
  cupboard('arborio_rice', 'Arborio Rice', '🍚', [355, 7, 79, 0.6, 1.4], [5.5, 'kg'], [3.2, 'kg'], { uk: 'Risotto Rice', cup: 200 }),
  cupboard('spaghetti', 'Spaghetti', '🍝', [371, 13, 75, 1.5, 3.2], [2.2, 'kg'], [1.2, 'kg'], { allergens: ['gluten'] }),
  cupboard('linguine', 'Linguine', '🍝', [371, 13, 75, 1.5, 3.2], [3, 'kg'], [1.8, 'kg'], { allergens: ['gluten'] }),
  cupboard('penne', 'Penne', '🍝', [371, 13, 75, 1.5, 3.2], [2.2, 'kg'], [1.2, 'kg'], { allergens: ['gluten'] }),
  cupboard('rigatoni', 'Rigatoni', '🍝', [371, 13, 75, 1.5, 3.2], [2.6, 'kg'], [1.4, 'kg'], { allergens: ['gluten'] }),
  cupboard('fusilli', 'Fusilli', '🍝', [371, 13, 75, 1.5, 3.2], [2.2, 'kg'], [1.2, 'kg'], { allergens: ['gluten'] }),
  cupboard('orzo', 'Orzo', '🍝', [371, 13, 75, 1.5, 3.2], [4.4, 'kg'], [2.5, 'kg'], { allergens: ['gluten'], cup: 180 }),
  cupboard('fettuccine', 'Fettuccine', '🍝', [371, 13, 75, 1.5, 3.2], [3, 'kg'], [1.8, 'kg'], { allergens: ['gluten'] }),
  cupboard('lasagne_sheets', 'Lasagna Sheets', '🍝', [371, 13, 75, 1.5, 3.2], [4, 'kg'], [2.4, 'kg'], {
    uk: 'Lasagne Sheets',
    allergens: ['gluten'],
  }),
  cupboard('cannelloni', 'Cannelloni Tubes', '🍝', [371, 13, 75, 1.5, 3.2], [7, 'kg'], [4, 'kg'], { allergens: ['gluten'] }),
  cupboard('egg_noodles', 'Egg Noodles', '🍜', [384, 14, 71, 4.4, 3.3], [5, 'kg'], [3, 'kg'], { allergens: ['gluten', 'egg'], animal: 'egg' }),
  cupboard('rice_noodles', 'Rice Noodles', '🍜', [364, 6, 80, 0.6, 1.6], [6, 'kg'], [5, 'kg']),
  cupboard('udon', 'Udon Noodles', '🍜', [127, 3, 26, 0.4, 1], [6, 'kg'], [4, 'kg'], { allergens: ['gluten'] }),
  cupboard('quinoa', 'Quinoa', '🌾', [368, 14, 64, 6, 7], [8, 'kg'], [6, 'kg'], { cup: 170 }),
  cupboard('freekeh', 'Freekeh', '🌾', [325, 13, 61, 2.5, 13], [12, 'kg'], [8, 'kg'], { cup: 160, allergens: ['gluten'] }),
  cupboard('couscous', 'Couscous', '🌾', [376, 13, 77, 0.6, 5], [6, 'kg'], [2.5, 'kg'], { cup: 175, allergens: ['gluten'] }),
  cupboard('red_lentils', 'Red Lentils', '🫘', [358, 24, 63, 2.2, 11], [3.3, 'kg'], [2.5, 'kg'], { cup: 190, protein: 'legume' }),
  cupboard('chickpeas', 'Chickpeas', '🫘', [139, 7, 22, 2.6, 6.4], [0.95, 'each'], [0.6, 'each'], {
    each: 240,
    buy: 'count',
    countUnit: 'can',
    protein: 'legume',
  }),
  cupboard('black_beans', 'Black Beans', '🫘', [91, 6, 16, 0.3, 6.9], [0.95, 'each'], [0.65, 'each'], {
    each: 240,
    buy: 'count',
    countUnit: 'can',
    protein: 'legume',
  }),
  cupboard('kidney_beans', 'Kidney Beans', '🫘', [100, 7, 17, 0.5, 6], [0.95, 'each'], [0.55, 'each'], {
    each: 240,
    buy: 'count',
    countUnit: 'can',
    protein: 'legume',
  }),
  cupboard('butter_beans', 'Butter Beans', '🫘', [95, 6, 17, 0.4, 5], [1.2, 'each'], [0.65, 'each'], {
    each: 240,
    buy: 'count',
    countUnit: 'can',
    protein: 'legume',
  }),
  cupboard('cannellini', 'Cannellini Beans', '🫘', [100, 7, 16, 0.4, 6], [1.1, 'each'], [0.6, 'each'], {
    each: 240,
    buy: 'count',
    countUnit: 'can',
    protein: 'legume',
  }),
  cupboard('canned_tomatoes', 'Diced Tomatoes', '🥫', [21, 1, 4, 0.2, 1], [1.0, 'each'], [0.45, 'each'], {
    uk: 'Chopped Tomatoes',
    each: 400,
    buy: 'count',
    countUnit: 'can',
  }),
  cupboard('passata', 'Tomato Sauce', '🥫', [30, 1.4, 5.5, 0.2, 1.2], [2.6, 'kg'], [1.3, 'kg'], { uk: 'Passata', density: 1.03 }),
  cupboard('tomato_paste', 'Tomato Paste', '🥫', [82, 4.3, 19, 0.5, 4], [4.7, 'kg'], [3, 'kg'], { uk: 'Tomato Purée', density: 1.1 }),
  cupboard('coconut_milk', 'Coconut Milk', '🥥', [197, 2, 3, 21, 0], [1.9, 'each'], [1.3, 'each'], { each: 400, buy: 'count', countUnit: 'can' }),
  cupboard('chicken_stock', 'Chicken Broth', '🥣', [6, 0.6, 0.4, 0.2, 0], [2.2, 'l'], [1.0, 'l'], {
    uk: 'Chicken Stock',
    buy: 'volume',
    animal: 'poultry',
  }),
  cupboard('veg_stock', 'Vegetable Broth', '🥣', [5, 0.2, 1, 0.1, 0], [2.2, 'l'], [1.0, 'l'], { uk: 'Vegetable Stock', buy: 'volume' }),
  cupboard('corn', 'Sweet Corn', '🌽', [86, 3.3, 19, 1.4, 2.4], [3, 'kg'], [2.8, 'kg'], { uk: 'Sweetcorn' }),
  cupboard('sesame_oil', 'Sesame Oil', '🫙', OIL, [16, 'l'], [10, 'l'], { density: 0.92, allergens: ['sesame'] }),
  cupboard('sesame_seeds', 'Sesame Seeds', '⚪', [573, 18, 23, 50, 12], [20, 'kg'], [10, 'kg'], { density: 0.6, allergens: ['sesame'] }),
  cupboard('peanut_butter', 'Peanut Butter', '🥜', [588, 25, 20, 50, 6], [5.5, 'kg'], [7.3, 'kg'], { density: 1.05, allergens: ['peanut'] }),
  cupboard('peanuts', 'Roasted Peanuts', '🥜', [585, 24, 21, 50, 8], [8, 'kg'], [5, 'kg'], { density: 0.6, allergens: ['peanut'] }),
  cupboard('cashews', 'Cashews', '🥜', [574, 15, 33, 46, 3], [18, 'kg'], [12, 'kg'], { density: 0.55, allergens: ['tree_nut'] }),
  cupboard('tahini', 'Tahini', '🫙', [595, 17, 21, 54, 9], [14, 'kg'], [8, 'kg'], { density: 1, allergens: ['sesame'] }),
  cupboard('pesto', 'Basil Pesto', '🫙', [460, 5, 6, 46, 2], [21, 'kg'], [8, 'kg'], {
    density: 1,
    animal: 'dairy',
    allergens: ['dairy', 'tree_nut'],
  }),
  cupboard('green_curry_paste', 'Thai Green Curry Paste', '🫙', [100, 2, 12, 5, 4], [26, 'kg'], [7.7, 'kg'], { density: 1.1 }),
  cupboard('red_curry_paste', 'Thai Red Curry Paste', '🫙', [100, 2, 12, 5, 4], [26, 'kg'], [7.7, 'kg'], { density: 1.1 }),
  cupboard('curry_paste', 'Tikka Masala Paste', '🫙', [300, 4, 15, 25, 5], [14, 'kg'], [7, 'kg'], { density: 1.1 }),
  cupboard('gochujang', 'Gochujang', '🌶️', [200, 4, 42, 1, 2], [10, 'kg'], [12, 'kg'], { density: 1.2, allergens: ['gluten', 'soy'] }),
  cupboard('miso', 'White Miso Paste', '🫙', [198, 12, 26, 6, 5], [17, 'kg'], [20, 'kg'], { density: 1.15, allergens: ['soy'] }),
  cupboard('hoisin', 'Hoisin Sauce', '🫙', [220, 3.3, 44, 3.4, 2.8], [8, 'kg'], [6, 'kg'], { density: 1.2, allergens: ['soy', 'gluten'] }),
  cupboard('oyster_sauce', 'Oyster Sauce', '🫙', [51, 1.4, 11, 0.3, 0.3], [8, 'kg'], [6, 'kg'], {
    density: 1.2,
    animal: 'shellfish',
    allergens: ['shellfish', 'gluten', 'soy'],
  }),
  cupboard('sweet_chili', 'Sweet Chili Sauce', '🌶️', [250, 0.5, 60, 0.5, 1], [7, 'kg'], [4, 'kg'], { uk: 'Sweet Chilli Sauce', density: 1.25 }),
  cupboard('sriracha', 'Sriracha', '🌶️', [93, 2, 19, 1, 2], [9, 'kg'], [8, 'kg'], { density: 1.1 }),
  cupboard('chipotle', 'Chipotle Paste', '🌶️', [80, 1.5, 12, 3, 4], [15, 'kg'], [12, 'kg'], { density: 1.1 }),
  cupboard('salsa', 'Salsa', '🫙', [36, 1.5, 7, 0.2, 2], [6, 'kg'], [5, 'kg'], { density: 1.05 }),
  cupboard('olives', 'Kalamata Olives', '🫒', [145, 1, 4, 15, 3], [15, 'kg'], [8, 'kg']),
  cupboard('sundried_tomatoes', 'Sun-Dried Tomatoes', '🍅', [213, 5, 23, 14, 6], [20, 'kg'], [12, 'kg']),
  cupboard('tuna', 'Canned Tuna', '🐟', [116, 26, 0, 1, 0], [1.2, 'each'], [1.0, 'each'], {
    uk: 'Tinned Tuna',
    each: 112,
    buy: 'count',
    countUnit: 'can',
    animal: 'fish',
    protein: 'fish',
    allergens: ['fish'],
  }),
  cupboard('panko', 'Panko Breadcrumbs', '🍞', [395, 12, 72, 6, 4], [8, 'kg'], [6, 'kg'], { density: 0.25, allergens: ['gluten'] }),
  cupboard('raisins', 'Raisins', '🍇', [299, 3, 79, 0.5, 3.7], [7, 'kg'], [4, 'kg'], { density: 0.65 }),

  // ── Frozen ────────────────────────────────────────────────────────────────
  frozen('peas', 'Frozen Peas', '🫛', [81, 5.4, 14, 0.4, 5], [2.6, 'kg'], [1.5, 'kg'], { density: 0.6 }),
  frozen('fries', 'French Fries', '🍟', [150, 2.5, 24, 5, 2], [3.3, 'kg'], [2, 'kg'], { uk: 'Oven Chips' }),
  frozen('breaded_fish', 'Breaded Fish Fillets', '🐟', [220, 12, 20, 10, 1], [13, 'kg'], [8, 'kg'], {
    each: 125,
    animal: 'fish',
    protein: 'fish',
    allergens: ['fish', 'gluten'],
  }),
  frozen('edamame', 'Edamame', '🫛', [121, 12, 9, 5, 5], [6.6, 'kg'], [5, 'kg'], { allergens: ['soy'], protein: 'legume' }),
  frozen('mixed_veg', 'Stir-Fry Vegetables', '🥦', [35, 2, 6, 0.3, 2.5], [4.4, 'kg'], [2.5, 'kg']),

  // ── Batch 2 additions ─────────────────────────────────────────────────────
  veg('arugula', 'Arugula', '🥬', [25, 2.6, 3.7, 0.7, 1.6], [14, 'kg'], [8, 'kg'], { uk: 'Rocket' }),
  meat('beef_chuck', 'Beef Chuck', '🥩', [190, 19, 0, 12, 0], [13, 'kg'], [10, 'kg'], { uk: 'Braising Steak', animal: 'meat', protein: 'beef' }),
  dairy('pizza_dough', 'Pizza Dough', '🍕', [250, 7, 48, 3, 2], [4.4, 'kg'], [4, 'kg'], { allergens: ['gluten'] }),
  cupboard('macaroni', 'Macaroni', '🍝', [371, 13, 75, 1.5, 3.2], [2.2, 'kg'], [1.2, 'kg'], { allergens: ['gluten'], cup: 105 }),
  cupboard('gnocchi', 'Gnocchi', '🥟', [150, 3.5, 32, 0.5, 1.5], [5.5, 'kg'], [2.6, 'kg'], { allergens: ['gluten'] }),
  cupboard('green_lentils', 'Green Lentils', '🫘', [352, 25, 63, 1, 11], [3.3, 'kg'], [3, 'kg'], { cup: 190, protein: 'legume' }),
  cupboard('harissa', 'Harissa Paste', '🌶️', [100, 3, 10, 6, 4], [15, 'kg'], [10, 'kg'], { density: 1.1 }),
  cupboard('apricots', 'Dried Apricots', '🍑', [241, 3.4, 63, 0.5, 7], [13, 'kg'], [7, 'kg'], { density: 0.6 }),

  // ── Pantry essentials (shown as "Pantry", pre-ticked, excluded from totals) ──
  pantry('olive_oil', 'Olive Oil', '🫒', OIL, [9, 'l'], [7, 'l'], { density: 0.92 }),
  pantry('oil', 'Cooking Oil', '🫙', OIL, [4, 'l'], [2, 'l'], { uk: 'Vegetable Oil', density: 0.92 }),
  pantry('butter', 'Butter', '🧈', [717, 0.9, 0.1, 81, 0], [10, 'kg'], [8.5, 'kg'], { density: 0.96, animal: 'dairy', allergens: ['dairy'] }),
  pantry('salt', 'Salt', '🧂', [0, 0, 0, 0, 0], [1, 'kg'], [0.8, 'kg'], { density: 1.2 }),
  pantry('pepper', 'Black Pepper', '🧂', SPICE, [30, 'kg'], [25, 'kg'], { density: 0.45 }),
  pantry('garlic', 'Garlic', '🧄', [149, 6.4, 33, 0.5, 2.1], [9, 'kg'], [8, 'kg'], { each: 5 }),
  pantry('soy_sauce', 'Soy Sauce', '🍶', [53, 8, 4.9, 0.6, 0.8], [5, 'l'], [5, 'l'], { density: 1.1, allergens: ['soy', 'gluten'] }),
  pantry('honey', 'Honey', '🍯', [304, 0.3, 82, 0, 0.2], [12, 'kg'], [6, 'kg'], { density: 1.42, animal: 'honey' }),
  pantry('maple_syrup', 'Maple Syrup', '🍁', [260, 0, 67, 0.1, 0], [20, 'l'], [15, 'l'], { density: 1.32 }),
  pantry('rice_vinegar', 'Rice Vinegar', '🍶', [18, 0, 0, 0, 0], [5, 'l'], [5, 'l']),
  pantry('balsamic', 'Balsamic Vinegar', '🍶', [88, 0.5, 17, 0, 0], [10, 'l'], [6, 'l'], { density: 1.06 }),
  pantry('vinegar', 'White Wine Vinegar', '🍶', [18, 0, 0, 0, 0], [5, 'l'], [3, 'l']),
  pantry('cornstarch', 'Cornstarch', '🌽', [381, 0.3, 91, 0.1, 0.9], [4, 'kg'], [3, 'kg'], { uk: 'Cornflour', density: 0.53 }),
  pantry('flour', 'All-Purpose Flour', '🌾', [364, 10, 76, 1, 2.7], [1.1, 'kg'], [0.9, 'kg'], {
    uk: 'Plain Flour',
    density: 0.53,
    cup: 125,
    allergens: ['gluten'],
  }),
  pantry('sugar', 'Sugar', '🍬', [387, 0, 100, 0, 0], [1.8, 'kg'], [1.2, 'kg'], { density: 0.85 }),
  pantry('brown_sugar', 'Brown Sugar', '🍬', [380, 0.1, 98, 0, 0], [2.6, 'kg'], [2, 'kg'], { density: 0.9 }),
  pantry('fish_sauce', 'Fish Sauce', '🍶', [35, 5, 3.6, 0, 0], [8, 'l'], [6, 'l'], { density: 1.2, animal: 'fish', allergens: ['fish'] }),
  pantry('ketchup', 'Ketchup', '🍅', [101, 1, 27, 0.1, 0.3], [3, 'kg'], [2.5, 'kg'], { density: 1.15 }),
  pantry('mayo', 'Mayonnaise', '🥚', [680, 1, 0.6, 75, 0], [6, 'kg'], [4, 'kg'], { density: 0.95, animal: 'egg', allergens: ['egg'] }),
  pantry('dijon', 'Dijon Mustard', '🟡', [66, 4, 6, 4, 3], [8, 'kg'], [6, 'kg'], { density: 1.05 }),
  pantry('cumin', 'Ground Cumin', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('paprika', 'Smoked Paprika', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('chili_powder', 'Chili Powder', '🫙', SPICE, [30, 'kg'], [30, 'kg'], { uk: 'Chilli Powder', density: 0.5 }),
  pantry('chili_flakes', 'Chili Flakes', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { uk: 'Chilli Flakes', density: 0.4 }),
  pantry('garam_masala', 'Garam Masala', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('curry_powder', 'Curry Powder', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('turmeric', 'Ground Turmeric', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('coriander_ground', 'Ground Coriander', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.4 }),
  pantry('oregano', 'Dried Oregano', '🫙', SPICE, [50, 'kg'], [40, 'kg'], { density: 0.2 }),
  pantry('italian_herbs', 'Italian Seasoning', '🫙', SPICE, [50, 'kg'], [40, 'kg'], { uk: 'Mixed Herbs', density: 0.2 }),
  pantry('thyme', 'Dried Thyme', '🫙', SPICE, [50, 'kg'], [40, 'kg'], { density: 0.2 }),
  pantry('cinnamon', 'Ground Cinnamon', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.5 }),
  pantry('cajun', 'Cajun Seasoning', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.5 }),
  pantry('jerk', 'Jerk Seasoning', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.5 }),
  pantry('five_spice', 'Chinese Five Spice', '🫙', SPICE, [40, 'kg'], [30, 'kg'], { density: 0.45 }),
  pantry('bay_leaf', 'Bay Leaves', '🍃', SPICE, [60, 'kg'], [50, 'kg'], { each: 0.2 }),
  pantry('stock_cube', 'Stock Cube', '🧊', [250, 10, 20, 15, 0], [0.12, 'each'], [0.08, 'each'], { each: 10 }),
];

export const ING: Record<string, CatalogIngredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const ingName = (id: string, country: 'US' | 'UK' | 'CA' | 'AU') => {
  const i = ING[id];
  if (!i) return id;
  return (country === 'UK' || country === 'AU') && i.nameUK ? i.nameUK : i.name;
};
