import { useMemo, useState, type ReactNode } from 'react';
import { ING, INGREDIENTS, ingName } from '../../data/ingredients';
import { RECIPES } from '../../data/recipes';
import { BUDGET, COUNTRIES, storesFor } from '../../data/stores';
import { ALLERGENS, DAY_SHORT, DIETS, PRIORITIES } from '../../data/taxonomy';
import { isEligible } from '../../engine/planner';
import { CURRENCY } from '../../engine/pricing';
import { useApp } from '../../state/store';
import { reminderIcs, reminderLabel } from '../../engine/reminder';
import type { Appliance, Profile, Reminder, Slot } from '../../types';
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
  return (
    <KitchenPicker
      value={profile.appliances}
      onToggle={(a: Appliance) => setProfile({ appliances: toggle(profile.appliances, a) })}
      country={profile.country}
    />
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
            <b style={{ fontSize: 18 }}>
              {profile.days.length * profile.meals.length} {profile.meals.length > 1 ? 'meals' : 'dinners'} a week
            </b>
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

function MealsBody() {
  const meals = useApp((s) => s.profile.meals);
  const setProfile = useApp((s) => s.setProfile);
  const options: { value: Slot[]; emoji: string; title: string; sub: string }[] = [
    { value: ['dinner'], emoji: '🍽️', title: 'Just dinner', sub: 'One proper dinner each day' },
    { value: ['lunch', 'dinner'], emoji: '🥗', title: 'Lunch & dinner', sub: 'Quick, lighter lunches plus dinner' },
  ];
  return (
    <div className="stack">
      {options.map((o) => {
        const on = o.value.length === meals.length && o.value.every((v) => meals.includes(v));
        return (
          <button key={o.title} className={`option-card ${on ? 'on' : ''}`} onClick={() => setProfile({ meals: o.value })} aria-pressed={on}>
            <span className="icon-tile soft" style={{ fontSize: 26 }}>
              {o.emoji}
            </span>
            <span className="grow">
              <b>{o.title}</b>
              <small>{o.sub}</small>
            </span>
            <span className={`radio ${on ? 'on' : ''}`} />
          </button>
        );
      })}
    </div>
  );
}

function AvoidBody() {
  return (
    <>
      <DietBody />
      <div className="eyebrow" style={{ margin: '30px 0 12px' }}>
        Foods you can’t stand
      </div>
      <DislikesBody />
    </>
  );
}

function ReminderBody() {
  const reminder = useApp((s) => s.profile.reminder);
  const setProfile = useApp((s) => s.setProfile);
  const set = (patch: Partial<Reminder>) => setProfile({ reminder: { ...reminder, ...patch } });
  const addToCalendar = () => {
    const url = window.location.href.split('#')[0];
    const ics = reminderIcs(reminder, url);
    const a = document.createElement('a');
    a.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    a.download = 'whipp-weekly-reminder.ics';
    a.click();
  };
  return (
    <>
      <div className="setting-card row between">
        <span style={{ fontWeight: 700, fontSize: 18 }}>Weekly reminder</span>
        <Toggle on={reminder.on} onChange={(on) => set({ on })} label="Weekly reminder" />
      </div>
      {reminder.on && (
        <>
          <div className="eyebrow" style={{ margin: '24px 0 12px' }}>
            Remind me on
          </div>
          <div className="day-strip" style={{ margin: 0 }}>
            <div className="days">
              {DAY_SHORT.map((d, i) => (
                <button
                  key={d}
                  className={`day-pill ${reminder.day === i ? 'on' : ''}`}
                  onClick={() => set({ day: i })}
                  aria-pressed={reminder.day === i}
                >
                  <small>{d}</small>
                  <b>{reminder.day === i ? '✓' : '–'}</b>
                </button>
              ))}
            </div>
          </div>
          <div className="setting-card row between" style={{ marginTop: 14 }}>
            <span style={{ fontWeight: 600 }}>Time</span>
            <input
              className="time-input"
              type="time"
              value={reminder.time}
              onChange={(e) => e.target.value && set({ time: e.target.value })}
              aria-label="Reminder time"
            />
          </div>
          <button className="btn btn-forest btn-block" style={{ marginTop: 18 }} onClick={addToCalendar}>
            <Icon name="calendar" size={18} /> Add to my calendar
          </button>
          <p className="faint" style={{ fontSize: 14, marginTop: 12 }}>
            Your phone’s calendar will alert you {reminderLabel(reminder).toLowerCase()} — the app also shows a nudge on the Plan tab when next week
            still needs planning.
          </p>
        </>
      )}
    </>
  );
}

/** Every editable preference section (used by Profile → edit). */
export const SECTIONS: Record<string, StepDef> = {
  store: { id: 'store', eyebrow: 'Your store', title: ['Where do you', 'shop?'], sub: 'Prices of meal plans adapt to your choice.', Body: StoreBody },
  budget: { id: 'budget', eyebrow: 'Weekly budget', title: ['Set your', 'budget'], sub: 'Slide to set your weekly grocery cap.', Body: BudgetBody },
  meals: {
    id: 'meals',
    eyebrow: 'Meals per day',
    title: ['Which meals', 'should we plan?'],
    sub: 'Your budget covers everything we plan.',
    Body: MealsBody,
  },
  priorities: {
    id: 'priorities',
    eyebrow: 'Your priorities',
    title: ['What are you', 'into?'],
    sub: 'Tap all that fit. They shape every week.',
    Body: PrioritiesBody,
  },
  kitchen: {
    id: 'kitchen',
    eyebrow: 'Your kitchen',
    title: ['What’s in your', 'kitchen?'],
    sub: 'Tap what you have, or what you’d like to cook with.',
    Body: KitchenBody,
    block: (p) => (p.appliances.length ? null : 'Pick at least one appliance'),
  },
  days: {
    id: 'days',
    eyebrow: 'Cooking days',
    title: ['Which days do', 'you cook?'],
    sub: 'We’ll plan meals for each day you pick.',
    Body: DaysBody,
    block: (p) => (p.days.length ? null : 'Pick at least one day'),
  },
  diet: {
    id: 'diet',
    eyebrow: 'Dietary needs',
    title: ['Any dietary', 'needs?'],
    sub: 'We respect these on every plan, automatically.',
    Body: DietBody,
  },
  dislikes: {
    id: 'dislikes',
    eyebrow: 'Dislikes',
    title: ['Anything you', 'can’t stand?'],
    sub: 'Tell us once — it’s gone for good.',
    Body: DislikesBody,
  },
  avoid: {
    id: 'avoid',
    eyebrow: 'Dietary needs',
    title: ['Anything to', 'avoid?'],
    sub: 'Diets, allergies and foods you can’t stand — respected every week.',
    Body: AvoidBody,
  },
  reminder: {
    id: 'reminder',
    eyebrow: 'Reminders',
    title: ['A nudge to', 'plan ahead'],
    sub: 'Get a weekly reminder to plan next week’s meals.',
    Body: ReminderBody,
  },
};

/** Onboarding order (7 steps, like Whipp). */
export const STEPS: StepDef[] = [
  SECTIONS.store,
  SECTIONS.budget,
  SECTIONS.meals,
  SECTIONS.priorities,
  SECTIONS.kitchen,
  SECTIONS.days,
  SECTIONS.avoid,
];
