import type { Aisle, Allergen, Appliance, Country, Diet, ExtraTag, Priority } from '../types';

export const PRIORITIES: { id: Priority; label: string; labelUK?: string; emoji: string; countries?: Country[] }[] = [
  { id: 'quick', label: 'Quick prep', emoji: '⚡' },
  { id: 'high_protein', label: 'High protein', emoji: '💪' },
  { id: 'family', label: 'Family favorites', labelUK: 'Family favourites', emoji: '🍝' },
  { id: 'healthy', label: 'Healthy', emoji: '🥗' },
  { id: 'low_carb', label: 'Low carb', emoji: '🥑' },
  { id: 'gut_friendly', label: 'Gut friendly', emoji: '🌱' },
  { id: 'comfort', label: 'Comfort food', emoji: '🍲' },
  { id: 'plant_forward', label: 'Plant-forward', emoji: '🌿' },
  { id: 'batch_cook', label: 'Batch cook', emoji: '🍱' },
  { id: 'balance', label: 'Her Balance · weight loss', emoji: '🌸' },
];

/** Short labels used on recipe/meal card chips. */
export const TAG_LABELS: Record<Priority | ExtraTag, string> = {
  quick: 'Quick prep',
  high_protein: 'High protein',
  family: 'Family',
  healthy: 'Healthy',
  low_carb: 'Low carb',
  gut_friendly: 'Gut friendly',
  comfort: 'Comfort',
  plant_forward: 'Plant-forward',
  batch_cook: 'Batch cook',
  balance: 'Her Balance',
  budget: 'Budget pick',
  one_pan: 'One-pan',
  veggie: 'Veggie',
  vegan: 'Vegan',
  spicy: 'Spicy',
};

/** Chip style per tag — mirrors Whipp: lime for Healthy, soft green for most, outline for Quick prep. */
export const TAG_STYLE: Partial<Record<Priority | ExtraTag, 'lime' | 'soft' | 'outline' | 'pink'>> = {
  healthy: 'lime',
  balance: 'pink',
  budget: 'lime',
  quick: 'outline',
  comfort: 'outline',
};

export const DIETS: { id: Diet; label: string; emoji: string; hint: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥕', hint: 'No meat or fish' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱', hint: 'Fully plant-based' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟', hint: 'Fish, no meat' },
  { id: 'gluten_free', label: 'Gluten-free', emoji: '🌾', hint: 'No wheat, barley or rye' },
  { id: 'dairy_free', label: 'Dairy-free', emoji: '🥛', hint: 'No milk, cheese or butter' },
  { id: 'nut_free', label: 'Nut-free', emoji: '🥜', hint: 'No peanuts or tree nuts' },
];

export const ALLERGENS: { id: Allergen; label: string; emoji: string }[] = [
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'dairy', label: 'Dairy', emoji: '🧀' },
  { id: 'egg', label: 'Eggs', emoji: '🥚' },
  { id: 'peanut', label: 'Peanuts', emoji: '🥜' },
  { id: 'tree_nut', label: 'Tree nuts', emoji: '🌰' },
  { id: 'soy', label: 'Soy', emoji: '🫘' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'sesame', label: 'Sesame', emoji: '⚪' },
];

export const APPLIANCES: { id: Appliance; label: string; labelUK?: string }[] = [
  { id: 'stove', label: 'Stove', labelUK: 'Hob' },
  { id: 'oven', label: 'Oven' },
  { id: 'air_fryer', label: 'Air fryer' },
  { id: 'microwave', label: 'Microwave' },
  { id: 'rice_cooker', label: 'Rice cooker' },
];

export const AISLES: { id: Aisle; label: string; emoji: string }[] = [
  { id: 'fruit_veg', label: 'Fruit & Veg', emoji: '🥦' },
  { id: 'meat_fish', label: 'Meat & Fish', emoji: '🐟' },
  { id: 'chilled_dairy', label: 'Chilled & Dairy', emoji: '🧀' },
  { id: 'bakery', label: 'Bakery', emoji: '🥖' },
  { id: 'cupboard', label: 'Cupboard', emoji: '🥫' },
  { id: 'frozen', label: 'Frozen', emoji: '🧊' },
  { id: 'pantry', label: 'Pantry essentials', emoji: '🧂' },
];

export const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
