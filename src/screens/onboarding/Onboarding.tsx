import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../state/store';
import { Icon } from '../../ui/Icon';
import { STEPS } from './steps';

export function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: [string, string]; sub: string }) {
  return (
    <>
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="ob-title">
        {title[0]} <span className="italic">{title[1]}</span>
      </h1>
      <p className="ob-sub">{sub}</p>
    </>
  );
}

export function Onboarding() {
  const { step = '1' } = useParams();
  const nav = useNavigate();
  const profile = useApp((s) => s.profile);
  const idx = Math.max(0, Math.min(STEPS.length - 1, Number(step) - 1));
  const def = STEPS[idx];
  const blocked = def.block?.(profile) ?? null;

  const next = () => {
    if (idx === STEPS.length - 1) nav('/planning');
    else nav(`/onboarding/${idx + 2}`);
  };

  return (
    <div className="screen" key={def.id}>
      <div className="ob-top">
        <button className="icon-btn sq" onClick={() => (idx === 0 ? nav('/welcome') : nav(-1))} aria-label="Back">
          <Icon name="back" size={22} stroke={2.4} />
        </button>
        <div className="ob-progress" aria-hidden="true">
          {STEPS.map((s, i) => (
            <span key={s.id} className={i < idx ? 'done' : i === idx ? 'now' : ''} />
          ))}
        </div>
        <span className="ob-count">
          {idx + 1}/{STEPS.length}
        </span>
      </div>
      <StepHeader eyebrow={def.eyebrow} title={def.title} sub={def.sub} />
      <def.Body />
      <div className="bottom-bar">
        <div className="inner">
          <button className="btn btn-lime btn-block" onClick={next} disabled={!!blocked}>
            {blocked ?? 'Continue'} {!blocked && <Icon name="chevronRight" size={20} stroke={2.6} />}
          </button>
        </div>
      </div>
    </div>
  );
}
