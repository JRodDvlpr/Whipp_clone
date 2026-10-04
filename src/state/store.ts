import { del, get, set } from 'idb-keyval';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { RECIPES, RECIPE_BY_ID } from '../data/recipes';
import { BUDGET, STORE_BY_ID } from '../data/stores';
import { weekCost } from '../engine/cost';
import { addWeeks, weekStart } from '../engine/dates';
import { generateWeek } from '../engine/planner';
import type { PriceOverrides } from '../engine/pricing';
import { newSeed } from '../engine/rng';
import type { Country, PlannedMeal, Profile, WeekPlan } from '../types';

// Everything lives on the device (IndexedDB), like Whipp — no account, no server.
const idbStorage: StateStorage = {
  getItem: async (name) => (await get<string>(name)) ?? null,
  setItem: (name, value) => set(name, value),
  removeItem: (name) => del(name),
};

export function guessCountry(): Country {
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  if (/-GB$/i.test(lang)) return 'UK';
  if (/-CA$/i.test(lang)) return 'CA';
  if (/-AU$/i.test(lang)) return 'AU';
  return 'US';
}

const DEFAULT_STORE: Record<Country, string> = { US: 'walmart', UK: 'tesco', CA: 'walmart_ca', AU: 'woolworths' };

export function defaultProfile(country: Country = guessCountry()): Profile {
  return {
    country,
    storeId: DEFAULT_STORE[country],
    weeklyBudget: BUDGET[country].def,
    household: 2,
    kidFriendly: false,
    diets: [],
    allergens: [],
    dislikes: [],
    priorities: [],
    appliances: ['stove', 'oven'],
    days: [0, 1, 2, 3, 4, 5, 6],
    units: 'auto',
  };
}

export interface AppState {
  onboarded: boolean;
  profile: Profile;
  plans: Record<string, WeekPlan>;
  favorites: string[];
  overrides: PriceOverrides;
  supportId: string;

  setProfile: (patch: Partial<Profile>) => void;
  setCountry: (country: Country) => void;
  completeOnboarding: () => void;
  planWeek: (week: string) => WeekPlan;
  redoWeek: (week: string) => void;
  deletePlan: (week: string) => void;
  setMeal: (week: string, day: number, recipeId: string) => void;
  removeMeal: (week: string, day: number) => void;
  setServings: (week: string, day: number, servings: number) => void;
  toggleRemoved: (week: string, day: number, ingredientId: string) => void;
  toggleLock: (week: string, day: number) => void;
  toggleCheck: (week: string, key: string, current: boolean) => void;
  addCustom: (week: string, name: string) => void;
  removeCustom: (week: string, id: string) => void;
  toggleFavorite: (recipeId: string) => void;
  dislike: (ingredientId: string) => void;
  setOverride: (key: string, price: number | null) => void;
  importData: (data: Partial<Pick<AppState, 'profile' | 'plans' | 'favorites' | 'overrides' | 'onboarded'>>) => void;
  reset: () => void;
}

const ctxOf = (p: Profile, overrides: PriceOverrides) => ({ country: p.country, storeId: p.storeId, overrides });

/** Recipe ids from the weeks before `week`, most recent first. */
function recentFor(plans: Record<string, WeekPlan>, week: string): string[][] {
  return [1, 2, 3].map((n) => plans[addWeeks(week, -n)]?.meals.map((m) => m.recipeId) ?? []);
}

function makePlan(s: AppState, week: string, keep: PlannedMeal[] = [], prev?: WeekPlan): WeekPlan {
  const seed = newSeed();
  const res = generateWeek({
    profile: s.profile,
    recipes: RECIPES,
    recent: recentFor(s.plans, week),
    favorites: s.favorites,
    seed,
    keep,
    ctx: ctxOf(s.profile, s.overrides),
  });
  return {
    week,
    createdAt: Date.now(),
    storeId: s.profile.storeId,
    country: s.profile.country,
    budget: s.profile.weeklyBudget,
    household: s.profile.household,
    seed,
    meals: res.meals,
    checks: prev?.checks ?? {},
    custom: prev?.custom ?? [],
    overBudget: res.overBudget,
  };
}

