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
- **Anti-inflammatory (🫒):** a second focus priority, Mediterranean-style. A meal qualifies only if it has no red or processed meat and nothing fried, 150 g+ vegetables and 6 g+ fiber a serving, at most 30 g of saturated-fat foods (cream, butter, hard cheese, coconut milk) and 50 g of refined grains, little added sugar, and at least two anti-inflammatory foods in real amounts (omega-3, olive oil, leafy or cruciferous greens, legumes, whole grains, colourful veg, turmeric/ginger, nuts/avocado). 42 meals qualify, 20 of them also Her Balance; pick both and weeks use meals with both badges. Rules live in `src/engine/antiInflammatory.ts`.
- **High protein (💪):** a third focus priority. Computed, never authored: 40 g+ protein a serving with 30%+ of calories from protein, from whole foods (no processed meat or fried food). 13 protein-packed plates were written for it in `src/data/recipes/protein.ts` (steak, avocado & crispy potatoes; steak & eggs; lok lak; satay skewers; ropa vieja; Creole pork chops; turkey meatloaf; salmon and tofu power bowls…), giving 45 meals. Rules live in `src/engine/protein.ts`. Focus priorities only narrow a week when it fits the budget with headroom; a focused week that still lands over budget is re-planned from everything.
- **Breakfast:** "Meals per day" now offers Breakfast & dinner and Breakfast, lunch & dinner. 22 breakfasts (`src/data/recipes/breakfast.ts`: overnight oats, parfaits, porridge, smoothies, pancakes, French toast, avocado toast, omelettes, shakshuka, burritos, huevos rancheros, hashes, tofu scramble, kedgeree, a full English…) fill breakfast slots only, may repeat up to 3 times a week, and are narrowed by focus priorities separately from lunch and dinner.
- **Recipe library:** 346 lunches and dinners plus 22 breakfasts. Nutrition, diet labels and allergens are *computed from the ingredients*, so the labels can't be wrong.
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
