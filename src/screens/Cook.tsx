import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ING, ingName } from '../data/ingredients';
import { RECIPE_BY_ID } from '../data/recipes';
import { formatLineQty } from '../engine/units';
import { useWakeLock } from '../state/hooks';
import { useApp } from '../state/store';
import { Icon } from '../ui/Icon';

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.25, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.3);
    });
  } catch {
    /* audio unavailable */
  }
  navigator.vibrate?.([200, 120, 200]);
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function Cook() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const recipe = RECIPE_BY_ID[id];
  const country = useApp((s) => s.profile.country);
  const units = useApp((s) => s.profile.units);
  const [i, setI] = useState(0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const touch = useRef<number | null>(null);
  useWakeLock(true);

  const servings = Number(params.get('servings')) || recipe?.serves || 2;
  const scale = recipe ? servings / recipe.serves : 1;
  const step = recipe?.steps[i];

  // Ingredients mentioned in this step, with quantities.
  const mentioned = useMemo(() => {
    if (!recipe || !step) return [];
    const text = step.text.toLowerCase();
    return recipe.ingredients.filter((l) => {
      const names = [ING[l[0]].name, ING[l[0]].nameUK].filter(Boolean).map((n) => n!.toLowerCase());
      return names.some((n) => text.includes(n) || n.split(' ').some((w) => w.length > 4 && text.includes(w)));
    });
  }, [recipe, step]);

  useEffect(() => {
    if (!endAt) return;
    const t = window.setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endAt) {
        window.clearInterval(t);
        setEndAt(null);
        beep();
      }
    }, 250);
    return () => window.clearInterval(t);
  }, [endAt]);

  if (!recipe || !step) return null;
  const last = i === recipe.steps.length - 1;
  const go = (d: number) => setI((x) => Math.max(0, Math.min(recipe.steps.length - 1, x + d)));

  return (
    <div
      className="cook"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="row" style={{ gap: 14 }}>
        <button
          className="icon-btn"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', boxShadow: 'none' }}
          onClick={() => nav(-1)}
          aria-label="Exit cook mode"
        >
          <Icon name="close" size={20} />
        </button>
        <div className="segs" aria-hidden="true">
          {recipe.steps.map((_, k) => (
            <span key={k} className={k <= i ? 'done' : ''} />
          ))}
        </div>
      </div>
      <div className="body">
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {recipe.title} · Step {i + 1} of {recipe.steps.length}
        </div>
        <p className="text" key={i} style={{ marginTop: 14 }} aria-live="polite">
          {step.text}
        </p>
        {mentioned.length > 0 && (
          <div className="ings">
            {mentioned.map((l) => (
              <span key={l[0]}>
                {ING[l[0]].emoji} {formatLineQty(l, scale, country, units)} {ingName(l[0], country).toLowerCase()}
              </span>
            ))}
          </div>
        )}
        {step.timer && (
          <button
            className={`timer ${endAt ? 'running' : ''}`}
            onClick={() => {
              if (endAt) setEndAt(null);
              else {
                setNow(Date.now());
                setEndAt(Date.now() + step.timer! * 60_000);
              }
            }}
          >
            <Icon name={endAt ? 'pause' : 'clock'} size={20} fill={!!endAt} />
            {endAt ? `${mmss(Math.max(0, (endAt - now) / 1000))} · tap to stop` : `Start ${step.timer} min timer`}
          </button>
        )}
      </div>
      <div className="nav">
        <button
          className="btn"
          style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
          onClick={() => go(-1)}
          disabled={i === 0}
          aria-label="Previous step"
        >
          <Icon name="chevronLeft" size={22} />
        </button>
        {last ? (
          <button className="btn btn-lime grow" onClick={() => nav(-1)}>
            Done — enjoy! 🎉
          </button>
        ) : (
          <button className="btn btn-lime grow" onClick={() => go(1)}>
            Next step <Icon name="chevronRight" size={20} stroke={2.6} />
          </button>
        )}
      </div>
    </div>
  );
}
