# Whipp: research and feature audit

Research date: 2026-10-04. Covers Whipp v1.2.0 (released 2026-09-28).

## Sources

| Source | What it gave us |
|---|---|
| [whipp.app](https://www.whipp.app) | Marketing copy, FAQ, 6 in-app screenshots (older v1.0 build), brand colors and fonts (from CSS) |
| [whipp.app/support](https://www.whipp.app/support) | How planning works, settings, Profile screen contents, data deletion |
| [whipp.app/privacy](https://www.whipp.app/privacy) | Architecture: everything on-device, no account, built-in pricing, Superwall paywall |
| [whipp.app/terms](https://www.whipp.app/terms) | Pricing and trial rules, list of UK stores, Spain via OpenCesta price data |
| [App Store listing](https://apps.apple.com/app/id6778126199) | Full feature list, free vs premium split, prices, version history, 9 iPhone and 9 iPad screenshots (current v1.2 build) |
| Third-party (GRIN, web search) | Nothing beyond the official copy. No independent reviews yet. The app is about 4 months old. |

## Product summary

- **Name:** Whipp: Meal Planner & Recipes. The subtitle is "Budget Dinners & Grocery Lists" and the tagline is "Your meals sorted".
- **Maker:** Evoy Ltd, London.
- **Platforms:** iOS 17+, iPadOS, Apple Silicon Mac, visionOS and Android.
- **Markets:** US, UK, Canada and Australia, plus Spain (that store pricing comes from OpenCesta).
- **Core promise:** a full week of dinners in about 60 seconds. Each plan is priced at your store and kept under a weekly budget cap. You get an aisle-grouped grocery list with an estimated total, and recipes show calories and macros.
- **Library:** "300+ meals" ("hundreds of dinners").
- **Architecture (from the privacy policy):**
  - There is no account and no login.
  - Preferences, plans and saved recipes are stored only on the device.
  - Grocery prices are built into the app. Nothing is looked up live.
  - The only network traffic is to Superwall for subscriptions.
  - Planning therefore runs locally and deterministically. There is no AI or server call.
- **Pricing:**
  - Free tier, plus Premium at $7.99/month or $39.99/year. The annual plan has a 3-day trial.
  - Premium unlocks unlimited weeks, the budget cap, unlimited swaps and redos, the full library, diet and allergy fine-tuning, appliance planning and favorites.
- **Version history:**
  - 1.0 (Jun 12)
  - 1.1 (Sep 8): step-by-step cook mode and iPad support
  - 1.1.2: custom animations
  - 1.2.0: Canada and Australia, in-app feedback

## Design language

| Token | Value |
|---|---|
| Forest (primary dark / ink) | `#14301E` (variants `#1E4429`, `#0E2316`) |
| Lime (accent / CTA) | `#DDFC5C` |
| Lime soft / tint | `#E9F2D0` / `#EEF4D9` |
| Cream (app background) | `#F7F6F1` |
| Paper | `#EFEDE5` |
| Card | `#FFFFFF` |
| Ink soft / faint | `rgba(20,48,30,.64)` / `rgba(20,48,30,.42)` |
| Lines | `rgba(20,48,30,.10)` / `.16` |
| Sans font | Hanken Grotesk |
| Display font | A high-contrast serif for titles ("This week", day names, recipe names) and an *italic* serif for the accent word in onboarding titles ("Set your *budget*", "What are you *into?*") |
| Logo | Script "Whipp" wordmark in lime on forest, or forest on a lime highlight |

UI patterns:
- Large rounded cards (radius about 20–24) with soft shadows.
- Pill chips and a lime full-width primary button with a chevron.
- Progress rings.
- Bottom sheets with a grab handle.
- A floating pill tab bar on iPhone and a segmented top nav on iPad.
- Emoji icons for ingredients and aisles.

## Feature inventory

Legend: ✅ seen directly in a screenshot or the copy · 🔶 inferred from copy, but the exact UI was not seen · ❓ unknown

### 1. Onboarding (7 steps; a "n/7" progress bar with segments and a back button)

| Step | Content | Evidence |
|---|---|---|
| 1 | **YOUR STORE**: "Where do you *shop?*" / "Prices of meal plans adapt to your choice." A 2-column grid of store logo cards with a check badge on the selected one. US stores: Walmart, Kroger, Target, Aldi, Publix, Safeway, Wegmans, Trader Joe's, H-E-B, Meijer, Stop & Shop, Food Lion, Whole Foods, Costco. UK stores: Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl, Waitrose, M&S, Co-op. | ✅ |
| 2 | **WEEKLY BUDGET**: "Set your *budget*" / "Slide to set your weekly grocery cap." A big serif number with a lime glow and "per week" underneath. A slider from $25 to $135 (UK £25 to £150). A "Cooking for: N people" stepper with − and +. A "Show kid-friendly dinners" toggle. | ✅ |
| 3 | Probably **diet** (vegetarian, vegan, pescatarian, gluten-free, dairy-free, nut-free…) | 🔶 / ❓ |
| 4 | **YOUR PRIORITIES**: "What are you *into?*" / "Tap all that fit. They shape every week." Multi-select chips with emoji: ⚡ Quick prep, 💪 High protein, 🍝 Family favorites, 🥗 Healthy, 🥑 Low carb, 🌱 Gut friendly (UK build), 🍲 Comfort food, 🌿 Plant-forward, 🍱 Batch cook. A selected chip turns lime with a dark outline and a ⊗; an unselected chip is white with a ⊕. | ✅ |
| 5 | **YOUR KITCHEN**: "What's in your *kitchen?*" / "Tap what you have, or what you'd like to cook with." An isometric kitchen illustration with tappable appliances: Stove/Hob, Oven, Air fryer, Microwave, Rice cooker. Selected appliances glow lime and show a lime label. | ✅ |
| 6 | Probably **allergies and dislikes** ("Tell it once that cilantro tastes like soap — gone for good") | 🔶 / ❓ |
| 7 | Unknown. It could be dinners per week, a summary, or the "planning your week" animation. The paywall (Superwall) almost certainly follows. | ❓ |

### 2. Plan tab (home)

The header is forest green:
- ✅ Whipp logo, and a calendar button that opens My weekly plans.
- ✅ "This week", then "Sep 7 – 13 · 7 meals planned".
- ✅ A budget ring showing "80% used", then "$64.00 of $80".
- ✅ A store chip showing a bag icon and "Kroger".
- ✅ On iPad, three cards: **Budget** (ring), **Nutrition** (685 kcal average, with Protein 25% / Carbs 39% / Fat 37% mini-bars) and **Store** (logo).

Below the header:
- ✅ A week day strip from Mon to Sun with dates and ‹ › arrows. The selected day is filled forest.
- ✅ Two action buttons: lime **Grocery list** (· item count) and white **Redo**. Redo regenerates the whole week.
- ✅ Day sections show the serif day name and a muted date. Today has a lime **TODAY** badge.
- ✅ Each meal card shows:
  - a photo and tag chips
  - in the older build, a LUNCH/DINNER label (14 meals); the current build is dinners only (7 meals)
  - a serif title and a two-line description
  - "Serves 2 · 25 min" and a price, e.g. "$5.33 pp" (per person)
  - on iPad, a kcal figure as well
- 🔶 Swap a single meal, and remove an ingredient you don't like (both from a user review). The exact UI wasn't seen; it is likely a swipe or long-press, or a button on the recipe screen.
- ✅ The floating tab bar has **Plan · Discover · Favorites · Profile**.

### 3. My weekly plans (calendar button)

- ✅ "YOUR PLANS / My weekly plans".
- ✅ **UPCOMING**: dashed cards with a ✦ icon for "Next week · Sep 14 – 20 · Not planned yet" and "In 2 weeks", each with a lime **Plan** button.
- ✅ **PREVIOUS**: one card per past week with the date range, "Last week · Kroger", a row of 4 meal thumbnails and "+3". Each card opens that week.

### 4. Grocery list (bottom sheet on iPhone, full page on iPad)

- ✅ "Grocery list" in serif, then "38 items · Sep 7 – 13 · Kroger", and a close button.
- ✅ A forest card showing "Estimated total $64.00 of $80". On iPad it also has a ring and "0 of 38 in the cart".
- ✅ Aisle groups, each with an emoji tile: Fruit & Veg 🥦, Meat & Fish 🐟, Chilled & Dairy 🧀, Bakery 🥖, Cupboard 🥫, Frozen 🧊, **Pantry essentials** 🧂 ("Probably in your pantry"). Pantry rows start checked: cooking oil, olive oil, butter, salt.
- ✅ Each row has a checkbox, the name, a muted quantity (oz, lb, fl oz or count in the US; g, ml or count in the UK) and a price.
  - Prices are **pro-rata for the quantity used**. For example, "Carrot 1 · $0.02" and "Chicken thigh 14 oz · $1.51".
  - So the total is the cost of what the meals use, not the cost of whole packs.
- ✅ **Add your own item** ("e.g. Kitchen roll", +).
- ✅ **Share list** (iOS share sheet) and **Shop online at Kroger** (opens the retailer's website or app).

### 5. Recipe detail

- ✅ Hero photo with buttons for back or close, ♥ favorite, and a price pill ("$9.84 · $4.92 pp").
- ✅ A cuisine label (e.g. "Japanese") and tag chips.
- ✅ The serif title and a description.
- ✅ Three stat tiles: 👤 2 SERVES · ⏱ 30m TIME · 🔥 640 KCAL.
- ✅ Macro bars for Protein, Carbs and Fat in grams. Protein is forest, carbs olive and fat lime.
- ✅ A segmented control switching between **Ingredients** and **Preparation** (on iPad both show side by side).
- ✅ Ingredient rows show an emoji tile, the name, the quantity (fractions such as ½ tsp, ¼ cup, "2 whole", "2 clove") and either a price or **"Pantry"**. The list ends with "Total · serves 2 · $9.84" and an "N items" count.
- ✅ **Method**: "6 steps · 30 min", with numbered lime circles.
- ✅ **Cook step-by-step** / **Start cooking** opens cook mode (added in 1.1).
- ✅ **+ Add to this week** (lime, sticky at the bottom).
- 🔶 Scale the recipe to any number of servings (from the App Store copy).

### 6. Discover tab: 🔶

The App Store copy says "Unlock the full recipe library". The tab was not seen in any screenshot. It probably offers browse, search and tag filters across the 300+ recipes.

### 7. Favorites tab: 🔶

Saved (♥) recipes. Not seen.

### 8. Profile tab: 🔶

Known from the support and privacy pages:
- Edit the supermarket, weekly budget, household size, priorities, dietary needs, dislikes and kitchen equipment.
- Manage subscription.
- **Support ID**.
- **"Help shape Whipp"**, which sends feedback by email.
- Reset data.
- A rating prompt.

### 9. Planning behaviour (from the copy)

- Builds a week of dinners in about 60 seconds. The week "lands under" the budget cap, with a running total.
- "Swap any meal and the math updates." You can swap or redo one meal or the whole plan.
- Respects diet, allergies and disliked ingredients "on every week, automatically."
- Only suggests meals your appliances can make.
- Priorities shape every week. You get "fresh ideas, never the same week twice."
- You can plan next week and beyond, and revisit past weeks.
- Plans use everyday supermarket ingredients, so there are no "fantasy ingredients".

## Gaps

These could not be verified from public material:
- onboarding steps 3, 6 and 7
- the Discover, Favorites and Profile screens
- the swap-meal UI
- the full-screen cook mode
- the free-tier limits

Screenshots of these from the real app would let us match them exactly.
