import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RECIPES, RECIPE_BY_ID } from '../data/recipes';
import { DAY_LONG, DAY_SHORT } from '../data/taxonomy';
import { addWeeks, dayDate, shortDate, todayIndex, weekLabel, weekRange } from '../engine/dates';
import { swapOptions } from '../engine/planner';
import { money } from '../engine/pricing';
import { newSeed } from '../engine/rng';
import { useIsWide, usePlanCtx, useWeekSummary } from '../state/hooks';
import { currentWeek, useApp } from '../state/store';
import type { PlannedMeal, WeekPlan } from '../types';
import { Icon } from '../ui/Icon';
import { MealImage, Ring, Sheet, Tags, TopNav, recipeTags, useToast } from '../ui/primitives';

export function Plan() {
  const [params, setParams] = useSearchParams();
  const week = params.get('week') ?? currentWeek();
  const plan = useApp((s) => s.plans[week]);
  const profile = useApp((s) => s.profile);
  const planWeek = useApp((s) => s.planWeek);
  const redoWeek = useApp((s) => s.redoWeek);
  const summary = useWeekSummary(plan);
  const nav = useNavigate();
  const toast = useToast();
  const wide = useIsWide();
  const today = todayIndex(week);
  const [selected, setSelected] = useState(today >= 0 ? today : 0);
  const [swap, setSwap] = useState<{ day: number; mode: 'swap' | 'add' } | null>(null);
  const country = plan?.country ?? profile.country;
  const fmt = (n: number) => money(n, country);

  useEffect(() => {
    setSelected(today >= 0 ? today : 0);
  }, [week, today]);

  const goWeek = (n: number) => setParams({ week: addWeeks(week, n) }, { replace: true });
  const jump = (day: number) => {
    setSelected(day);
    document.getElementById(`day-${day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const label = weekLabel(week);
  const days = plan ? [...new Set([...profile.days, ...plan.meals.map((m) => m.day)])].sort((a, b) => a - b) : profile.days;

  return (
    <>
      <header className="plan-head">
        <div className="inner">
          <div className="row between">
            <div className="logo">Whipp</div>
            <TopNav />
            <Link to="/plans" className="icon-btn outline-lime" aria-label="My weekly plans">
              <Icon name="calendar" size={20} />
            </Link>
          </div>

          {wide && summary ? (
            <>
              <div style={{ marginTop: 16 }}>
                <span className="week-title">{label}</span>
                <span className="meta" style={{ marginLeft: 10 }}>
                  {weekRange(week)} · {summary.count} meals
                </span>
              </div>
              <div className="head-cards">
                <div className="head-card row between">
                  <div>
                    <div className="row" style={{ gap: 8, fontWeight: 700 }}>
                      <span className="icon-tile sm" style={{ color: 'var(--forest)' }}>
                        <Icon name="bag" size={16} />
                      </span>{' '}
                      Budget
                    </div>
                    <div className="spend" style={{ marginTop: 10, fontSize: 24 }}>
                      {fmt(summary.total)} <small>/ {money(summary.budget, country, true)}</small>
                    </div>
                  </div>
                  <Ring pct={summary.pct} size={70} stroke={7} label={`${Math.round(summary.pct * 100)}%`} sub="used" />
                </div>
                <div className="head-card row between">
                  <div>
                    <div className="row" style={{ gap: 8, fontWeight: 700 }}>
                      <span className="icon-tile sm" style={{ background: '#f7c59f', color: 'var(--forest)' }}>
                        <Icon name="flame" size={16} />
                      </span>{' '}
                      Nutrition
                    </div>
                    <div className="spend" style={{ marginTop: 10, fontSize: 24 }}>
                      {summary.avg?.kcal ?? '–'} <small>kcal · Avg. calories</small>
                    </div>
                  </div>
                  {summary.macroPct && (
                    <div style={{ display: 'grid', gap: 4, fontSize: 13, minWidth: 120 }}>
                      {(['protein', 'carbs', 'fat'] as const).map((k, i) => (
                        <div key={k} className="row" style={{ gap: 8 }}>
                          <span style={{ width: 22, height: 5, borderRadius: 9, background: ['#fff', 'var(--olive)', 'var(--lime)'][i] }} />
                          <span style={{ flex: 1, textTransform: 'capitalize', opacity: 0.8 }}>{k}</span>
                          <b>{summary.macroPct![k]}%</b>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link to="/profile/edit/store" className="head-card row between">
                  <div>
                    <div className="row" style={{ gap: 8, fontWeight: 700 }}>
                      <span className="icon-tile sm" style={{ background: '#bcd7f5', color: 'var(--forest)' }}>
                        <Icon name="store" size={16} />
                      </span>{' '}
                      Store
                    </div>
                    <div className="spend" style={{ marginTop: 10, fontSize: 24 }}>
                      {summary.storeName}
                    </div>
                  </div>
                </Link>
              </div>
            </>
          ) : (
            <div className="row" style={{ gap: 18, marginTop: 14, alignItems: 'center' }}>
              <Ring pct={summary?.pct ?? 0} label={summary ? `${Math.round(summary.pct * 100)}%` : '–'} sub="used" />
              <div className="grow">
                <h1 className="week-title">{label}</h1>
                <div className="meta">
                  {weekRange(week)} · {summary ? `${summary.count} meals planned` : 'Not planned yet'}
                </div>
                <div className="row" style={{ marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                  <span className="spend">
                    {fmt(summary?.total ?? 0)} <small>of {money(plan?.budget ?? profile.weeklyBudget, country, true)}</small>
                  </span>
                  <Link to="/profile/edit/store" className="store-chip">
                    <Icon name="bag" size={15} /> {summary?.storeName ?? ''}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={`screen ${wide ? 'wide' : ''}`} style={{ paddingTop: 0 }}>
        <div className="day-strip">
          <button className="arrow-btn" onClick={() => goWeek(-1)} aria-label="Previous week">
            <Icon name="chevronLeft" size={22} />
          </button>
          <div className="days">
            {DAY_SHORT.map((d, i) => {
              const has = plan?.meals.some((m) => m.day === i);
              return (
                <button
                  key={d}
                  className={`day-pill ${i === selected ? 'on' : ''} ${has ? '' : 'empty'}`}
                  onClick={() => jump(i)}
                  aria-label={`${DAY_LONG[i]}${has ? '' : ', no dinner planned'}`}
                >
                  <small>{d}</small>
                  <b>{dayDate(week, i).getDate()}</b>
                  {i === today && i !== selected && <span className="dot" />}
                </button>
              );
            })}
          </div>
          <button className="arrow-btn" onClick={() => goWeek(1)} aria-label="Next week">
            <Icon name="chevronRight" size={22} />
          </button>
        </div>

        {plan ? (
          <>
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn btn-lime grow" onClick={() => nav(`/list/${week}`)}>
                <Icon name="list" size={20} /> {profile.country === 'UK' ? 'Shopping list' : 'Grocery list'}
                {wide && summary ? ` · ${summary.listCount}` : ''}
              </button>
              <button
                className="btn btn-white"
                onClick={() => {
                  redoWeek(week);
                  toast.show('Fresh week whipped up ✨');
                }}
              >
                <Icon name="redo" size={19} stroke={2.4} /> Redo
              </button>
            </div>
            {plan.overBudget && (
              <div className="notice">
                <Icon name="alert" size={18} />
                <span>
                  This week is over your {money(plan.budget, country, true)} cap. Swap a meal for a cheaper one, or raise your budget in Profile.
                </span>
              </div>
            )}
            <div className="meal-list">
              {days.map((day) => {
                const meal = plan.meals.find((m) => m.day === day);
                return (
                  <section key={day} className="day-block" id={`day-${day}`}>
                    <div className="day-head">
                      <h2>{DAY_LONG[day]}</h2>
                      <span className="date">{shortDate(dayDate(week, day))}</span>
                      {day === today && <span className="today">TODAY</span>}
                    </div>
                    {meal ? (
                      <MealCard plan={plan} meal={meal} cost={summary?.mealCosts[day] ?? 0} onSwap={() => setSwap({ day, mode: 'swap' })} />
                    ) : (
                      <button className="empty-day" onClick={() => setSwap({ day, mode: 'add' })}>
                        <Icon name="plus" size={18} stroke={2.6} /> Add a dinner
                      </button>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card pad" style={{ marginTop: 22, textAlign: 'center', padding: 28 }}>
            <div className="sparkle" style={{ margin: '0 auto 12px' }}>
              <Icon name="sparkle" size={20} />
            </div>
            <h2 className="title-md">{label} isn’t planned yet</h2>
            <p className="muted" style={{ margin: '8px 0 18px' }}>
              {profile.days.length} dinners around your {money(profile.weeklyBudget, profile.country, true)} budget, in seconds.
            </p>
            <button
              className="btn btn-lime btn-block"
              onClick={() => {
                planWeek(week);
                toast.show('Your week is sorted ✨');
              }}
            >
              <Icon name="sparkle" size={18} /> Plan this week
            </button>
          </div>
        )}
      </div>

      {swap && plan && <SwapSheet plan={plan} day={swap.day} mode={swap.mode} onClose={() => setSwap(null)} />}
      {toast.node}
    </>
  );
}

function MealCard({ plan, meal, cost, onSwap }: { plan: WeekPlan; meal: PlannedMeal; cost: number; onSwap: () => void }) {
  const recipe = RECIPE_BY_ID[meal.recipeId];
  const priorities = useApp((s) => s.profile.priorities);
  if (!recipe) return null;
  return (
    <div className="meal-card">
      <Link to={`/recipe/${recipe.id}?week=${plan.week}&day=${meal.day}`} className="row grow" style={{ gap: 14, alignItems: 'stretch' }}>
        <div className="thumb">
          <MealImage recipe={recipe} />
        </div>
        <div className="body">
          <Tags tags={recipeTags(recipe, priorities)} />
          <h3>{recipe.title}</h3>
          <p className="desc">{recipe.description}</p>
          <div className="foot">
            <span className="muted">
              Serves {meal.servings} · {recipe.time} min
            </span>
            <span className="price">
              {money(cost / meal.servings, plan.country)}
              <small>pp</small>
            </span>
          </div>
        </div>
      </Link>
      {meal.locked && (
        <span className="lock" title="Locked — Redo keeps this meal">
          <Icon name="lock" size={15} />
        </span>
      )}
      <button className="swap" onClick={onSwap} aria-label={`Swap ${recipe.title}`}>
        <Icon name="swap" size={16} stroke={2.2} />
      </button>
    </div>
  );
}

export function SwapSheet({ plan, day, mode, onClose }: { plan: WeekPlan; day: number; mode: 'swap' | 'add'; onClose: () => void }) {
  const profile = useApp((s) => s.profile);
  const favorites = useApp((s) => s.favorites);
  const plans = useApp((s) => s.plans);
  const setMeal = useApp((s) => s.setMeal);
  const removeMeal = useApp((s) => s.removeMeal);
  const toggleLock = useApp((s) => s.toggleLock);
  const ctx = usePlanCtx(plan);
  const [seed, setSeed] = useState(() => newSeed());
  const meal = plan.meals.find((m) => m.day === day);
  const current = meal ? RECIPE_BY_ID[meal.recipeId] : undefined;

  const options = useMemo(
    () =>
      swapOptions({
        profile: { ...profile, weeklyBudget: plan.budget, household: plan.household },
        recipes: RECIPES,
        seed,
        ctx,
        favorites,
        recent: [1, 2].map((n) => plans[addWeeks(plan.week, -n)]?.meals.map((m) => m.recipeId) ?? []),
        meals: plan.meals,
        day,
        limit: 6,
      }),
    [profile, plan, seed, ctx, favorites, plans, day],
  );
  const fmt = (n: number) => money(Math.abs(n), plan.country);

  return (
    <Sheet open onClose={onClose} label={mode === 'swap' ? 'Swap meal' : 'Add a dinner'}>
      <div className="row between">
        <div>
          <div className="eyebrow">{DAY_LONG[day]}</div>
          <h2 className="title-lg">{mode === 'swap' ? 'Swap this meal' : 'Add a dinner'}</h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
      </div>
      {current && (
        <p className="muted" style={{ marginTop: 6 }}>
          Instead of <b style={{ color: 'var(--forest)' }}>{current.title}</b>
        </p>
      )}
      <div style={{ marginTop: 16 }}>
        {options.map((o) => (
          <button
            key={o.recipe.id}
            className="meal-card"
            style={{ padding: 10 }}
            onClick={() => {
              setMeal(plan.week, day, o.recipe.id);
              onClose();
            }}
          >
            <div className="thumb" style={{ width: 76, height: 76 }}>
              <MealImage recipe={o.recipe} />
            </div>
            <div className="body">
              <Tags tags={recipeTags(o.recipe, profile.priorities)} />
              <h3 style={{ fontSize: 18, paddingRight: 0 }}>{o.recipe.title}</h3>
              <div className="foot">
                <span className="muted">
                  {o.recipe.time} min · {o.recipe.nutrition.kcal} kcal
                </span>
                <span style={{ fontWeight: 800, color: o.delta > 0.005 ? (o.fitsBudget ? 'var(--forest)' : 'var(--danger)') : '#3f7d1e' }}>
                  {Math.abs(o.delta) < 0.005 ? 'same' : `${o.delta > 0 ? '+' : '−'}${fmt(o.delta)}`}
                </span>
              </div>
            </div>
          </button>
        ))}
        {!options.length && <p className="muted">No other recipes match your preferences right now.</p>}
      </div>
      <div className="row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-white btn-sm" onClick={() => setSeed(newSeed())}>
          <Icon name="redo" size={16} /> More ideas
        </button>
        {meal && (
          <>
            <button
              className="btn btn-white btn-sm"
              onClick={() => {
                toggleLock(plan.week, day);
                onClose();
              }}
            >
              <Icon name={meal.locked ? 'unlock' : 'lock'} size={16} /> {meal.locked ? 'Unlock' : 'Keep on Redo'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                removeMeal(plan.week, day);
                onClose();
              }}
            >
              <Icon name="trash" size={16} /> Skip this night
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
