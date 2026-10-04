import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ING, ingName } from '../data/ingredients';
import { RECIPE_BY_ID } from '../data/recipes';
import { DAY_LONG } from '../data/taxonomy';
import { lineCost, recipeCost } from '../engine/cost';
import { addWeeks, weekLabel, weekRange } from '../engine/dates';
import { money } from '../engine/pricing';
import { formatLineQty } from '../engine/units';
import { useIsWide, usePlanCtx } from '../state/hooks';
import { currentWeek, useApp } from '../state/store';
import type { Recipe as RecipeT, RecipeLine } from '../types';
import { Icon } from '../ui/Icon';
import { MealImage, Sheet, Tags, recipeTags, useToast } from '../ui/primitives';
import { SwapSheet } from './Plan';

export function Recipe() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const recipe = RECIPE_BY_ID[id];
  const weekParam = params.get('week');
  const dayParam = params.get('day');
  const plan = useApp((s) => (weekParam ? s.plans[weekParam] : undefined));
  const meal = plan && dayParam !== null ? plan.meals.find((m) => m.day === Number(dayParam) && m.recipeId === id) : undefined;
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const toggleFavorite = useApp((s) => s.toggleFavorite);
  const setServings = useApp((s) => s.setServings);
  const toggleRemoved = useApp((s) => s.toggleRemoved);
  const dislike = useApp((s) => s.dislike);
  const ctx = usePlanCtx(meal ? plan : undefined);
  const wide = useIsWide();
  const toast = useToast();
  const [localServings, setLocalServings] = useState(profile.household);
  const [tab, setTab] = useState<'ing' | 'prep'>('ing');
  const [picker, setPicker] = useState(false);
  const [swap, setSwap] = useState(false);
  const [ingSheet, setIngSheet] = useState<RecipeLine | null>(null);

  if (!recipe) {
    return (
      <div className="screen">
        <p>Recipe not found.</p>
        <Link to="/plan" className="btn btn-lime" style={{ marginTop: 16 }}>
          Back to plan
        </Link>
      </div>
    );
  }

  const servings = meal ? meal.servings : localServings;
  const scale = servings / recipe.serves;
  const removed = meal?.removed ?? [];
  const total = recipeCost(recipe, servings, ctx, removed);
  const fav = favorites.includes(recipe.id);
  const changeServings = (n: number) => (meal ? setServings(plan!.week, meal.day, n) : setLocalServings(Math.max(1, Math.min(12, n))));
  const back = () => (window.history.length > 1 ? nav(-1) : nav('/plan'));
  const cookUrl = `/cook/${recipe.id}?servings=${servings}`;

  const pricePill = (
    <span className="price-pill">
      {money(total, ctx.country)} <small>· {money(total / servings, ctx.country)} pp</small>
    </span>
  );
  const favBtn = (
    <button
      className="icon-btn"
      onClick={() => {
        toggleFavorite(recipe.id);
        toast.show(fav ? 'Removed from favorites' : 'Saved to favorites ♥');
      }}
      aria-label={fav ? 'Remove from favorites' : 'Save to favorites'}
      aria-pressed={fav}
      style={{ color: fav ? '#e0475b' : undefined }}
    >
      <Icon name="heart" size={21} fill={fav} />
    </button>
  );

  const actions = meal ? (
    <>
      <button className="btn btn-white" onClick={() => setSwap(true)}>
        <Icon name="swap" size={18} /> Swap
      </button>
      <button className="btn btn-lime grow" onClick={() => nav(cookUrl)}>
        <Icon name="play" size={16} fill /> Start cooking
      </button>
    </>
  ) : (
    <button className="btn btn-lime btn-block" onClick={() => setPicker(true)}>
      <Icon name="plus" size={20} stroke={2.6} /> Add to this week
    </button>
  );

  const header = (
    <>
      <Tags tags={recipeTags(recipe, profile.priorities, 3)} />
      <h1 className="title-xl" style={{ marginTop: 12 }}>
        {recipe.title}
      </h1>
      <p className="muted" style={{ marginTop: 8, fontSize: 16.5 }}>
        {recipe.description}
      </p>
      <div className="stat-tiles" style={{ marginTop: 18 }}>
        <div className="stat">
          <Icon name="user" size={18} />
          <div className="scaler">
            <button onClick={() => changeServings(servings - 1)} aria-label="Fewer servings" disabled={servings <= 1}>
              <Icon name="minus" size={14} stroke={2.6} />
            </button>
            <b style={{ margin: 0 }}>{servings}</b>
            <button onClick={() => changeServings(servings + 1)} aria-label="More servings">
              <Icon name="plus" size={14} stroke={2.6} />
            </button>
          </div>
          <small>SERVES</small>
        </div>
        <div className="stat">
          <Icon name="clock" size={18} />
          <b>{recipe.time}m</b>
          <small>TIME</small>
        </div>
        <div className="stat">
          <Icon name="flame" size={18} />
          <b>{recipe.nutrition.kcal}</b>
          <small>KCAL</small>
        </div>
      </div>
      <div className="card macros" style={{ marginTop: 12 }}>
        <Macro label="Protein" g={recipe.nutrition.protein} max={60} color="var(--forest)" />
        <Macro label="Carbs" g={recipe.nutrition.carbs} max={120} color="var(--olive)" />
        <Macro label="Fat" g={recipe.nutrition.fat} max={60} color="var(--lime)" />
      </div>
      <p className="faint" style={{ fontSize: 13, marginTop: 8 }}>
        Per serving · {recipe.cuisine}
      </p>
    </>
  );

  const ingredients = (
    <Ingredients recipe={recipe} scale={scale} servings={servings} removed={removed} ctx={ctx} onTap={meal ? setIngSheet : undefined} />
  );
  const method = <Method recipe={recipe} onCook={() => nav(cookUrl)} />;

  return (
    <>
      {wide ? (
        <div className="recipe-wide">
          <div style={{ gridColumn: '1 / -1' }} className="row">
            <button className="icon-btn" onClick={back} aria-label="Close">
              <Icon name="close" size={20} />
            </button>
            <span className="faint grow" style={{ fontWeight: 600 }}>
              {recipe.cuisine}
            </span>
            {pricePill}
            {favBtn}
            <div className="row" style={{ width: 380 }}>
              {actions}
            </div>
          </div>
          <div>
            <div style={{ borderRadius: 24, overflow: 'hidden', aspectRatio: '1.5' }}>
              <MealImage recipe={recipe} size="full" />
            </div>
            <div style={{ marginTop: 18 }}>{header}</div>
          </div>
          <div>
            {ingredients}
            <div style={{ marginTop: 18 }}>{method}</div>
          </div>
        </div>
      ) : (
        <div style={{ paddingBottom: 'calc(var(--safe-bottom) + 110px)', maxWidth: 'var(--maxw)', margin: '0 auto' }}>
          <div className="hero">
            <div className="media">
              <MealImage recipe={recipe} size="full" />
            </div>
            <div className="bar">
              <button className="icon-btn" onClick={back} aria-label="Back">
                <Icon name="back" size={22} stroke={2.4} />
              </button>
              <span className="grow" />
              {favBtn}
              {pricePill}
            </div>
          </div>
          <div className="recipe-sheet">
            {header}
            <div className="segmented" style={{ marginTop: 18 }}>
              <button className={tab === 'ing' ? 'on' : ''} onClick={() => setTab('ing')}>
                Ingredients
              </button>
              <button className={tab === 'prep' ? 'on' : ''} onClick={() => setTab('prep')}>
                Preparation
              </button>
            </div>
            <div style={{ marginTop: 14 }}>{tab === 'ing' ? ingredients : method}</div>
          </div>
          <div className="bottom-bar">
            <div className="inner">{actions}</div>
          </div>
        </div>
      )}

      {picker && <AddToWeekSheet recipe={recipe} onClose={() => setPicker(false)} onDone={(msg) => toast.show(msg)} />}
      {swap && plan && meal && (
        <SwapSheet
          plan={plan}
          day={meal.day}
          mode="swap"
          onClose={() => {
            setSwap(false);
            nav(`/plan?week=${plan.week}`, { replace: true });
          }}
        />
      )}
      <Sheet open={!!ingSheet} onClose={() => setIngSheet(null)} label="Ingredient options">
        {ingSheet && meal && (
          <>
            <div className="row" style={{ marginBottom: 16 }}>
              <span className="icon-tile soft" style={{ fontSize: 26 }}>
                {ING[ingSheet[0]].emoji}
              </span>
              <h2 className="title-md grow">{ingName(ingSheet[0], ctx.country)}</h2>
            </div>
            <div className="stack">
              <button
                className="btn btn-white btn-block"
                onClick={() => {
                  toggleRemoved(plan!.week, meal.day, ingSheet[0]);
                  setIngSheet(null);
                }}
              >
                {removed.includes(ingSheet[0]) ? 'Add back to this meal' : 'Leave out of this meal'}
              </button>
              {!profile.dislikes.includes(ingSheet[0]) && (
                <button
                  className="btn btn-forest btn-block"
                  onClick={() => {
                    dislike(ingSheet[0]);
                    if (!removed.includes(ingSheet[0])) toggleRemoved(plan!.week, meal.day, ingSheet[0]);
                    setIngSheet(null);
                    toast.show('Got it — gone for good');
                  }}
                >
                  <Icon name="ban" size={18} /> Never show me this again
                </button>
              )}
            </div>
            <p className="faint" style={{ fontSize: 13.5, marginTop: 12 }}>
              Leaving an ingredient out updates this week’s cost and grocery list.
            </p>
          </>
        )}
      </Sheet>
      {toast.node}
    </>
  );
}

