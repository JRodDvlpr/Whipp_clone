# Audit: clone vs. Whipp

This is a row-by-row check of every feature in [`RESEARCH.md`](./RESEARCH.md) against what the clone does.

Legend:
- ✅ matches Whipp
- 🔶 built from Whipp's copy, but the screen hasn't been seen, so details may differ
- ➖ intentionally different, with the reason given
- ⬜ not done yet

Screenshots were checked with Playwright at iPhone 15 size (393×852) and iPad size (1180×820), side by side with the App Store screenshots.

## Onboarding

| Whipp | Clone | Status |
|---|---|---|
| 7 steps, segmented "n/7" progress bar, back button, lime "Continue ›" | Same | ✅ |
| 1. "Where do you *shop?*": grid of store logos, check badge, "Prices of meal plans adapt to your choice." | Same layout, copy and selected state. Stores are shown as brand-coloured name tiles, not logos. A country switch is added (US/UK/CA/AU). | ✅ / ➖ no logos (trademarks) |
| 2. "Set your *budget*": big serif number with lime glow, slider $25–$135 (£25–£150), "Cooking for" stepper, "Show kid-friendly dinners" toggle | Same | ✅ |
| 3. Unknown | "Which meals *should we plan?*": **Just dinner / Lunch & dinner**. Whipp's Profile shows a "Meals per day" setting, so this is likely the step. | 🔶 |
| 4. "What are you *into?*": 9 priority chips with emoji and ⊕/⊗ | Same chips, labels and states. "Gut friendly" is included. | ✅ |
| 5. "What's in your *kitchen?*": isometric kitchen, tap appliances (Stove/Hob, Oven, Air fryer, Microwave, Rice cooker), lime glow and labels | Hand-drawn isometric SVG kitchen. Each appliance can be tapped and gets a lime glow and label. Chips underneath for accessibility. | ✅ (illustration is simpler than Whipp's 3D render) |
| 6. Unknown | "Which days do *you cook?*" (Whipp Profile: "Cooking days") | 🔶 |
| 7. Unknown | "Anything to *avoid?*": diets, allergies and dislikes (Whipp Profile: "Dietary needs", "Dislikes") | 🔶 |
| "Whipping up your week" | Animated loader with progress ticks | 🔶 |
| Paywall (Superwall) | None. Everything is unlocked. | ➖ personal use |

## Plan tab

| Whipp | Clone | Status |
|---|---|---|
| Forest header: Whipp logo, calendar button, budget ring "% used", "This week", "Sep 7 – 13 · 7 meals planned", "$64.00 of $80", store chip | Same | ✅ |
| iPad: Budget / Nutrition (avg kcal + P/C/F %) / Store cards, segmented top nav | Same | ✅ |
| Day strip Mon–Sun with ‹ › arrows, selected day in forest | Same. The arrows move between weeks, and tapping a day scrolls to it. | ✅ |
| Lime "Grocery list" and white "Redo" | Same. Redo keeps any meals you've locked. | ✅ |
| Day sections in serif with a muted date and a lime TODAY badge | Same | ✅ |
| Meal card: photo, tag chips, serif title, description, "Serves 2 · 25 min", "$5.33 pp" | Same | ✅ |
| Swap a meal (Whipp's cards have no swap button) | Press and hold a card, or tap Swap on the recipe. The swap sheet shows 6 ranked alternatives with the price change, "More ideas", "Keep on Redo" and "Skip". | 🔶 |
| Headings in a bold sans font ("This week", day names and numbers). Day strip in its own band, highlighted day follows your scroll, lime dot on today, back arrow greyed on the current week | Same (matched to your Plan screenshot) | ✅ |
| Meals per day: Just dinner / Lunch & dinner | Lunch + dinner plans 14 meals with LUNCH/DINNER labels. Lunches come only from quick, lighter recipes. | ✅ |
| Remove an ingredient you don't like | Tap an ingredient on the recipe: "Leave out of this meal" or "Never show me this again". Cost and list update. | 🔶 |
| Floating tab bar: Plan · Discover · Favorites · Profile | Same | ✅ |

## My weekly plans

| Whipp | Clone | Status |
|---|---|---|
| UPCOMING: dashed "Next week" / "In 2 weeks" cards marked "Not planned yet", with a lime Plan button | Same (this week, next week, in 2 weeks) | ✅ |
| PREVIOUS: week cards with 4 thumbnails and "+3" | Same | ✅ |

## Grocery list

| Whipp | Clone | Status |
|---|---|---|
| Sheet: "Grocery list" (UK: "Shopping list"), "38 items · Sep 7 – 13 · Kroger", close button | Same | ✅ |
| Forest "Estimated total $64.00 of $80" card. iPad adds a ring and "0 of 38 in the cart". | Same | ✅ |
| Aisles: Fruit & Veg, Meat & Fish, Chilled & Dairy, Bakery, Cupboard, Frozen, Pantry essentials ("Probably in your pantry", pre-ticked) | Same. Pantry items fold away until you untick one. | ✅ |
| Rows: checkbox, name, quantity (oz/lb/count or g), pro-rata price | Same, plus which meals use each item | ✅ |
| Add your own item ("e.g. Kitchen roll") | Same | ✅ |
| Share list, "Shop online at {store}" | Same (Web Share or copy; opens the store's website) | ✅ |
| — | Tap a price to set your store's real price | ➕ extra |

## Recipe

| Whipp | Clone | Status |
|---|---|---|
| Hero photo, back/close, ♥, price pill "$9.84 · $4.92 pp" | Same | ✅ |
| Cuisine label, tag chips, serif title, description | Same | ✅ |
| Stat tiles: SERVES / TIME / KCAL | Same. You can scale servings from the SERVES tile. | ✅ |
| Protein/Carbs/Fat bars (forest/olive/lime) | Same | ✅ |
| Ingredients \| Preparation segmented control (side by side on iPad) | Same | ✅ |
| Ingredient rows: emoji tile, quantity (¼ cup, ½ tsp, "2 whole", "2 clove"), price or "Pantry", "Total · serves 2", "N items" | Same | ✅ |
| Method "6 steps · 30 min", numbered lime circles | Same | ✅ |
| "Cook step-by-step" / "Start cooking" | Full-screen cook mode: progress segments, large text, ingredients for each step, timers with an alert, keeps the screen awake, swipe between steps | 🔶 |
| "+ Add to this week" | Pick a night in this week, next week or the week after | ✅ |

## Other tabs and app-level features

| Whipp | Clone | Status |
|---|---|---|
| Discover: sticky header, search "Search meals, cuisines, tags", pills (Family friendly · Quick meal · Light · High protein · Veggie & vegan · One pan · Under $…), EXPLORE BY CUISINE photo cards, ALL MEALS list | Same (matched to your screenshots). The last pill's exact limit is a guess (Under $3 / £2.50). | ✅ |
| My favorites: heart-tile empty state "No favorites yet", list of meal cards | Same (matched). Favorites get a small boost in planning. | ✅ |
| Profile: Help shape Whipp → Send feedback. PREFERENCES (Store, Meals per day, Cooking days, Budget & household, Priorities, Kitchen equipment, Dietary needs, Dislikes), "Changes apply from your next weekly plan." REMINDERS: Weekly reminder. SPREAD THE WORD: Rate / Share. SUPPORT & LEGAL: Get help, Privacy, Terms, Manage subscription | Same layout. Feedback opens a GitHub issue. The weekly reminder adds a repeating calendar alert and a nudge in the app. No Rate or Manage subscription, because there's no App Store listing or paywall. Units and backup/restore are extra. | ✅ / ➖ |
| Plan unlimited weeks ahead, revisit past weeks | Same | ✅ |
| Budget cap: plans "land under it" | The planner is budget-aware. Property tests check it never goes over when a fitting week exists, across 300 random profiles. | ✅ |
| Diet, allergies and dislikes respected "automatically" | Hard filters. Diet labels and allergens are computed from the ingredients. Tested. | ✅ |
| Plans around your appliances | Hard filter, with "any one of" alternatives (e.g. oven *or* air fryer) | ✅ |
| "Never the same week twice" | Recipes from the last 3 weeks are pushed down the ranking. Redo uses a new random seed. | ✅ |
| 300+ meals | **310** original recipes | ✅ |
| US/UK/CA/AU stores, built-in prices | 36 stores. Every ingredient has a US (Walmart) and UK (Tesco) price, plus a price index for each store. CA and AU prices are derived from US prices. | ✅ (CA/AU approximate) |
| On-device only, no account | IndexedDB, no network calls except dish photos | ✅ |
| iPad support | Responsive layout matching Whipp's iPad screenshots | ✅ |
| Android | Works as a PWA in Chrome | ✅ |

## Known gaps

1. **Still unseen:** onboarding steps 3, 6 and 7, how Whipp triggers a swap, cook mode, and the grocery list and recipe screens on the current build. Screenshots of these would let me match them exactly.
2. **Library content.** 310 original recipes (Whipp: "300+"). These are not Whipp's own recipes, which aren't public.
3. **Prices.** They are estimates of shelf prices. Tap any price on your list to set the real price at your store.
4. **Photos.** Recipes whose dish isn't on TheMealDB show an illustrated plate. You can add your own photos later.
