import { ING, type CatalogIngredient } from '../data/ingredients';
import type { Country, RecipeLine, Unit } from '../types';

const ML: Partial<Record<Unit, number>> = { ml: 1, tsp: 5, tbsp: 15, cup: 240 };

export const isMetric = (country: Country, units: 'auto' | 'metric' | 'imperial' = 'auto') =>
  units === 'metric' || (units === 'auto' && country !== 'US');

/** Convert a recipe line (or bare qty/unit) to grams of the ingredient. */
export function toGrams(ing: CatalogIngredient, qty: number, unit: Unit): number {
  switch (unit) {
    case 'g':
      return qty;
    case 'pinch':
      return qty * 0.4;
    case 'each':
    case 'can':
    case 'clove':
    case 'slice':
      if (!ing.each) throw new Error(`Ingredient ${ing.id} has no 'each' weight for unit ${unit}`);
      return qty * ing.each;
    case 'cup':
      if (ing.cup) return qty * ing.cup;
      return qty * 240 * (ing.density ?? 1);
    default: {
      const ml = ML[unit];
      if (ml === undefined) throw new Error(`Unknown unit ${unit}`);
      return qty * ml * (ing.density ?? 1);
    }
  }
}

export const lineGrams = (line: RecipeLine, scale = 1) => {
  const ing = ING[line[0]];
  if (!ing) throw new Error(`Unknown ingredient ${line[0]}`);
  return toGrams(ing, line[1], line[2]) * scale;
};

// ── Formatting ───────────────────────────────────────────────────────────────

const FRACTIONS: [number, string][] = [
  [0, ''],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
  [1, ''],
];

/** 1.25 → "1¼", 0.5 → "½", 3 → "3". */
export function niceNumber(n: number): string {
  if (n >= 10) return String(Math.round(n));
  let whole = Math.floor(n);
  const rest = n - whole;
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) if (Math.abs(f[0] - rest) < Math.abs(best[0] - rest)) best = f;
  if (best[0] === 1) whole += 1;
  const frac = best[0] === 1 ? '' : best[1];
  if (whole === 0 && !frac) return n > 0 ? '¼' : '0';
  return `${whole || ''}${frac}`;
}

const trim = (n: number, dp: number) => String(Number(n.toFixed(dp)));

/** Weight for display: US oz/lb, metric g/kg. */
export function formatWeight(grams: number, metric: boolean): string {
  if (metric) {
    if (grams >= 1000) return `${trim(grams / 1000, 2)} kg`;
    const rounded = grams >= 100 ? Math.round(grams / 5) * 5 : Math.round(grams);
    return `${Math.max(1, rounded)}g`;
  }
  const oz = grams / 28.35;
  if (oz >= 16) return `${trim(oz / 16, 2)} lb`;
  return `${Math.max(1, Math.round(oz))} oz`;
}

export function formatVolume(ml: number, metric: boolean): string {
  if (metric) {
    if (ml >= 1000) return `${trim(ml / 1000, 2)} l`;
    return `${Math.max(5, Math.round(ml / 5) * 5)}ml`;
  }
  return `${Math.max(1, Math.round(ml / 29.57))} fl oz`;
}

const plural = (n: number, word: string) => (n > 1 ? `${word}s` : word);

/** Recipe-view quantity, keeping cook-friendly measures (tbsp, cloves, ¼ cup). */
export function formatLineQty(line: RecipeLine, scale: number, country: Country, units: 'auto' | 'metric' | 'imperial' = 'auto'): string {
  const [id, rawQty, unit] = line;
  const ing = ING[id];
  const qty = rawQty * scale;
  const metric = isMetric(country, units);
  switch (unit) {
    case 'g':
      return formatWeight(qty, metric);
    case 'ml':
      return formatVolume(qty, metric);
    case 'each':
      if (ing?.countUnit) return `${niceNumber(qty)} ${plural(qty, ing.countUnit)}`;
      return qty <= 1 ? niceNumber(qty) : `${niceNumber(qty)} whole`;
    case 'can':
      return `${niceNumber(qty)} ${plural(qty, 'can')}`;
    case 'clove':
      return `${niceNumber(qty)} ${plural(qty, 'clove')}`;
    case 'slice':
      return `${niceNumber(qty)} ${plural(qty, 'slice')}`;
    case 'pinch':
      return 'pinch';
    case 'cup':
      if (metric) return formatVolume(qty * 240, true);
      return `${niceNumber(qty)} ${plural(qty, 'cup')}`;
    case 'tbsp':
    case 'tsp':
      return `${niceNumber(qty)} ${unit}`;
  }
}

/** Grocery-list quantity, based on how the item is bought. */
export function formatBuyQty(ing: CatalogIngredient, grams: number, country: Country, units: 'auto' | 'metric' | 'imperial' = 'auto'): string {
  const metric = isMetric(country, units);
  if (ing.buy === 'count' && ing.each) {
    const n = Math.max(1, Math.ceil(grams / ing.each - 0.15));
    return ing.countUnit ? `${n} ${plural(n, ing.countUnit)}` : String(n);
  }
  if (ing.buy === 'volume') return formatVolume(grams / (ing.density ?? 1), metric);
  return formatWeight(grams, metric);
}
