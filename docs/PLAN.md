# Whipp clone: build plan

Status: **built.** M0–M11 are done; see [`AUDIT.md`](./AUDIT.md) for the row-by-row comparison with Whipp.

Decisions (2026-10-04):
- Platform: installable web app (PWA).
- Tuning: US first, at Walmart. All other stores are still included.
- Photos: open photos from TheMealDB where a dish matches, and illustrated cards otherwise.
- Delivery: commit and push as work progresses, and deploy to GitHub Pages.
- Meals: dinners only, matching current Whipp. The older lunch + dinner mode may come later as an option.
The feature audit this plan is built from is in [`RESEARCH.md`](./RESEARCH.md).

## 1. Goals and scope

The goal is a personal-use clone that matches Whipp's features, flows and look as closely as public material allows.

In scope (everything in RESEARCH.md):
- the 7-step onboarding
- the Plan tab
- weekly plans (past and upcoming)
- swap and redo
- the grocery list
- recipe detail with scaling
- cook mode
- Discover, Favorites and Profile
- the iPad layout

Intentional differences:

| Whipp | Clone | Why |
|---|---|---|
| Paywall (Superwall), free vs premium | **Everything unlocked**, no paywall | Personal use |
| Superwall analytics and Support ID | None. Fully offline. | Nothing needs to leave the device |
| Their 300+ proprietary recipes and photos | **Our own recipe library**, written to the same style (see §5) | Their content isn't public and copying it isn't appropriate |
| Supermarket logos | Store names in brand-coloured text tiles | Avoids shipping trademarked logo files. Logos can be dropped in later for personal use. |

Small additions that fit the spirit of the app:
- Override an ingredient's price, so your store's estimates get more accurate.
- Back up and restore your data as a JSON file.

## 2. Platform recommendation

**Recommended: an installable web app (PWA) built with React, TypeScript and Vite.**

- It installs to your iPhone home screen from Safari ("Add to Home Screen"). It opens full-screen with no browser bar, and works offline.
- It needs no Mac, no Xcode and no $99/yr Apple developer account. A free-signed native app expires every 7 days; this doesn't.
- Whipp itself keeps all data on the device. We do the same with IndexedDB.
- Hosting is free on GitHub Pages.
- It works on Android, iPad and desktop too.
- I can drive it here with Playwright at iPhone and iPad sizes, and compare it screen by screen with the reference screenshots.

The trade-offs:
- It has no App Store presence.
- Haptics are limited on iOS.
- Safari can clear web data from sites that aren't installed. Installed home-screen apps are exempt, and the backup/export feature is the safety net.

Alternatives, if you prefer:
- **Expo (React Native).** It feels more native, but installing it permanently on your iPhone needs a paid Apple developer account. The planning engine and data would carry over unchanged.
- **Native SwiftUI.** This is closest to the original, but needs a Mac with Xcode to build. I can't build or test it in this environment.

## 3. Tech stack

