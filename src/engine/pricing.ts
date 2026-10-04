import { ING, type CatalogIngredient } from '../data/ingredients';
import { STORE_BY_ID } from '../data/stores';
import type { Country, Price } from '../types';

// Canada and Australia are derived from US/UK base prices until they get their own columns.
const DERIVED: Record<'CA' | 'AU', { from: 'US' | 'UK'; factor: number }> = {
  CA: { from: 'US', factor: 1.38 },
  AU: { from: 'US', factor: 1.55 },
};

export type PriceOverrides = Record<string, number>; // `${country}:${ingredientId}` → price per base unit

function basePrice(ing: CatalogIngredient, country: Country): Price {
  if (country === 'US' || country === 'UK') return ing.price[country];
  const own = ing.price[country];
  if (own) return own;
  const d = DERIVED[country];
  const [amount, per] = ing.price[d.from];
  return [amount * d.factor, per];
}

/** Effective [price, per] for an ingredient at a store, after any user override. */
export function unitPrice(ingId: string, country: Country, storeId: string, overrides?: PriceOverrides): Price {
  const ing = ING[ingId];
  const [amount, per] = basePrice(ing, country);
  const override = overrides?.[`${country}:${ingId}`];
  if (override !== undefined) return [override, per];
  const index = STORE_BY_ID[storeId]?.index ?? 1;
  return [amount * index, per];
}

/** Pro-rata cost of `grams` of an ingredient — "cost of what you use", like Whipp. */
export function costOf(ingId: string, grams: number, country: Country, storeId: string, overrides?: PriceOverrides): number {
  const ing = ING[ingId];
  const [amount, per] = unitPrice(ingId, country, storeId, overrides);
  switch (per) {
    case 'kg':
      return (grams / 1000) * amount;
    case 'l':
      return (grams / (ing.density ?? 1) / 1000) * amount;
    case 'each':
      return (grams / (ing.each ?? 1)) * amount;
  }
}

export const CURRENCY: Record<Country, { code: string; locale: string; symbol: string }> = {
  US: { code: 'USD', locale: 'en-US', symbol: '$' },
  UK: { code: 'GBP', locale: 'en-GB', symbol: '£' },
  CA: { code: 'CAD', locale: 'en-CA', symbol: '$' },
  AU: { code: 'AUD', locale: 'en-AU', symbol: '$' },
};

const formatters = new Map<string, Intl.NumberFormat>();

export function money(amount: number, country: Country, whole = false): string {
  const key = `${country}:${whole}`;
  let f = formatters.get(key);
  if (!f) {
    const c = CURRENCY[country];
    f = new Intl.NumberFormat(c.locale, {
      style: 'currency',
      currency: c.code,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    formatters.set(key, f);
  }
  return f.format(amount);
}

/** Human label for the unit a price is quoted in, e.g. "per lb" / "per kg" / "each". */
export function priceUnitLabel(per: Price[1], metric: boolean): string {
  if (per === 'each') return 'each';
  if (per === 'kg') return metric ? 'per kg' : 'per lb';
  return metric ? 'per litre' : 'per qt';
}

/** Convert a base price to the display unit (US shows per lb / per qt). */
export function toDisplayPrice(price: Price, metric: boolean): number {
  const [amount, per] = price;
  if (metric || per === 'each') return amount;
  if (per === 'kg') return amount * 0.45359;
  return amount * 0.94635;
}

export function fromDisplayPrice(value: number, per: Price[1], metric: boolean): number {
  if (metric || per === 'each') return value;
  if (per === 'kg') return value / 0.45359;
  return value / 0.94635;
}
