import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RECIPES } from '../data/recipes';
import { TAG_LABELS } from '../data/taxonomy';
import { perServing } from '../engine/cost';
import { money } from '../engine/pricing';
import { usePriceCtx } from '../state/hooks';
import { useApp } from '../state/store';
import type { Country, Recipe } from '../types';
import { Icon } from '../ui/Icon';
import { MealImage } from '../ui/primitives';
import { PageHead, RecipeRow } from '../ui/RecipeRow';

/** "Under $3" — a per-person price that reads as cheap in each currency. */
const CHEAP: Record<Country, number> = { US: 3, UK: 2.5, CA: 4, AU: 4.5 };

type Filter = { id: string; label: string; test: (r: Recipe, pp: number) => boolean };

const filtersFor = (country: Country): Filter[] => [
  { id: 'balance', label: '🌸 Her Balance', test: (r) => r.tags.includes('balance') },
  { id: 'family', label: 'Family friendly', test: (r) => r.tags.includes('family') || !!r.kid },
  { id: 'quick', label: 'Quick meal', test: (r) => r.time <= 30 },
  { id: 'light', label: 'Light', test: (r) => r.nutrition.kcal <= 550 },
  { id: 'protein', label: 'High protein', test: (r) => r.tags.includes('high_protein') },
  { id: 'veg', label: 'Veggie & vegan', test: (r) => r.diets.includes('vegetarian') },
  { id: 'onepan', label: 'One pan', test: (r) => !!r.extra?.includes('one_pan') },
  { id: 'cheap', label: `Under ${money(CHEAP[country], country, CHEAP[country] % 1 === 0)}`, test: (_r, pp) => pp <= CHEAP[country] },
];

/** Recipe cuisines grouped into the cards shown under "Explore by cuisine". */
const CUISINES: { id: string; label: string; match: string[] }[] = [
  { id: 'italian', label: 'Italian', match: ['Italian', 'Italian-American'] },
  { id: 'american', label: 'American', match: ['American', 'Canadian', 'Modern'] },
  { id: 'mediterranean', label: 'Mediterranean', match: ['Mediterranean', 'Greek', 'Spanish', 'Portuguese', 'Turkish', 'Bulgarian'] },
  { id: 'mexican', label: 'Mexican & Latin', match: ['Mexican', 'Latin American', 'Costa Rican', 'Venezuelan', 'Argentinian', 'Cuban'] },
  { id: 'indian', label: 'Indian', match: ['Indian', 'Sri Lankan'] },
  { id: 'thai', label: 'Thai', match: ['Thai'] },
  { id: 'chinese', label: 'Chinese', match: ['Chinese'] },
  { id: 'japanese', label: 'Japanese & Korean', match: ['Japanese', 'Korean'] },
  { id: 'sea', label: 'Southeast Asian', match: ['Vietnamese', 'Malaysian', 'Filipino', 'Cambodian', 'Asian'] },
  {
    id: 'mideast',
    label: 'Middle Eastern & African',
    match: ['Middle Eastern', 'Moroccan', 'North African', 'Egyptian', 'Tunisian', 'Algerian', 'Syrian', 'Kenyan', 'Afghan'],
  },
  { id: 'caribbean', label: 'Caribbean', match: ['Caribbean'] },
  {
    id: 'european',
    label: 'British & European',
    match: ['British', 'Irish', 'French', 'Russian', 'Polish', 'Ukrainian', 'Danish', 'Dutch', 'Belgian', 'Norwegian', 'Eastern European', 'Uzbek'],
  },
];

