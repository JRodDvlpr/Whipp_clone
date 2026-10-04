import { useEffect, useMemo, useState } from 'react';
import { RECIPE_BY_ID } from '../data/recipes';
import { STORE_BY_ID } from '../data/stores';
import { mealCost, type PriceContext } from '../engine/cost';
import { buildList } from '../engine/groceryList';
import { keyId, slotOf } from '../engine/slots';
import { money } from '../engine/pricing';
import type { Nutrition, WeekPlan } from '../types';
import { useApp } from './store';

/** True once the persisted state has been read from IndexedDB. */
export function useHydrated() {
  const [done, setDone] = useState(useApp.persist.hasHydrated());
  useEffect(() => {
    if (done) return;
    const unsub = useApp.persist.onFinishHydration(() => setDone(true));
    if (useApp.persist.hasHydrated()) setDone(true);
    return unsub;
  }, [done]);
  return done;
}

/** Price context for the current profile (store + overrides). */
export function usePriceCtx(): PriceContext {
  const profile = useApp((s) => s.profile);
  const overrides = useApp((s) => s.overrides);
  return useMemo(() => ({ country: profile.country, storeId: profile.storeId, overrides }), [profile.country, profile.storeId, overrides]);
}

/** Price context a saved plan was made with — its store, not necessarily today's. */
export function usePlanCtx(plan?: WeekPlan): PriceContext {
  const current = usePriceCtx();
  return useMemo(() => (plan ? { country: plan.country, storeId: plan.storeId, overrides: current.overrides } : current), [plan, current]);
}

export function useMoney() {
  const country = useApp((s) => s.profile.country);
  return (n: number) => money(n, country);
}

export interface WeekSummary {
  total: number;
  budget: number;
  pct: number;
  count: number;
  listCount: number;
  storeName: string;
  avg: Nutrition | null;
  macroPct: { protein: number; carbs: number; fat: number } | null;
  /** Keyed by `${day}:${slot}`. */
  mealCosts: Record<string, number>;
}

export function useWeekSummary(plan?: WeekPlan): WeekSummary | null {
  const ctx = usePlanCtx(plan);
  const units = useApp((s) => s.profile.units);
  return useMemo(() => {
    if (!plan) return null;
    const mealCosts: Record<string, number> = {};
    let total = 0;
    const sum = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let n = 0;
    for (const m of plan.meals) {
      const c = mealCost(m, RECIPE_BY_ID, ctx);
      mealCosts[keyId({ day: m.day, slot: slotOf(m) })] = c;
      total += c;
      const r = RECIPE_BY_ID[m.recipeId];
      if (r) {
        n++;
        (Object.keys(sum) as (keyof Nutrition)[]).forEach((k) => (sum[k] += r.nutrition[k]));
      }
    }
    const avg = n ? (Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, Math.round(v / n)])) as unknown as Nutrition) : null;
    const kcalFromMacros = avg ? avg.protein * 4 + avg.carbs * 4 + avg.fat * 9 : 0;
    const macroPct =
      avg && kcalFromMacros
        ? {
            protein: Math.round((avg.protein * 4 * 100) / kcalFromMacros),
            carbs: Math.round((avg.carbs * 4 * 100) / kcalFromMacros),
            fat: Math.round((avg.fat * 9 * 100) / kcalFromMacros),
          }
        : null;
    const list = buildList(plan, RECIPE_BY_ID, ctx, units);
    return {
      total,
      budget: plan.budget,
      pct: plan.budget ? total / plan.budget : 0,
      count: plan.meals.length,
      listCount: list.count,
      storeName: STORE_BY_ID[plan.storeId]?.name ?? '',
      avg,
      macroPct,
      mealCosts,
    };
  }, [plan, ctx, units]);
}

/** Keep the screen awake (cook mode). */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = () =>
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) l.release();
          else lock = l;
        })
        .catch(() => {});
    request();
    const onVis = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => {});
    };
  }, [active]);
}

export function useIsWide() {
  const q = '(min-width: 900px)';
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}
