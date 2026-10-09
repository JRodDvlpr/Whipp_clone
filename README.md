# Whipp clone

This is a personal-use clone of [Whipp](https://www.whipp.app), the budget meal planner. It plans a week of dinners around four things:
- your supermarket
- your weekly budget
- your taste
- your kitchen

Each week comes with an aisle-grouped grocery list and recipes that show calories and macros.

It runs as an installable web app (PWA). Like Whipp, everything stays on your device. There is no account and no server.

- **Research and feature audit:** [`docs/RESEARCH.md`](docs/RESEARCH.md)
- **Build plan and design decisions:** [`docs/PLAN.md`](docs/PLAN.md)

## Install on your iPhone

1. Open the GitHub Pages URL in **Safari**: `https://<your-github-username>.github.io/Whipp_clone/`
2. Tap **Share → Add to Home Screen**.
3. Open **Whipp** from your home screen. It runs full-screen and works offline.

To keep a backup of your plans and settings, use **Profile → Back up my data**.

## What's included

- **Onboarding:** 7 steps covering:
  - supermarket (US, UK, Canada, Australia)
  - weekly budget, number of people and kid-friendly mode
  - diet and allergies
  - priorities
  - an interactive kitchen where you tap your appliances
  - foods you can't stand
  - which nights you need dinner
- **Plan:**
  - a budget ring with estimated spend against your cap
  - a day strip and week navigation
  - swap, lock or skip any meal
  - **Redo** for the whole week
  - plan next week and beyond, and revisit past weeks
- **Grocery list:**
  - one list per week, grouped by aisle
  - quantities in oz/lb or g/kg
  - pro-rata prices and an estimated total
  - tick items off, add your own, share
  - "Shop online at {store}"
  - tap a price to set your store's real price
- **Recipes:**
  - photo, tags, servings scaler, time and kcal
  - protein/carbs/fat bars
  - ingredients with prices or "Pantry"
  - method, plus a step-by-step **cook mode** with timers that keeps the screen on
  - leave an ingredient out, or ban it forever
- **Discover:** search, filters and collections. **Favorites:** recipes you've saved with ♥. **Profile:** edit every preference, choose units, back up, restore or reset.
- **Her Balance (🌸):** an optional priority for a woman losing weight who wants meals that support hormones and nutrients. A meal earns the badge only if its computed numbers pass every rule: 350–650 kcal, 25 g+ protein, 7 g+ fiber, ≤ 60 g net carbs, little added sugar, no processed meat or fried food, and at least one key nutrient (iron, calcium, omega-3, leafy or cruciferous greens, legumes, whole grains). With it on, weeks are planned from these meals within your budget; Discover has a collection, recipes explain why they fit, and an explainer page (with a not-medical-advice note) covers the rules. Rules live in `src/engine/balance.ts`; 23 recipes in `src/data/recipes/balance.ts` were written for it.
- **Recipe library:** 333 original dinners. Nutrition, diet labels and allergens are *computed from the ingredients*, so the labels can't be wrong.
- **Prices:** typical shelf prices for each ingredient. The US base is Walmart and the UK base is Tesco. Each store has its own price index.

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # data validation + planner property tests
npm run e2e          # Playwright end-to-end tests (iPhone + iPad sizes)
npm run build        # production build in dist/
```

Pushing to `claude/whipp-clone` or `main` runs CI and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
The first time, you may need to enable Pages under **Settings → Pages → Source: GitHub Actions**.

## Notes

- Grocery totals are estimates, not receipts.
- Nutrition is a guide, not medical advice.
- Dish photos come from [TheMealDB](https://www.themealdb.com). Dishes it doesn't cover use free-licensed photos from [Wikimedia Commons](https://commons.wikimedia.org), self-hosted in `public/photos/` and credited in-app (Profile → photo credits) and in `src/data/photoCredits.ts`. The two remaining recipes show an illustrated plate.
- Store logos in `public/stores/` are trademarks of their owners, taken from Wikipedia/Wikimedia Commons (Target and Aldi redrawn as simple SVGs), and are used only to identify each store.
- This project isn't affiliated with Whipp/Evoy Ltd or with any of the supermarkets it names.