/** Stable pseudo-random order so "All meals" isn't alphabetical but doesn't jump around. */
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function Discover() {
  const priorities = useApp((s) => s.profile.priorities);
  const ctx = usePriceCtx();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const filters = useMemo(() => filtersFor(ctx.country), [ctx.country]);
  const pp = useMemo(() => Object.fromEntries(RECIPES.map((r) => [r.id, perServing(r, ctx)])), [ctx]);

  // Your priorities first, otherwise a stable shuffle.
  const ordered = useMemo(() => {
    const match = (r: Recipe) => priorities.filter((p) => r.tags.includes(p)).length;
    return [...RECIPES].sort((a, b) => match(b) - match(a) || hash(a.id) - hash(b.id));
  }, [priorities]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = filters.find((x) => x.id === filter);
    const c = CUISINES.find((x) => x.id === cuisine);
    return ordered.filter((r) => {
      if (f && !f.test(r, pp[r.id])) return false;
      if (c && !c.match.includes(r.cuisine)) return false;
      if (!s) return true;
      const tags = [...r.tags, ...(r.extra ?? [])].map((t) => TAG_LABELS[t].toLowerCase());
      return (
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.cuisine.toLowerCase().includes(s) ||
        tags.some((t) => t.includes(s))
      );
    });
  }, [ordered, q, filter, cuisine, filters, pp]);

  const cuisineCards = useMemo(
    () =>
      CUISINES.map((c) => ({
        ...c,
        cover: RECIPES.find((r) => c.match.includes(r.cuisine) && r.image) ?? RECIPES.find((r) => c.match.includes(r.cuisine)),
      })).filter((c) => c.cover),
    [],
  );
  const browsing = !q && !filter && !cuisine;
  const balanceCount = useMemo(() => RECIPES.filter((r) => r.tags.includes('balance')).length, []);
  const activeCuisine = CUISINES.find((c) => c.id === cuisine);

  return (
    <div className="screen flush-top">
      <PageHead title="Discover">
        <label className="search" style={{ marginTop: 14 }}>
          <Icon name="search" size={20} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meals, cuisines, tags" aria-label="Search meals" />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>
        <div className="hscroll" style={{ marginTop: 14, paddingBottom: 4 }}>
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-pill ${filter === f.id ? 'on' : ''}`}
              onClick={() => setFilter(filter === f.id ? null : f.id)}
              aria-pressed={filter === f.id}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PageHead>

      {browsing && (
        <button className="balance-feature" onClick={() => setFilter('balance')}>
          <span className="balance-icon" aria-hidden="true">
            🌸
          </span>
          <span className="grow">
            <b>Her Balance</b>
            <span>Weight-loss friendly meals that support hormones — 25 g+ protein, 7 g+ fiber, 350–650 kcal.</span>
            <em>See {balanceCount} meals →</em>
          </span>
        </button>
      )}

      {browsing && (
        <>
          <div className="eyebrow section-title">Explore by cuisine</div>
          <div className="hscroll">
            {cuisineCards.map((c) => (
              <button key={c.id} className="cuisine-card" onClick={() => setCuisine(c.id)}>
                <MealImage recipe={c.cover!} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="row between section-title">
        <span className="eyebrow">{browsing ? 'All meals' : `${results.length} ${results.length === 1 ? 'meal' : 'meals'}`}</span>
        {filter === 'balance' && (
          <Link to="/info/balance" className="faint" style={{ fontSize: 14, textDecoration: 'underline' }}>
            How we choose
          </Link>
        )}
        {activeCuisine && (
          <button className="filter-pill on sm" onClick={() => setCuisine(null)} aria-label={`Clear ${activeCuisine.label}`}>
            {activeCuisine.label} <Icon name="close" size={14} stroke={2.6} />
          </button>
        )}
      </div>
      <div className="meal-list">
        {results.map((r) => (
          <RecipeRow key={r.id} recipe={r} />
        ))}
      </div>
      {!results.length && <p className="muted">Nothing matches — try another search or filter.</p>}
    </div>
  );
}

export function Favorites() {
  const favorites = useApp((s) => s.favorites);
  const recipes = favorites.map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean) as Recipe[];
  return (
    <div className="screen flush-top">
      <PageHead title="My favorites" />
      {recipes.length ? (
        <div className="meal-list" style={{ marginTop: 20 }}>
          {recipes.map((r) => (
            <RecipeRow key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="heart" size={30} stroke={1.8} />
          </div>
          <h2>No favorites yet</h2>
          <p>Tap the heart on any recipe and it will wait for you here.</p>
        </div>
      )}
    </div>
  );
}
