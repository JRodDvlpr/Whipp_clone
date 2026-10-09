import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { photoThumb } from '../data/photos';
import { TAG_LABELS, TAG_STYLE } from '../data/taxonomy';
import type { ExtraTag, Priority, Recipe } from '../types';
import { Icon, type IconName } from './Icon';

export function Ring({
  pct,
  size = 92,
  stroke = 9,
  label,
  sub,
  track = 'rgba(255,255,255,0.14)',
  color = 'var(--lime)',
}: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sub?: ReactNode;
  track?: string;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(Math.max(0, Math.min(1, pct))));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={pct > 1 ? '#ffb48a' : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
        />
      </svg>
      <div className="lbl">
        <b>{label}</b>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

export function Chip({ on, emoji, label, onClick, small }: { on: boolean; emoji?: string; label: string; onClick: () => void; small?: boolean }) {
  return (
    <button type="button" className={`chip ${on ? 'on' : ''} ${small ? 'sm' : ''}`} onClick={onClick} aria-pressed={on}>
      {emoji && <span className="em">{emoji}</span>}
      {label}
      <span className="state">
        <Icon name={on ? 'close' : 'plus'} size={13} stroke={3} />
      </span>
    </button>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} />
  );
}

export function Stepper({
  value,
  min = 1,
  max = 12,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="stepper" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label}`}>
        <Icon name="minus" size={18} stroke={2.6} />
      </button>
      <span className="val" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>
        <Icon name="plus" size={18} stroke={2.6} />
      </button>
    </div>
  );
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Photo when we have one, otherwise a warm illustrated plate. */
export function MealImage({ recipe, size = 'thumb' }: { recipe: Recipe; size?: 'thumb' | 'full' }) {
  const [failed, setFailed] = useState(false);
  if (recipe.image && !failed) {
    return (
      <img
        className="photo"
        src={size === 'thumb' ? photoThumb(recipe.image) : recipe.image}
        alt={recipe.title}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  const hue = recipe.art?.hue ?? 90;
  return (
    <div
      className="meal-art"
      style={{ background: `linear-gradient(140deg, hsl(${hue} 70% 86%), hsl(${(hue + 25) % 360} 62% 74%))` }}
      role="img"
      aria-label={recipe.title}
    >
      <div className="plate" />
      <span className="em" style={size === 'full' ? { fontSize: 110 } : undefined}>
        {recipe.art?.emoji ?? '🍽️'}
      </span>
    </div>
  );
}

const TAG_ORDER: Priority[] = [
  'quick',
  'high_protein',
  'healthy',
  'comfort',
  'family',
  'low_carb',
  'gut_friendly',
  'batch_cook',
  'plant_forward',
  'anti_inflammatory',
  'balance',
];

/** Up to `max` chips: diet badge first, then the user's priorities, then the rest. */
export function recipeTags(recipe: Recipe, priorities: Priority[] = [], max = 2): (Priority | ExtraTag)[] {
  const out: (Priority | ExtraTag)[] = [];
  if (recipe.diets.includes('vegan')) out.push('vegan');
  else if (recipe.diets.includes('vegetarian')) out.push('veggie');
  // A diet badge already says "plant-forward".
  const prs = recipe.tags.filter((t) => !(t === 'plant_forward' && out.length));
  // Earlier in `priorities` wins (a filtered collection is passed first), then the usual order.
  const mine = (t: Priority) => (priorities.includes(t) ? priorities.indexOf(t) : priorities.length);
  prs.sort((a, b) => mine(a) - mine(b) || TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b));
  for (const t of [...prs, ...(recipe.extra ?? [])]) if (!out.includes(t)) out.push(t);
  return out.slice(0, max);
}

/** Chips that fit on one line of a meal card (~26 characters); the first always shows. */
const fitLine = (tags: (Priority | ExtraTag)[]) => {
  let used = 0;
  return tags.filter((t, i) => (used += TAG_LABELS[t].length + 3) <= 29 || i === 0);
};

export function Tags({ tags }: { tags: (Priority | ExtraTag)[] }) {
  return (
    <div className="tags">
      {fitLine(tags).map((t) => (
        <span key={t} className={`tag ${TAG_STYLE[t] ?? ''}`}>
          {TAG_LABELS[t]}
        </span>
      ))}
    </div>
  );
}

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/plan', label: 'Plan', icon: 'utensils' },
  { to: '/discover', label: 'Discover', icon: 'book' },
  { to: '/favorites', label: 'Favorites', icon: 'heart' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon
            name={t.icon}
            size={22}
            fill={t.icon === 'heart' || t.icon === 'user' || t.icon === 'book'}
            stroke={t.icon === 'utensils' ? 2.2 : 1.6}
          />
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function TopNav() {
  return (
    <nav className="top-nav" aria-label="Main">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

let toastTimer: number | undefined;
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => setMsg(null), 2200);
  };
  const node = msg
    ? createPortal(
        <div className="toast" role="status">
          {msg}
        </div>,
        document.body,
      )
    : null;
  return { show, node };
}