| Concern | Choice |
|---|---|
| UI | React 19, TypeScript (strict), Vite |
| Styling | CSS with design tokens (CSS variables taken from Whipp's own CSS) and CSS modules. No UI kit, so the look can match Whipp exactly. |
| Fonts | Hanken Grotesk (Whipp's actual sans), plus a high-contrast display serif and its italic for titles. The plan is DM Serif Display or Instrument Serif; I'll pick whichever is closest to the screenshots. All fonts are self-hosted so they work offline. |
| Routing | React Router (tabs, recipe/:id, list, cook/:id, plans) |
| State | Zustand, with persistence to IndexedDB (`idb-keyval`) and versioned migrations |
| Animation | CSS transitions and the View Transitions API, plus a small `motion` library for sheets, the ring and the "whipping up your week" loader |
| PWA | `vite-plugin-pwa`: manifest, icons and an offline cache of the app and photos |
| Tests | Vitest for the engine and the data validation. Playwright for end-to-end flows and screenshots at iPhone 15 (393×852) and iPad (1024×1366). |
| Quality | ESLint, Prettier and `tsc --noEmit`, all run in CI |
| Deploy | A GitHub Actions workflow that publishes to GitHub Pages (only if you OK it) |

## 4. Architecture

```
src/
  data/
    ingredients.ts     canonical ingredient catalog (single source of truth)
    recipes/*.ts       recipe library, one file per ~20 recipes
    stores.ts          stores per country: name, colour, price index, online search URL
    taxonomy.ts        tags, priorities, diets, allergens, appliances, aisles (order + emoji)
  engine/              pure TypeScript, no React; fully unit-tested
    nutrition.ts       per-serving kcal/P/C/F computed from ingredients
    classify.ts        auto-derive diet + allergen flags from ingredients
    pricing.ts         pro-rata ingredient cost × store index × country prices
    units.ts           metric/imperial, nice fractions (½, ¼, 1¼), display units per country
    scale.ts           scale a recipe to N servings
    planner.ts         generateWeek / redoWeek / swapOptions / fitBudget
    groceryList.ts     aggregate week → aisle groups, pantry essentials, custom items
    rng.ts             seeded PRNG so plans are reproducible and "Redo" differs
  state/               Zustand stores: profile, plans (by ISO week), favorites, list checks, overrides
  ui/                  design-system components
  screens/             onboarding/*, plan, plans, grocery, recipe, cook, discover, favorites, profile
```

### Data model

```ts
Ingredient {
  id; name; nameUK?;                        // e.g. cilantro / coriander, scallion / spring onion
  emoji; aisle;                             // fruit_veg | meat_fish | chilled_dairy | bakery | cupboard | frozen | pantry
  per100g: { kcal, protein, carbs, fat, fiber };
  gramsPer: { each?, tbsp?, tsp?, cup?, clove?, ml? };  // unit conversion
  allergens: ('gluten'|'dairy'|'egg'|'peanut'|'tree_nut'|'soy'|'fish'|'shellfish'|'sesame')[];
  animal: 'meat'|'poultry'|'fish'|'shellfish'|'dairy'|'egg'|'honey'|null;
  pantry: boolean;                          // shown as "Pantry", excluded from totals
  price: { US: {per:'kg'|'each'|'l', amount}, UK: {...}, CA?, AU? };
  displayUnit: { US: 'oz'|'lb'|'count'|'fl oz', UK: 'g'|'kg'|'count'|'ml' };
}

Recipe {
  id; title; description; cuisine; image;
  timeMin; baseServings: 2;
  tags: PriorityTag[];                      // quick, high_protein, family, healthy, low_carb, gut_friendly, comfort, plant_forward, batch_cook, budget, one_pan
  kidFriendly: boolean;
  appliances: { required: Appliance[]; optional?: Appliance[] };   // stove, oven, air_fryer, microwave, rice_cooker
  ingredients: { id, qty, unit, note? }[];
  steps: { text, timerSec? }[];
  // derived at build time and checked by tests, never hand-entered:
  // nutritionPerServing, diets (vegan/vegetarian/pescatarian/GF/DF/NF), allergens, costPerServing
}

Profile {
  country; storeId; weeklyBudget; householdSize; kidFriendly;
  diets[]; allergens[]; dislikedIngredientIds[]; priorities[]; appliances[];
  dinnersPerWeek (default 7); units ('auto'|'metric'|'imperial');
}

WeekPlan {
  weekStart (ISO Monday); storeId; budget; householdSize; seed;
  days: { date, recipeId | null, servings, removedIngredientIds[] }[];
  listChecks: Record<itemKey, boolean>; customItems: {name, checked}[];
}
```

Nutrition, diet flags, allergens and cost are always **computed from the ingredients**, never typed in by hand. That way the numbers on every screen agree, and a recipe can't be tagged "vegan" while it contains honey.

### Planning engine (`planner.ts`)

1. **Hard filters.** Drop any recipe that:
   - doesn't match the diet
   - contains an allergen
   - contains a disliked ingredient
   - needs an appliance you don't have
   - isn't kid-friendly, when kid-friendly is on
2. **Score each remaining recipe.**
   - Points for each selected priority tag it matches.
   - Points for novelty: a penalty if it appeared in the last 2–3 weeks. This is "never the same week twice".
   - A small boost for favorites.
   - A little seeded randomness, so Redo gives a different week.
3. **Build the week greedily, with variety rules:**
   - no main protein on two consecutive days
   - at most 2 recipes of one cuisine
   - a mix of cooking times
   - a bonus for **sharing fresh ingredients** with meals already chosen (half a bag of spinach gets used twice, so there's less waste)
4. **Fit the budget.** If the cost for the household exceeds the cap, repeatedly swap the meal with the worst score per dollar for the best cheaper candidate, until the week is under the cap. If it can never fit, return the cheapest valid week and show a gentle "Your budget's tight. Here's the closest we could get" note.
5. **Swap.** `swapOptions(day)` returns 3–5 ranked alternatives that keep the week under budget. The math updates live.
6. **Redo.** Regenerate the week with a new seed. A day can be locked so Redo leaves it alone.
7. **Remove an ingredient** from one meal. The cost and grocery list update, and you get the option to dislike that ingredient for good.

All of this is pure functions over local data, so it runs instantly. A short loader animation runs on top to match Whipp's "whipping up your week" feel.

### Pricing

- Each ingredient carries a typical shelf price per kg, litre or item for each country. These are estimates, as Whipp's are.
- Each store has a **price index**. For example: Aldi 0.85, Walmart 0.92, Kroger 1.00, Target 1.05, Whole Foods 1.30. UK examples: Aldi/Lidl 0.85, Asda 0.92, Tesco 1.00, Sainsbury's 1.05, Waitrose 1.25, M&S 1.35.
- Cost is **pro-rata for the quantity used**, as in Whipp's screenshots. A recipe's price is the sum of what its ingredients use, scaled to the household.
- "pp" means per person. Pantry items are excluded.
- You can override any ingredient's price from the grocery list. The override is saved and used in every future plan.

### Grocery list

The list combines every meal in the week, scaled per meal to the household size, and minus any removed ingredients.

- Same-ingredient lines merge across meals.
- Quantities convert to a sensible display unit (oz, lb or count in the US; g, kg or count in the UK).
- Lines are grouped in the fixed aisle order: Fruit & Veg, Meat & Fish, Chilled & Dairy, Bakery, Cupboard, Frozen, then Pantry essentials (which start ticked).

Other features:
- Ticks persist for each week.
- Shows "N of M in the cart".
- Add your own item.
- **Share list** uses the Web Share API, or copies the list as text.
- **Shop online at {store}** opens the store's website search. Each item also has a search link.

## 5. Recipe and content strategy (the biggest piece of work)

Whipp's recipes are proprietary and not publicly available, so I will write an **original library in the same style**:

- Everyday supermarket ingredients and approachable dinners. Examples: Teriyaki Chicken & Rice, Halloumi Shakshuka, Pesto Chicken & Pasta, Sri Lankan Dhal, Black Bean Burrito Bowl.
- Coverage across every diet, priority, appliance and cuisine, so that every filter combination still produces a full week.

The library would be built in three batches:
- **Batch 1:** 80 recipes. Enough to run every combination of filters.
- **Batch 2:** 160.
- **Batch 3:** 300+, to match Whipp's library size.

Every recipe is checked by an automated validation script. The script fails if:
- an ingredient is unknown
- the computed kcal or macros look implausible
- a step is missing or the time is unrealistic
- an appliance is used in the steps but not declared
- any diet or allergen combination has fewer than 14 recipes

**Photos** need your decision (question C):
- **Option 1:** Free photos from TheMealDB (an open recipe database with about 300 dish photos), where a dish matches. Recipes with no match get a styled illustrated card (emoji and colour) until a photo is added.
- **Option 2:** Illustrated cards only. This is consistent and needs no external assets.
- **Option 3:** Choose your own photos later. The image field is just a URL or a file in `public/meals/`.

## 6. Screens and build order (milestones)

Each milestone ends with tests, typecheck and lint passing, plus Playwright screenshots I review against the references.

| # | Milestone | Contents |
|---|---|---|
| M0 | Scaffold and design system | Vite+React+TS, tokens, fonts, logo wordmark. Components: Button (lime/white/forest), Chip (toggle with ⊕/⊗), Card, ProgressRing, BottomSheet, FloatingTabBar, Stepper, BudgetSlider, Segmented, MacroBars, StatTile, DayStrip, TagPill. A component gallery page. |
| M1 | Data foundation | Taxonomy, ingredient catalog (~250 ingredients), stores (US, UK, CA, AU), the first 80 recipes, and the validation script and tests |
| M2 | Engine | nutrition, classify, pricing, units, scale, planner, groceryList, all with unit tests (budget fit, filters never violated, variety, determinism with seed) |
| M3 | Onboarding | 7 steps: Store → Budget and household (+kid-friendly) → Diet → Priorities → Kitchen (an SVG isometric kitchen you tap) → Allergies and dislikes (search ingredients) → Dinners per week and start day → "Whipping up your week…" loader |
| M4 | Plan tab | Forest header (ring, spend of budget, store chip, Nutrition card on iPad), day strip, TODAY badge, Grocery list and Redo, day sections and meal cards, swap sheet, lock day, empty-day "add a meal" |
| M5 | Recipe and cook mode | Recipe detail (hero, ♥, price pill, stats, macros, Ingredients/Preparation, servings scaler, Add to this week). Full-screen cook mode: one step per screen, swipe, built-in timers, Wake Lock so the screen stays on. |
| M6 | Grocery list | Sheet on iPhone and a multi-column page on iPad; estimated total card; aisles; pantry essentials; check-off; add item; share; shop online; price override |
| M7 | Weekly plans | Calendar screen: Upcoming (Next week, In 2 weeks → Plan) and Previous (thumbnails +N), with each week opening read-only or editable |
| M8 | Discover, Favorites, Profile | Discover: search, tag and cuisine filters, collections ("Quick wins", "Under $3 pp", "High protein"…). Favorites grid. Profile: edit every preference, units, data backup/restore, reset, feedback (mailto), about. |
| M9 | PWA, iPad and polish | Manifest, icons and offline support. iPad two-column layouts. Animations (sheets, ring fill, chip pops, loader). Accessibility (contrast, labels, reduced motion). Then deploy. |
| M10 | Content expansion | Recipes to 160, then 300+ |
| M11 | Final audit | Walk the RESEARCH.md checklist row by row, compare screenshots side by side, and give you a report of anything that still differs |

## 7. Verification

- **Engine invariants** are property-tested over random profiles. A generated week:
  - never contains a filtered-out recipe
  - never exceeds the budget when a fitting week exists
  - never repeats a recipe within a week
  - is deterministic for a given seed
- **Data validation** runs in CI on every recipe.
- **End-to-end tests** cover first launch → onboarding → week planned → swap → grocery list ticks → recipe → cook mode → favorite → next week, and check that data survives a reload.
- **Visual audit:** Playwright screenshots at iPhone and iPad sizes, compared with the reference screenshots in RESEARCH.md for each milestone.

## 8. Risks and how they're handled

| Risk | Mitigation |
|---|---|
| Price estimates drift from real shelf prices | Clearly labelled "estimate", the same as Whipp. Per-ingredient overrides. Store index. Prices kept in one file so they're easy to update. |
| Recipe quality and nutrition accuracy | Nutrition is computed from per-100g reference values, not guessed. Automated plausibility checks. I'll flag any recipe I'm unsure of. |
| Unseen screens (onboarding 3/6/7, Discover, Profile, swap, cook mode) | Built from the copy plus the app's design language. Screenshots from you would make these exact. |
| iOS clearing PWA storage | Install to the home screen (exempt). Backup/restore to a file. |
| Library too small for strict filters (e.g. vegan + nut-free + microwave only) | A coverage test enforces a minimum per combination. If there truly aren't enough, the planner fills the week with fewer meals and tells you. |

## 9. Still useful from you

Screenshots from the real app of the screens listed in RESEARCH.md → "Gaps". These are:
- onboarding steps 3, 6 and 7
- the Discover, Favorites and Profile tabs
- the swap-meal flow
- cook mode