function Macro({ label, g, max, color }: { label: string; g: number; max: number; color: string }) {
  return (
    <div className="macro">
      <span>{label}</span>
      <div className="bar">
        <i style={{ width: `${Math.min(100, (g / max) * 100)}%`, background: color }} />
      </div>
      <b>{g}g</b>
    </div>
  );
}

function Ingredients({
  recipe,
  scale,
  servings,
  removed,
  ctx,
  onTap,
}: {
  recipe: RecipeT;
  scale: number;
  servings: number;
  removed: string[];
  ctx: ReturnType<typeof usePlanCtx>;
  onTap?: (l: RecipeLine) => void;
}) {
  const units = useApp((s) => s.profile.units);
  const total = recipeCost(recipe, servings, ctx, removed);
  return (
    <>
      <div className="row between" style={{ margin: '4px 2px 10px' }}>
        <h2 className="title-md">Ingredients</h2>
        <span className="faint" style={{ fontWeight: 600 }}>
          {recipe.ingredients.length} items
        </span>
      </div>
      <div className="list-card">
        {recipe.ingredients.map((line) => {
          const ing = ING[line[0]];
          const isRemoved = removed.includes(line[0]);
          const Row = onTap ? 'button' : 'div';
          return (
            <Row key={line[0]} className={`ing-row ${isRemoved ? 'removed' : ''}`} onClick={onTap ? () => onTap(line) : undefined}>
              <span className="em">{ing.emoji}</span>
              <span className="name">
                {ingName(line[0], ctx.country)}
                {(line[3] || isRemoved) && <small>{isRemoved ? 'Left out' : line[3]}</small>}
              </span>
              <span className="qty">{formatLineQty(line, scale, ctx.country, units)}</span>
              {ing.pantry ? (
                <span className="pantry-lbl">Pantry</span>
              ) : (
                <span className="cost">{isRemoved ? '–' : money(lineCost(line, scale, ctx), ctx.country)}</span>
              )}
            </Row>
          );
        })}
        <div className="ing-total">
          <span>Total · serves {servings}</span>
          <span>{money(total, ctx.country)}</span>
        </div>
      </div>
    </>
  );
}

