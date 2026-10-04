import type { MealKey, PlannedMeal, Slot } from '../types';

export const SLOTS: Slot[] = ['lunch', 'dinner'];

export const slotOf = (m: Pick<PlannedMeal, 'slot'>): Slot => m.slot ?? 'dinner';

export const isMeal = (m: PlannedMeal, key: MealKey) => m.day === key.day && slotOf(m) === key.slot;

/** Sort by day, lunch before dinner. */
export const byDaySlot = (a: PlannedMeal, b: PlannedMeal) => a.day - b.day || SLOTS.indexOf(slotOf(a)) - SLOTS.indexOf(slotOf(b));

export const keyId = (k: MealKey) => `${k.day}:${k.slot}`;

/** Every (day, slot) to plan, in display order. */
export function mealKeys(days: number[], meals: Slot[]): MealKey[] {
  const slots = SLOTS.filter((s) => meals.includes(s));
  return [...days].sort((a, b) => a - b).flatMap((day) => slots.map((slot) => ({ day, slot })));
}
