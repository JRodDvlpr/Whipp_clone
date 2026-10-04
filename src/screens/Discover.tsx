import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RECIPES } from '../data/recipes';
import { PRIORITIES } from '../data/taxonomy';
import { perServing } from '../engine/cost';
import { isEligible } from '../engine/planner';
import { money } from '../engine/pricing';
import { usePriceCtx } from '../state/hooks';
import { useApp } from '../state/store';
import type { Recipe } from '../types';
import { Icon } from '../ui/Icon';
import { MealImage, Toggle } from '../ui/primitives';

/** `cheap` is the cost-per-serving cut-off for the cheapest third of the library. */
type Filter = { id: string; label: string; test: (r: Recipe, pp: number, cheap: number) => boolean };

const FILTERS: Filter[] = [
  { id: 'all', label: 'All', test: () => true },
  ...PRIORITIES.map((p) => ({ id: p.id, label: p.label, test: (r: Recipe) => r.tags.includes(p.id) })),
  { id: 'vegan', label: 'Vegan', test: (r) => r.diets.includes('vegan') },
  { id: 'veggie', label: 'Veggie', test: (r) => r.diets.includes('vegetarian') },
  { id: 'fish', label: 'Fish & seafood', test: (r) => r.mainProtein === 'fish' || r.mainProtein === 'shellfish' },
  { id: 'budget', label: 'Budget', test: (_r, pp, cheap) => pp <= cheap },
];

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const ctx = usePriceCtx();
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const fav = favorites.includes(recipe.id);
  return (
    <Link to={`/recipe/${recipe.id}`} className="rcard">
      <div className="img">
        <MealImage recipe={recipe} />
        <button
          className="fav"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(recipe.id);
          }}
          aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
          aria-pressed={fav}
          style={{ color: fav ? '#e0475b' : 'var(--forest)' }}
        >
          <Icon name="heart" size={17} fill={fav} />
        </button>
      </div>
      <div className="b">
        <h3>{recipe.title}</h3>
        <div className="m">
          <span>
            {recipe.time}m · {recipe.nutrition.kcal} kcal
          </span>
          <b>{money(perServing(recipe, ctx), ctx.country)}</b>
        </div>
      </div>
    </Link>
  );
}

export function Discover() {
  const profile = useApp((s) => s.profile);
  const ctx = usePriceCtx();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [mine, setMine] = useState(true);
  const pp = useMemo(() => Object.fromEntries(RECIPES.map((r) => [r.id, perServing(r, ctx)])), [ctx]);
  const cheap = useMemo(() => Object.values(pp).sort((a, b) => a - b)[Math.floor(RECIPES.length / 3)], [pp]);

  const pool = useMemo(() => RECIPES.filter((r) => !mine || isEligible(r, { ...profile, kidFriendly: false })), [mine, profile]);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = FILTERS.find((x) => x.id === filter)!;
    return pool.filter(
      (r) =>
        f.test(r, pp[r.id], cheap) &&
        (!s || r.title.toLowerCase().includes(s) || r.cuisine.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)),
    );
  }, [pool, q, filter, pp, cheap]);

  const browsing = !q && filter === 'all';
  const collections: { title: string; items: Recipe[] }[] = [
    { title: 'Quick wins', items: pool.filter((r) => r.time <= 20) },
    { title: 'Budget heroes', items: [...pool].sort((a, b) => pp[a.id] - pp[b.id]).slice(0, 10) },
    { title: 'High protein', items: pool.filter((r) => r.nutrition.protein >= 45) },
    { title: 'Comfort classics', items: pool.filter((r) => r.tags.includes('comfort')) },
    { title: 'Plant-forward', items: pool.filter((r) => r.diets.includes('vegetarian')) },
  ].filter((c) => c.items.length >= 3);

  return (
    <div className="screen wide">
      <h1 className="title-xl" style={{ marginTop: 8 }}>
        Discover <span className="italic">dinners</span>
      </h1>
      <p className="muted" style={{ margin: '6px 0 16px' }}>
        {RECIPES.length} recipes, all priced at your store.
      </p>
      <label className="search">
        <Icon name="search" size={19} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes, cuisines…" aria-label="Search recipes" />
        {q && (
          <button onClick={() => setQ('')} aria-label="Clear search">
            <Icon name="close" size={18} />
          </button>
        )}
      </label>
      <div className="hscroll" style={{ marginTop: 14 }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={`pill-filter ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="row between" style={{ marginTop: 14 }}>
        <span style={{ fontWeight: 600 }}>Matches my diet & kitchen</span>
        <Toggle on={mine} onChange={setMine} label="Only show recipes that match my preferences" />
      </div>

      {browsing
        ? collections.map((c) => (
            <section key={c.title} className="collection">
              <h2 className="title-md" style={{ marginBottom: 12 }}>
                {c.title}
              </h2>
              <div className="hscroll">
                {c.items.slice(0, 10).map((r) => (
                  <RecipeCard key={r.id} recipe={r} />
                ))}
              </div>
            </section>
          ))
        : null}

      <h2 className="title-md" style={{ margin: '28px 0 12px' }}>
        {browsing ? 'All recipes' : `${results.length} ${results.length === 1 ? 'recipe' : 'recipes'}`}
      </h2>
      <div className="grid">
        {results.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
      {!results.length && <p className="muted">Nothing matches — try another filter.</p>}
    </div>
  );
}

export function Favorites() {
  const favorites = useApp((s) => s.favorites);
  const recipes = favorites.map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean) as Recipe[];
  return (
    <div className="screen wide">
      <h1 className="title-xl" style={{ marginTop: 8 }}>
        Your <span className="italic">favorites</span>
      </h1>
      <p className="muted" style={{ margin: '6px 0 20px' }}>
        {recipes.length ? `${recipes.length} saved ${recipes.length === 1 ? 'recipe' : 'recipes'}` : 'Nothing saved yet.'}
      </p>
      {recipes.length ? (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      ) : (
        <div className="card pad" style={{ textAlign: 'center', padding: 30 }}>
          <div style={{ fontSize: 44 }}>💚</div>
          <h2 className="title-md" style={{ marginTop: 8 }}>
            Tap ♥ on any recipe
          </h2>
          <p className="muted" style={{ margin: '8px 0 18px' }}>
            Favorites get a little boost when we plan your week.
          </p>
          <Link to="/discover" className="btn btn-lime">
            Browse recipes
          </Link>
        </div>
      )}
    </div>
  );
}
