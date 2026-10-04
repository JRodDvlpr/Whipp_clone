import { useMemo, useState, type ReactNode } from 'react';
import { ING, INGREDIENTS, ingName } from '../../data/ingredients';
import { RECIPES } from '../../data/recipes';
import { BUDGET, COUNTRIES, storesFor } from '../../data/stores';
import { ALLERGENS, APPLIANCES, DAY_SHORT, DIETS, PRIORITIES } from '../../data/taxonomy';
import { isEligible } from '../../engine/planner';
import { CURRENCY } from '../../engine/pricing';
import { useApp } from '../../state/store';
import type { Appliance, Profile } from '../../types';
import { Icon } from '../../ui/Icon';
import { Chip, Stepper, Toggle } from '../../ui/primitives';
import { KitchenPicker } from './Kitchen';

export interface StepDef {
  id: string;
  eyebrow: string;
  title: [string, string];
  sub: string;
  Body: () => ReactNode;
  /** Return a reason the user can't continue yet, or null. */
  block?: (p: Profile) => string | null;
}

const toggle = <T,>(xs: T[], x: T) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

function StoreBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const setCountry = useApp((s) => s.setCountry);
  return (
    <>
      <div className="hscroll" style={{ marginBottom: 16 }}>
        {COUNTRIES.map((c) => (
          <button key={c.id} className={`pill-filter ${profile.country === c.id ? 'on' : ''}`} onClick={() => setCountry(c.id)}>
            <span>{c.flag}</span> {c.label}
          </button>
        ))}
      </div>
      <div className="store-grid">
        {storesFor(profile.country).map((s) => (
          <button
            key={s.id}
            className={`store-tile ${profile.storeId === s.id ? 'on' : ''}`}
            style={{ color: s.color }}
            onClick={() => setProfile({ storeId: s.id })}
            aria-pressed={profile.storeId === s.id}
          >
            {s.name}
            {profile.storeId === s.id && (
              <span className="check">
                <Icon name="check" size={13} stroke={3.2} />
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function BudgetBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const b = BUDGET[profile.country];
  const fill = ((profile.weeklyBudget - b.min) / (b.max - b.min)) * 100;
  return (
    <>
      <div className="budget-big">
        <div className="glow" />
        <div className="num">
          <sup>{CURRENCY[profile.country].symbol}</sup>
          {profile.weeklyBudget}
        </div>
        <div className="per">per week</div>
      </div>
      <input
        className="range"
        type="range"
        min={b.min}
        max={b.max}
        step={b.step}
        value={profile.weeklyBudget}
        style={{ ['--fill' as string]: `${fill}%` }}
        onChange={(e) => setProfile({ weeklyBudget: Number(e.target.value) })}
        aria-label="Weekly grocery budget"
      />
      <div className="range-labels">
        <span>
          {CURRENCY[profile.country].symbol}
          {b.min}
        </span>
        <span>
          {CURRENCY[profile.country].symbol}
          {b.max}
        </span>
      </div>
      <div className="setting-card" style={{ marginTop: 28 }}>
        <div className="row">
          <div className="icon-tile">
            <Icon name="users" size={24} />
          </div>
          <div className="grow">
            <b style={{ fontSize: 18 }}>Cooking for</b>
            <div className="faint">
              {profile.household} {profile.household === 1 ? 'person' : 'people'}
            </div>
          </div>
          <Stepper value={profile.household} min={1} max={8} onChange={(household) => setProfile({ household })} label="people" />
        </div>
        <div className="row between" style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14 }}>
          <span style={{ fontWeight: 600 }}>Show kid-friendly dinners</span>
          <Toggle on={profile.kidFriendly} onChange={(kidFriendly) => setProfile({ kidFriendly })} label="Show kid-friendly dinners" />
        </div>
      </div>
    </>
  );
}

function DietBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  return (
    <>
      <div className="chips">
        {DIETS.map((d) => (
          <Chip
            key={d.id}
            on={profile.diets.includes(d.id)}
            emoji={d.emoji}
            label={d.label}
            onClick={() => setProfile({ diets: toggle(profile.diets, d.id) })}
          />
        ))}
      </div>
      <div className="eyebrow" style={{ margin: '30px 0 12px' }}>
        Allergies
      </div>
      <div className="chips">
        {ALLERGENS.map((a) => (
          <Chip
            key={a.id}
            small
            on={profile.allergens.includes(a.id)}
            emoji={a.emoji}
            label={a.label}
            onClick={() => setProfile({ allergens: toggle(profile.allergens, a.id) })}
          />
        ))}
      </div>
      <p className="faint" style={{ marginTop: 18, fontSize: 14 }}>
        Always check labels — packaged ingredients can vary by brand.
      </p>
    </>
  );
}

function PrioritiesBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const uk = profile.country === 'UK' || profile.country === 'AU';
  return (
    <div className="chips">
      {PRIORITIES.map((p) => (
        <Chip
          key={p.id}
          on={profile.priorities.includes(p.id)}
          emoji={p.emoji}
          label={uk && p.labelUK ? p.labelUK : p.label}
          onClick={() => setProfile({ priorities: toggle(profile.priorities, p.id) })}
        />
      ))}
    </div>
  );
}

function KitchenBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const onToggle = (a: Appliance) => setProfile({ appliances: toggle(profile.appliances, a) });
  return (
    <>
      <KitchenPicker value={profile.appliances} onToggle={onToggle} country={profile.country} />
      <div className="kitchen-legend">
        {APPLIANCES.map((a) => (
          <Chip
            key={a.id}
            small
            on={profile.appliances.includes(a.id)}
            label={profile.country === 'UK' && a.labelUK ? a.labelUK : a.label}
            onClick={() => onToggle(a.id)}
          />
        ))}
      </div>
    </>
  );
}

