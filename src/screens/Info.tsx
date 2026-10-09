import { useNavigate, useParams } from 'react-router-dom';
import { LOCAL_PHOTOS } from '../data/photoCredits';
import { RECIPE_BY_ID } from '../data/recipes';
import { Icon } from '../ui/Icon';

type Section = { q: string; a: string };

const PAGES: Record<string, { title: string; intro?: string; sections: Section[] }> = {
  help: {
    title: 'Get help',
    sections: [
      {
        q: 'How do I plan a week?',
        a: 'Open the Plan tab and tap “Plan this week” (or Redo to start again). Whipp builds your week around your store, budget, priorities, diet and kitchen in seconds. Swap any meal from its recipe page, or press and hold a meal card.',
      },
      {
        q: 'How do I change my budget, store or diet?',
        a: 'Profile → Preferences. New plans use your latest settings automatically; plans you’ve already made keep the store and budget they were made with.',
      },
      {
        q: 'How accurate is the total?',
        a: 'It’s a close estimate, not an exact receipt. Recipes are costed by the amount they use at typical shelf prices for your store. Tap any price on your grocery list to enter your store’s real price — it’s used from then on.',
      },
      {
        q: 'Can it handle my diet, allergies and the foods I can’t stand?',
        a: 'Yes. Diets, allergies and dislikes are respected on every plan. Diet labels and allergens are worked out from each recipe’s ingredients. Always check packaged ingredient labels.',
      },
      {
        q: 'What if I don’t have an oven?',
        a: 'Tell Whipp what’s in your kitchen (Profile → Kitchen equipment) and it only plans recipes you can make with it.',
      },
      {
        q: 'How do I put Whipp on my home screen?',
        a: 'In Safari, open the app’s link, tap Share → Add to Home Screen. It then opens full-screen and works offline.',
      },
      {
        q: 'How do I keep my plans safe?',
        a: 'Everything is stored on this device. Use Profile → Back up my data to save a file you can restore on any device.',
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'The short version: your meal plans, preferences and recipes stay on your device.',
    sections: [
      {
        q: 'What stays on your device',
        a: 'Your store, budget, household size, dietary needs, dislikes, kitchen equipment, weekly plans, grocery ticks, price overrides and favorites are stored in this browser’s storage on your device. There is no account and nothing is uploaded.',
      },
      {
        q: 'What leaves your device',
        a: 'Only requests for dish photos, which are loaded from TheMealDB (the rest ship with the app). No analytics, ads, tracking or sign-in.',
      },
      {
        q: 'Your choices',
        a: 'Back up, restore or delete everything from Profile → Your data. Deleting the app (or clearing site data) removes it completely.',
      },
    ],
  },
  balance: {
    title: 'Her Balance',
    intro:
      'Meals for a woman losing weight who wants every plate to support her hormones and nutrients. Each meal is checked against the rules below from its own ingredients — the 🌸 badge is never hand-picked.',
    sections: [
      {
        q: '350–650 calories a serving',
        a: 'A satisfying meal that fits a gentle calorie deficit for most women (around 1,500–1,800 a day). Slow and steady loss protects muscle, energy and your cycle.',
      },
      {
        q: '25 g+ protein',
        a: 'Protein keeps you full for longer and helps you hold on to muscle while you lose fat, which keeps your metabolism up. It matters even more in perimenopause and beyond.',
      },
      {
        q: '7 g+ fiber and no more than 60 g net carbs',
        a: 'Fiber and protein with every meal mean steadier blood sugar and insulin, fewer cravings and a healthier gut. A healthy gut also helps your body clear used estrogen.',
      },
      {
        q: 'Little added sugar, no processed meat, nothing deep-fried',
        a: 'Sugary sauces, sausages, bacon and fried food are left out. Olive oil, oily fish, nuts and avocado bring the fats your hormones are built from.',
      },
      {
        q: 'Nutrients women often run short on',
        a: 'Every meal brings at least one in a real amount: iron (lost each month), calcium (bones, especially as estrogen falls), omega-3 (mood, cycles, inflammation), leafy greens for folate and magnesium, broccoli-family veg, legumes or whole grains.',
      },
      {
        q: 'Making it work',
        a: 'Turn on Her Balance under Priorities and your weeks are planned from these meals, within your budget. Aim for a palm of protein and half a plate of veg, drink plenty of water, and keep moving — strength training helps most.',
      },
      {
        q: 'Not medical advice',
        a: 'This is general healthy-eating guidance. If you’re pregnant or breastfeeding, have PCOS, thyroid, diabetes or another condition, take medication, or have a history of disordered eating, check with your doctor or a registered dietitian first.',
      },
    ],
  },
  'anti-inflammatory': {
    title: 'Anti-inflammatory',
    intro:
      'Mediterranean-style meals — the eating pattern with the strongest evidence for lowering long-term inflammation. Each meal is checked against the rules below from its own ingredients; the 🫒 badge is never hand-picked.',
    sections: [
      {
        q: 'No red or processed meat, nothing deep-fried',
        a: 'Sausages, bacon and other processed meats, and red meat eaten often, are linked to higher inflammation markers. Protein comes from fish, chicken, eggs, beans and lentils instead.',
      },
      {
        q: 'Plants first: 150 g+ veg and 6 g+ fiber a serving',
        a: 'Vegetables and fiber feed the gut bacteria that make anti-inflammatory short-chain fatty acids. Potatoes and herbs don’t count towards the 150 g.',
      },
      {
        q: 'Easy on saturated fat, refined grains and sugar',
        a: 'At most 30 g of cream, butter, hard cheese or coconut milk and 50 g of white pasta, rice or bread a serving, with little added sugar — the foods most tied to inflammation when eaten a lot.',
      },
      {
        q: 'At least two anti-inflammatory foods',
        a: 'Omega-3 from oily fish or walnuts, olive oil, leafy and broccoli-family greens, legumes, whole grains, colourful veg (tomatoes, peppers, sweet potato, squash), turmeric and ginger, nuts and avocado — in real amounts, not a sprinkle.',
      },
      {
        q: 'Making it work',
        a: 'Turn on Anti-inflammatory under Priorities and your weeks are planned from these meals within your budget. Pick Her Balance too and you’ll get meals that are both, when there are enough. Sleep, movement and less stress matter as much as food.',
      },
      {
        q: 'Not medical advice',
        a: 'This is general healthy-eating guidance. If you have an inflammatory or autoimmune condition, are pregnant, or take medication, talk to your doctor or a registered dietitian about what’s right for you.',
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      { q: 'Personal use', a: 'This is a personal, non-commercial clone of the Whipp meal planner.' },
      { q: 'Grocery estimates', a: 'Costs are estimates for guidance only. Actual prices at checkout may differ.' },
      {
        q: 'Nutrition',
        a: 'Calorie, macro and dietary information is a helpful guide and may not be exact. It isn’t medical advice — check labels if you have allergies or specific health needs.',
      },
      {
        q: 'Brands',
        a: 'Not affiliated with Whipp / Evoy Ltd or any supermarket named in the app. Store names are used only to show where you shop.',
      },
    ],
  },
};

/** Attribution for the self-hosted Wikimedia Commons photos (CC licenses require it). */
const CREDITS = {
  title: 'Photo credits',
  intro:
    'Most dish photos come from TheMealDB. The rest are from Wikimedia Commons, used under the licenses below. Photos show a similar dish and may differ from the recipe.',
  sections: Object.entries(LOCAL_PHOTOS)
    .map(([id, c]) => ({ q: RECIPE_BY_ID[id]?.title ?? id, a: `“${c.file}” by ${c.artist} · ${c.license} · Wikimedia Commons` }))
    .sort((a, b) => a.q.localeCompare(b.q)),
};

export function Info() {
  const { page = '' } = useParams();
  const nav = useNavigate();
  const def = page === 'credits' ? CREDITS : PAGES[page];
  if (!def) return null;
  return (
    <div className="screen">
      <div className="row" style={{ gap: 14, marginTop: 4 }}>
        <button className="icon-btn sq" onClick={() => nav(-1)} aria-label="Back">
          <Icon name="back" size={22} stroke={2.4} />
        </button>
        <h1 className="page-title" style={{ fontSize: 30 }}>
          {def.title}
        </h1>
      </div>
      {def.intro && (
        <p className="muted" style={{ margin: '20px 0 0', fontSize: 17 }}>
          {def.intro}
        </p>
      )}
      <div className="stack" style={{ marginTop: 20 }}>
        {def.sections.map((s) => (
          <div key={s.q} className="card pad">
            <b style={{ fontSize: 17 }}>{s.q}</b>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.5 }}>
              {s.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
