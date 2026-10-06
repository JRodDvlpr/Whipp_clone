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
