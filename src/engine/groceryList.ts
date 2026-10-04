import { ING, ingName } from '../data/ingredients';
import { AISLES } from '../data/taxonomy';
import type { Aisle, Recipe, WeekPlan } from '../types';
import { costOf } from './pricing';
import type { PriceContext } from './cost';
import { formatBuyQty, lineGrams } from './units';

export interface ListItem {
  key: string;
  ingredientId?: string;
  name: string;
  emoji: string;
  aisle: Aisle;
  grams: number;
  qty: string;
  cost: number;
  pantry: boolean;
  checked: boolean;
  custom?: boolean;
  usedIn: string[];
}

export interface ListGroup {
  aisle: Aisle;
  label: string;
  emoji: string;
  items: ListItem[];
}

export interface GroceryList {
  groups: ListGroup[];
  total: number;
  /** Items to buy (excludes pantry essentials). */
  count: number;
  inCart: number;
}

export function buildList(
  plan: Pick<WeekPlan, 'meals' | 'checks' | 'custom'>,
  recipes: Record<string, Recipe>,
  ctx: PriceContext,
  units: 'auto' | 'metric' | 'imperial' = 'auto',
): GroceryList {
  const acc = new Map<string, { grams: number; usedIn: Set<string> }>();
  for (const meal of plan.meals) {
    const r = recipes[meal.recipeId];
    if (!r) continue;
    const scale = meal.servings / r.serves;
    for (const line of r.ingredients) {
      if (meal.removed.includes(line[0])) continue;
      const cur = acc.get(line[0]) ?? { grams: 0, usedIn: new Set<string>() };
      cur.grams += lineGrams(line, scale);
      cur.usedIn.add(r.title);
      acc.set(line[0], cur);
    }
  }

  const items: ListItem[] = [];
  for (const [id, { grams, usedIn }] of acc) {
    const ing = ING[id];
    const pantry = !!ing.pantry;
    items.push({
      key: id,
      ingredientId: id,
      name: ingName(id, ctx.country),
      emoji: ing.emoji,
      aisle: ing.aisle,
      grams,
      qty: pantry ? '' : formatBuyQty(ing, grams, ctx.country, units),
      cost: pantry ? 0 : costOf(id, grams, ctx.country, ctx.storeId, ctx.overrides),
      pantry,
      // Pantry essentials start ticked ("probably in your pantry") until the user unticks them.
      checked: plan.checks[id] ?? pantry,
      usedIn: [...usedIn],
    });
  }
  for (const c of plan.custom) {
    items.push({
      key: c.id,
      name: c.name,
      emoji: '📝',
      aisle: 'cupboard',
      grams: 0,
      qty: '',
      cost: 0,
      pantry: false,
      checked: !!plan.checks[c.id],
      custom: true,
      usedIn: [],
    });
  }

  const groups: ListGroup[] = AISLES.map((a) => ({
    aisle: a.id,
    label: a.label,
    emoji: a.emoji,
    items: items.filter((i) => i.aisle === a.id).sort((x, y) => Number(!!x.custom) - Number(!!y.custom) || x.name.localeCompare(y.name)),
  })).filter((g) => g.items.length);

  const buy = items.filter((i) => !i.pantry);
  return {
    groups,
    total: buy.reduce((s, i) => s + i.cost, 0),
    count: buy.length,
    inCart: buy.filter((i) => i.checked).length,
  };
}

/** Plain-text list for sharing / copying. */
export function listToText(list: GroceryList, title: string, money: (n: number) => string): string {
  const lines = [title, ''];
  for (const g of list.groups) {
    lines.push(`${g.emoji} ${g.label.toUpperCase()}`);
    for (const i of g.items) {
      const qty = i.qty ? ` — ${i.qty}` : '';
      lines.push(`${i.checked ? '☑' : '☐'} ${i.name}${qty}`);
    }
    lines.push('');
  }
  lines.push(`Estimated total: ${money(list.total)}`);
  return lines.join('\n');
}