const COMMON_DISLIKES = [
  'cilantro',
  'mushrooms',
  'olives',
  'eggplant',
  'shrimp',
  'red_onion',
  'chili',
  'feta',
  'tofu',
  'avocado',
  'fennel',
  'celery',
];

function DislikesBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return INGREDIENTS.filter((i) => !i.pantry && (i.name.toLowerCase().includes(s) || i.nameUK?.toLowerCase().includes(s))).slice(0, 8);
  }, [q]);
  const shown = [...new Set([...profile.dislikes, ...COMMON_DISLIKES])];
  const name = (id: string) => ingName(id, profile.country);
  return (
    <>
      <label className="search">
        <Icon name="search" size={19} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ingredients" aria-label="Search ingredients" />
      </label>
      {results.length > 0 && (
        <div className="chips" style={{ marginTop: 12 }}>
          {results.map((i) => (
            <Chip
              key={i.id}
              small
              on={profile.dislikes.includes(i.id)}
              emoji={i.emoji}
              label={name(i.id)}
              onClick={() => setProfile({ dislikes: toggle(profile.dislikes, i.id) })}
            />
          ))}
        </div>
      )}
      <div className="eyebrow" style={{ margin: '24px 0 12px' }}>
        Common ones
      </div>
      <div className="chips">
        {shown.map((id) => (
          <Chip
            key={id}
            small
            on={profile.dislikes.includes(id)}
            emoji={ING[id]?.emoji}
            label={name(id)}
            onClick={() => setProfile({ dislikes: toggle(profile.dislikes, id) })}
          />
        ))}
      </div>
    </>
  );
}

function DaysBody() {
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const matches = RECIPES.filter((r) => isEligible(r, profile)).length;
  return (
    <>
      <div className="day-strip" style={{ marginTop: 0 }}>
        <div className="days">
          {DAY_SHORT.map((d, i) => (
            <button
              key={d}
              className={`day-pill ${profile.days.includes(i) ? 'on' : ''}`}
              onClick={() => setProfile({ days: toggle(profile.days, i).sort((a, b) => a - b) })}
              aria-pressed={profile.days.includes(i)}
            >
              <small>{d}</small>
              <b>{profile.days.includes(i) ? '✓' : '–'}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="setting-card" style={{ marginTop: 22 }}>
        <div className="row">
          <div className="icon-tile soft">🍽️</div>
          <div className="grow">
            <b style={{ fontSize: 18 }}>{profile.days.length} dinners a week</b>
            <div className="faint">{matches} recipes match your preferences</div>
          </div>
        </div>
      </div>
      {matches < profile.days.length && (
        <div className="notice">
          <Icon name="alert" size={18} />
          Only {matches} recipes match everything you've chosen, so a few nights may stay open. You can loosen a filter any time in Profile.
        </div>
      )}
    </>
  );
}

export const STEPS: StepDef[] = [
  { id: 'store', eyebrow: 'Your store', title: ['Where do you', 'shop?'], sub: 'Prices of meal plans adapt to your choice.', Body: StoreBody },
  { id: 'budget', eyebrow: 'Weekly budget', title: ['Set your', 'budget'], sub: 'Slide to set your weekly grocery cap.', Body: BudgetBody },
  { id: 'diet', eyebrow: 'Your diet', title: ['Any dietary', 'needs?'], sub: 'We respect these on every plan, automatically.', Body: DietBody },
  {
    id: 'priorities',
    eyebrow: 'Your priorities',
    title: ['What are you', 'into?'],
    sub: 'Tap all that fit. They shape every week.',
    Body: PrioritiesBody,
  },
  {
    id: 'kitchen',
    eyebrow: 'Your kitchen',
    title: ['What’s in your', 'kitchen?'],
    sub: 'Tap what you have, or what you’d like to cook with.',
    Body: KitchenBody,
    block: (p) => (p.appliances.length ? null : 'Pick at least one appliance'),
  },
  {
    id: 'dislikes',
    eyebrow: 'Your no-go list',
    title: ['Anything you', 'can’t stand?'],
    sub: 'Tell us once — it’s gone for good.',
    Body: DislikesBody,
  },
  {
    id: 'days',
    eyebrow: 'Your week',
    title: ['Which nights', 'need dinner?'],
    sub: 'We’ll plan a dinner for each night you pick.',
    Body: DaysBody,
    block: (p) => (p.days.length ? null : 'Pick at least one night'),
  },
];