const randomId = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export const useApp = create<AppState>()(
  persist(
    (setState, getState) => {
      /** Update one week's plan immutably and recompute the over-budget flag. */
      const updatePlan = (week: string, fn: (p: WeekPlan) => WeekPlan) =>
        setState((s) => {
          const plan = s.plans[week];
          if (!plan) return {};
          const next = fn(plan);
          const total = weekCost(next.meals, RECIPE_BY_ID, { country: next.country, storeId: next.storeId, overrides: s.overrides });
          return { plans: { ...s.plans, [week]: { ...next, overBudget: total > next.budget + 0.005 } } };
        });
      const updateMeal = (week: string, day: number, fn: (m: PlannedMeal) => PlannedMeal) =>
        updatePlan(week, (p) => ({ ...p, meals: p.meals.map((m) => (m.day === day ? fn(m) : m)) }));

      return {
        onboarded: false,
        profile: defaultProfile(),
        plans: {},
        favorites: [],
        overrides: {},
        supportId: randomId(),

        setProfile: (patch) => setState((s) => ({ profile: { ...s.profile, ...patch } })),
        setCountry: (country) =>
          setState((s) => ({
            profile: {
              ...s.profile,
              country,
              storeId: STORE_BY_ID[s.profile.storeId]?.country === country ? s.profile.storeId : DEFAULT_STORE[country],
              weeklyBudget: BUDGET[country].def,
            },
          })),
        completeOnboarding: () => setState({ onboarded: true }),

        planWeek: (week) => {
          const plan = makePlan(getState(), week);
          setState((s) => ({ plans: { ...s.plans, [week]: plan } }));
          return plan;
        },
        redoWeek: (week) => {
          const s = getState();
          const prev = s.plans[week];
          const keep = prev?.meals.filter((m) => m.locked) ?? [];
          const plan = makePlan(s, week, keep, prev);
          setState((st) => ({ plans: { ...st.plans, [week]: plan } }));
        },
        deletePlan: (week) =>
          setState((s) => {
            const plans = { ...s.plans };
            delete plans[week];
            return { plans };
          }),
        setMeal: (week, day, recipeId) => {
          if (!getState().plans[week]) {
            const s = getState();
            setState({
              plans: {
                ...s.plans,
                [week]: {
                  week,
                  createdAt: Date.now(),
                  storeId: s.profile.storeId,
                  country: s.profile.country,
                  budget: s.profile.weeklyBudget,
                  household: s.profile.household,
                  seed: newSeed(),
                  meals: [],
                  checks: {},
                  custom: [],
                },
              },
            });
          }
          updatePlan(week, (p) => {
            const existing = p.meals.find((m) => m.day === day);
            const meal: PlannedMeal = { day, recipeId, servings: existing?.servings ?? p.household, removed: [], locked: existing?.locked };
            const meals = existing ? p.meals.map((m) => (m.day === day ? meal : m)) : [...p.meals, meal].sort((a, b) => a.day - b.day);
            return { ...p, meals };
          });
        },
        removeMeal: (week, day) => updatePlan(week, (p) => ({ ...p, meals: p.meals.filter((m) => m.day !== day) })),
        setServings: (week, day, servings) => updateMeal(week, day, (m) => ({ ...m, servings: Math.max(1, Math.min(12, servings)) })),
        toggleRemoved: (week, day, id) =>
          updateMeal(week, day, (m) => ({ ...m, removed: m.removed.includes(id) ? m.removed.filter((x) => x !== id) : [...m.removed, id] })),
        toggleLock: (week, day) => updateMeal(week, day, (m) => ({ ...m, locked: !m.locked })),
        toggleCheck: (week, key, current) => updatePlan(week, (p) => ({ ...p, checks: { ...p.checks, [key]: !current } })),
        addCustom: (week, name) =>
          updatePlan(week, (p) => ({ ...p, custom: [...p.custom, { id: `custom-${Date.now().toString(36)}`, name: name.trim() }] })),
        removeCustom: (week, id) => updatePlan(week, (p) => ({ ...p, custom: p.custom.filter((c) => c.id !== id) })),
        toggleFavorite: (id) =>
          setState((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites] })),
        dislike: (id) =>
          setState((s) => ({
            profile: { ...s.profile, dislikes: s.profile.dislikes.includes(id) ? s.profile.dislikes : [...s.profile.dislikes, id] },
          })),
        setOverride: (key, price) =>
          setState((s) => {
            const overrides = { ...s.overrides };
            if (price === null) delete overrides[key];
            else overrides[key] = price;
            return { overrides };
          }),
        importData: (data) => setState((s) => ({ ...s, ...data })),
        reset: () => setState({ onboarded: false, profile: defaultProfile(), plans: {}, favorites: [], overrides: {}, supportId: randomId() }),
      };
    },
    {
      name: 'whipp-clone',
      version: 1,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        plans: s.plans,
        favorites: s.favorites,
        overrides: s.overrides,
        supportId: s.supportId,
      }),
    },
  ),
);

export const currentWeek = () => weekStart();
