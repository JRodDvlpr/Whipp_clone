import type { MealKey, PlannedMeal, Slot } from '../types';

export const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner'];

export const slotOf = (m: Pick<PlannedMeal, 'slot'>): Slot => m.slot ?? 'dinner';

export const isMeal = (m: PlannedMeal, key: MealKey) => m.day === key.day && slotOf(m) === key.slot;

/** Sort by day, then breakfast, lunch, dinner. */
export const byDaySlot = (a: PlannedMeal, b: PlannedMeal) => a.day - b.day || SLOTS.indexOf(slotOf(a)) - SLOTS.indexOf(slotOf(b));

export const keyId = (k: MealKey) => `${k.day}:${k.slot}`;

/** Every (day, slot) to plan, in display order. */
export function mealKeys(days: number[], meals: Slot[]): MealKey[] {
  const slots = SLOTS.filter((s) => meals.includes(s));
  return [...days].sort((a, b) => a - b).flatMap((day) => slots.map((slot) => ({ day, slot })));
}

/** "Breakfast, lunch & dinner" — how a set of meals reads in Profile. */
export function mealsLabel(meals: Slot[]): string {
  const on = SLOTS.filter((s) => meals.includes(s));
  if (on.length === 1 && on[0] === 'dinner') return 'Just dinner';
  const words = on.map((s, i) => (i === 0 ? s[0].toUpperCase() + s.slice(1) : s));
  return words.length > 1 ? `${words.slice(0, -1).join(', ')} & ${words[words.length - 1]}` : words[0];
}
