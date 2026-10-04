import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORE_BY_ID } from '../data/stores';
import { money } from '../engine/pricing';
import { useApp, currentWeek } from '../state/store';
import { Icon } from '../ui/Icon';

const FLOATERS: [string, string, string, string][] = [
  ['🥑', '8%', '58%', '0s'],
  ['🥦', '78%', '52%', '0.6s'],
  ['🫑', '18%', '74%', '1.2s'],
  ['🍅', '70%', '70%', '0.3s'],
  ['🥕', '44%', '62%', '0.9s'],
];

export function Welcome() {
  const nav = useNavigate();
  return (
    <div className="welcome">
      <div className="logo">Whipp</div>
      <h1 className="title-xl" style={{ marginTop: 40, fontSize: 40 }}>
        Your meals{' '}
        <span className="italic" style={{ color: 'var(--lime)' }}>
          sorted.
        </span>
      </h1>
      <p style={{ marginTop: 14, fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 380 }}>
        Save money, gain time and eat healthier effortlessly. A full week of dinners in about a minute.
      </p>
      {FLOATERS.map(([e, left, top, delay]) => (
        <span key={e} className="float-em" style={{ left, top, animationDelay: delay }} aria-hidden="true">
          {e}
        </span>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <button className="btn btn-lime btn-block" onClick={() => nav('/onboarding/1')}>
          Get started <Icon name="chevronRight" size={20} stroke={2.6} />
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          No sign-up · Everything stays on your phone
        </p>
      </div>
    </div>
  );
}

/** "Whipping up your week…" — runs the planner behind a short, friendly animation. */
export function Planning() {
  const nav = useNavigate();
  const profile = useApp((s) => s.profile);
  const planWeek = useApp((s) => s.planWeek);
  const complete = useApp((s) => s.completeOnboarding);
  const [done, setDone] = useState(0);
  const store = STORE_BY_ID[profile.storeId]?.name ?? 'your store';
  const steps = [
    `Checking prices at ${store}`,
    'Matching your taste & kitchen',
    `Balancing your ${money(profile.weeklyBudget, profile.country, true)} budget`,
    `Picking ${profile.days.length} dinners`,
  ];

  useEffect(() => {
    const timers = steps.map((_, i) => window.setTimeout(() => setDone(i + 1), 450 * (i + 1)));
    const finish = window.setTimeout(
      () => {
        planWeek(currentWeek());
        complete();
        nav('/plan', { replace: true });
      },
      450 * steps.length + 350,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loader">
      <div className="bowl" aria-hidden="true">
        🥣
      </div>
      <h1 className="title-lg">
        Whipping up <span className="italic">your week…</span>
      </h1>
      <div className="loader-steps" role="status">
        {steps.map((s, i) => (
          <div key={s} className={i < done ? 'done' : ''}>
            <span className="tick">{i < done && <Icon name="check" size={13} stroke={3} />}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
