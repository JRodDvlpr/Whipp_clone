import { describe, expect, it } from 'vitest';
import { ING, INGREDIENTS } from './ingredients';
import { RECIPE_SOURCES, RECIPES } from './recipes';
import { STORES } from './stores';
import { existsSync } from 'node:fs';
import { LOCAL_PHOTOS } from './photoCredits';
import { photoUrl } from './photos';
import { lineGrams } from '../engine/units';
import type { Diet } from '../types';

describe('ingredient catalog', () => {
  it('has unique ids', () => {
    const ids = INGREDIENTS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has plausible nutrition (macros ≈ kcal)', () => {
    for (const i of INGREDIENTS) {
      const [kcal, p, c, f] = i.n;
      // Low-energy produce and vinegars carry fibre/acids that don't follow 4/4/9 — negligible either way.
      if (kcal < 60) continue;
      const est = p * 4 + c * 4 + f * 9;
      expect(Math.abs(est - kcal) / kcal, `${i.id}: est ${est} vs ${kcal}`).toBeLessThan(0.35);
    }
  });

  it('has prices and a weight for per-each pricing', () => {
    for (const i of INGREDIENTS) {
      for (const c of ['US', 'UK'] as const) {
        expect(i.price[c][0], `${i.id} ${c}`).toBeGreaterThan(0);
        if (i.price[c][1] === 'each') expect(i.each, `${i.id} needs each`).toBeGreaterThan(0);
      }
      if (i.buy === 'count') expect(i.each, `${i.id} buy=count needs each`).toBeGreaterThan(0);
    }
  });
});

describe('recipes', () => {
  it('have unique ids and known photos', () => {
    const ids = RECIPE_SOURCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const photos = RECIPE_SOURCES.filter((r) => r.photo).map((r) => r.photo);
    expect(new Set(photos).size, 'each photo used once').toBe(photos.length);
    for (const r of RECIPE_SOURCES) {
      if (r.photo) expect(photoUrl(r.photo), `${r.id} photo ${r.photo}`).toBeTruthy();
      else expect(r.art, `${r.id} needs photo or art`).toBeTruthy();
    }
  });

  it('self-hosted photos exist and are credited', () => {
    for (const [id, c] of Object.entries(LOCAL_PHOTOS)) {
      expect(
        RECIPE_SOURCES.some((r) => r.id === id),
        `${id} is a recipe`,
      ).toBe(true);
      expect(existsSync(`public/photos/${id}.jpg`), `public/photos/${id}.jpg`).toBe(true);
      expect(c.artist && c.license && c.file, `${id} credit`).toBeTruthy();
    }
  });

  it('only use known ingredients with convertible units', () => {
    for (const r of RECIPE_SOURCES) {
      for (const line of r.ingredients) {
        expect(ING[line[0]], `${r.id}: unknown ${line[0]}`).toBeTruthy();
        expect(() => lineGrams(line), `${r.id}: ${line.join(' ')}`).not.toThrow();
        expect(line[1]).toBeGreaterThan(0);
      }
    }
  });

  it('have sensible per-serving nutrition', () => {
    for (const r of RECIPES) {
      expect(r.nutrition.kcal, `${r.id} kcal`).toBeGreaterThan(250);
      expect(r.nutrition.kcal, `${r.id} kcal`).toBeLessThan(1150);
      expect(r.nutrition.protein, `${r.id} protein`).toBeGreaterThan(8);
    }
  });

  it('have steps, time and appliances', () => {
    for (const r of RECIPES) {
      // No-cook breakfasts (overnight oats, smoothies) can be short and need no appliance.
      expect(r.steps.length, r.id).toBeGreaterThanOrEqual(r.breakfast ? 2 : 3);
      expect(r.time, r.id).toBeGreaterThanOrEqual(r.breakfast ? 5 : 10);
      if (!r.breakfast) expect(r.appliances.length, r.id).toBeGreaterThan(0);
      const text = r.steps.map((s) => s.text.toLowerCase()).join(' ');
      const needs = r.appliances.flat();
      if (/\bair fry/.test(text)) expect(needs, `${r.id} mentions air fryer`).toContain('air_fryer');
      if (/microwave/.test(text)) expect(needs, `${r.id} mentions microwave`).toContain('microwave');
    }
  });

  it('authored low-carb/healthy tags are believable', () => {
    for (const r of RECIPE_SOURCES) {
      const e = RECIPES.find((x) => x.id === r.id)!;
      if (r.tags.includes('low_carb')) expect(e.nutrition.carbs, `${r.id} low_carb`).toBeLessThanOrEqual(40);
      if (r.tags.includes('healthy')) expect(e.nutrition.kcal, `${r.id} healthy`).toBeLessThanOrEqual(800);
    }
  });

  it('cover every single diet with at least a week of dinners', () => {
    const diets: Diet[] = ['vegetarian', 'vegan', 'pescatarian', 'gluten_free', 'dairy_free', 'nut_free'];
    for (const d of diets) {
      const n = RECIPES.filter((r) => r.diets.includes(d)).length;
      expect(n, `${d} has ${n}`).toBeGreaterThanOrEqual(14);
    }
  });
});

describe('stores', () => {
  it('have unique ids and search templates', () => {
    expect(new Set(STORES.map((s) => s.id)).size).toBe(STORES.length);
    for (const s of STORES) expect(s.search).toContain('{q}');
  });
});