function Method({ recipe, onCook }: { recipe: RecipeT; onCook: () => void }) {
  return (
    <div className="card" style={{ padding: '18px 18px 6px' }}>
      <div className="row between">
        <h2 className="title-md">Method</h2>
        <span className="faint" style={{ fontWeight: 600 }}>
          {recipe.steps.length} steps · {recipe.time} min
        </span>
      </div>
      <button className="cook-row" style={{ marginTop: 14, boxShadow: 'none', background: 'var(--cream)' }} onClick={onCook}>
        <span className="play">
          <Icon name="play" size={13} fill />
        </span>
        <span className="grow" style={{ textAlign: 'left' }}>
          Cook step-by-step
        </span>
        <Icon name="chevronRight" size={20} />
      </button>
      <div style={{ marginTop: 6 }}>
        {recipe.steps.map((s, i) => (
          <div className="step" key={i}>
            <span className="n">{i + 1}</span>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddToWeekSheet({ recipe, onClose, onDone }: { recipe: RecipeT; onClose: () => void; onDone: (m: string) => void }) {
  const [week, setWeek] = useState(currentWeek());
  const plan = useApp((s) => s.plans[week]);
  const setMeal = useApp((s) => s.setMeal);
  const weeks = useMemo(() => [0, 1, 2].map((n) => addWeeks(currentWeek(), n)), []);
  return (
    <Sheet open onClose={onClose} label="Add to week">
      <div className="row between">
        <h2 className="title-lg">Add to which night?</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className="hscroll" style={{ margin: '14px calc(-1 * var(--gutter)) 6px' }}>
        {weeks.map((w) => (
          <button key={w} className={`pill-filter ${w === week ? 'on' : ''}`} onClick={() => setWeek(w)}>
            {weekLabel(w)}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginBottom: 10 }}>
        {weekRange(week)}
      </p>
      <div className="list-card">
        {DAY_LONG.map((d, i) => {
          const m = plan?.meals.find((x) => x.day === i);
          const r = m ? RECIPE_BY_ID[m.recipeId] : undefined;
          return (
            <button
              key={d}
              className="pref-row"
              onClick={() => {
                setMeal(week, i, recipe.id);
                onDone(`Added to ${d} ✓`);
                onClose();
              }}
            >
              <div className="grow">
                <b>{d}</b>
                <small>{r ? `Replaces ${r.title}` : 'Free night'}</small>
              </div>
              <Icon name={r ? 'swap' : 'plus'} size={18} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
