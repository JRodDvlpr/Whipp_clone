import { Link, useNavigate } from 'react-router-dom';
import { RECIPE_BY_ID } from '../data/recipes';
import { STORE_BY_ID } from '../data/stores';
import { addWeeks, weekLabel, weekRange } from '../engine/dates';
import { currentWeek, useApp } from '../state/store';
import { Icon } from '../ui/Icon';
import { MealImage } from '../ui/primitives';
import type { WeekPlan } from '../types';

export function Plans() {
  const nav = useNavigate();
  const plans = useApp((s) => s.plans);
  const planWeek = useApp((s) => s.planWeek);
  const cur = currentWeek();
  // Whipp lists the next two weeks; this week lives on the Plan tab.
  const upcoming = [1, 2].map((n) => addWeeks(cur, n));
  const previous = Object.keys(plans)
    .filter((w) => w <= cur)
    .sort()
    .reverse();

  return (
    <div className="screen flush-top">
      <header className="page-head">
        <div className="inner row" style={{ gap: 14 }}>
          <button className="icon-btn sq" onClick={() => nav(-1)} aria-label="Back">
            <Icon name="back" size={22} stroke={2.4} />
          </button>
          <div>
            <div className="eyebrow">Your plans</div>
            <h1 className="page-title" style={{ fontSize: 32 }}>
              My weekly plans
            </h1>
          </div>
        </div>
      </header>

      <div className="eyebrow section-title">Upcoming</div>
      {upcoming.map((w) =>
        plans[w] ? (
          <WeekCard key={w} plan={plans[w]} />
        ) : (
          <div key={w} className="week-card dashed">
            <div className="row" style={{ gap: 14 }}>
              <span className="sparkle">
                <Icon name="sparkle" size={18} />
              </span>
              <div className="grow">
                <div className="week-name">{weekLabel(w)}</div>
                <div className="faint" style={{ fontSize: 14 }}>
                  {weekRange(w)} · Not planned yet
                </div>
              </div>
              <button
                className="btn btn-lime btn-xs"
                onClick={() => {
                  planWeek(w);
                  nav(`/plan?week=${w}`);
                }}
              >
                Plan
              </button>
            </div>
          </div>
        ),
      )}

      {previous.length > 0 && (
        <>
          <div className="eyebrow section-title">Previous</div>
          {previous.map((w) => (
            <WeekCard key={w} plan={plans[w]} />
          ))}
        </>
      )}
    </div>
  );
}

function WeekCard({ plan }: { plan: WeekPlan }) {
  const recipes = plan.meals.map((m) => RECIPE_BY_ID[m.recipeId]).filter(Boolean);
  const label = weekLabel(plan.week);
  return (
    <Link to={`/plan?week=${plan.week}`} className="week-card">
      <div className="row between">
        <div>
          <div className="week-name">{weekRange(plan.week)}</div>
          <div className="faint" style={{ fontSize: 14 }}>
            {label !== weekRange(plan.week) ? `${label} · ` : ''}
            {STORE_BY_ID[plan.storeId]?.name}
          </div>
        </div>
        <Icon name="chevronRight" size={20} className="faint" />
      </div>
      <div className="thumbs">
        {recipes.slice(0, 4).map((r) => (
          <div key={r.id}>
            <MealImage recipe={r} />
          </div>
        ))}
        {recipes.length > 4 && <div className="more">+{recipes.length - 4}</div>}
      </div>
    </Link>
  );
}
