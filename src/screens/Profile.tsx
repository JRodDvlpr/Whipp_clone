import { useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ingName } from '../data/ingredients';
import { STORE_BY_ID, COUNTRIES } from '../data/stores';
import { ALLERGENS, APPLIANCES, DAY_SHORT, DIETS, PRIORITIES } from '../data/taxonomy';
import { money } from '../engine/pricing';
import { useApp } from '../state/store';
import { Icon, type IconName } from '../ui/Icon';
import { useToast } from '../ui/primitives';
import { StepHeader } from './onboarding/Onboarding';
import { STEPS } from './onboarding/steps';

const label = <T extends string>(list: { id: T; label: string }[], ids: T[]) =>
  ids.map((id) => list.find((x) => x.id === id)?.label ?? id).join(', ');

export function Profile() {
  const s = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const p = s.profile;
  const store = STORE_BY_ID[p.storeId];
  const country = COUNTRIES.find((c) => c.id === p.country);

  const rows: { section: string; icon: IconName; title: string; value: string }[] = [
    { section: 'store', icon: 'store', title: 'Supermarket', value: `${store?.name ?? '—'} · ${country?.flag} ${country?.label}` },
    {
      section: 'budget',
      icon: 'wallet',
      title: 'Weekly budget',
      value: `${money(p.weeklyBudget, p.country, true)} · ${p.household} ${p.household === 1 ? 'person' : 'people'}${p.kidFriendly ? ' · kid-friendly' : ''}`,
    },
    {
      section: 'diet',
      icon: 'leaf',
      title: 'Diet & allergies',
      value: [label(DIETS, p.diets), label(ALLERGENS, p.allergens)].filter(Boolean).join(' · ') || 'No restrictions',
    },
    { section: 'priorities', icon: 'sparkle', title: 'Priorities', value: label(PRIORITIES, p.priorities) || 'Anything goes' },
    { section: 'kitchen', icon: 'chef', title: 'Kitchen', value: label(APPLIANCES, p.appliances) || 'None selected' },
    { section: 'dislikes', icon: 'ban', title: 'Foods you can’t stand', value: p.dislikes.map((d) => ingName(d, p.country)).join(', ') || 'None' },
    {
      section: 'days',
      icon: 'calendar',
      title: 'Dinner nights',
      value: p.days.length === 7 ? 'Every night' : p.days.map((d) => DAY_SHORT[d]).join(', '),
    },
  ];

  const exportData = () => {
    const data = {
      app: 'whipp-clone',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: s.profile,
      plans: s.plans,
      favorites: s.favorites,
      overrides: s.overrides,
      onboarded: s.onboarded,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `whipp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'whipp-clone' || !data.profile) throw new Error('bad file');
      s.importData({
        profile: data.profile,
        plans: data.plans ?? {},
        favorites: data.favorites ?? [],
        overrides: data.overrides ?? {},
        onboarded: true,
      });
      toast.show('Backup restored ✓');
    } catch {
      toast.show('That doesn’t look like a Whipp backup');
    }
  };

  return (
    <div className="screen">
      <div className="row" style={{ gap: 14, marginTop: 8 }}>
        <div className="icon-tile" style={{ borderRadius: 999, width: 60, height: 60 }}>
          <Icon name="user" size={28} />
        </div>
        <div>
          <h1 className="title-lg">Your profile</h1>
          <p className="faint">New plans use these settings automatically.</p>
        </div>
      </div>

      <div className="eyebrow section-title">Preferences</div>
      <div className="list-card">
        {rows.map((r) => (
          <Link key={r.section} to={`/profile/edit/${r.section}`} className="pref-row">
            <span className="icon-tile sm soft">
              <Icon name={r.icon} size={17} />
            </span>
            <span className="grow">
              <b>{r.title}</b>
              <small>{r.value}</small>
            </span>
            <Icon name="chevronRight" size={18} />
          </Link>
        ))}
      </div>

      <div className="eyebrow section-title">Units</div>
      <div className="segmented three">
        {(['auto', 'imperial', 'metric'] as const).map((u) => (
          <button key={u} className={p.units === u ? 'on' : ''} onClick={() => s.setProfile({ units: u })}>
            {u === 'auto' ? 'Auto' : u === 'imperial' ? 'oz / lb' : 'g / kg'}
          </button>
        ))}
      </div>

      <div className="eyebrow section-title">Your data</div>
      <div className="list-card">
        <button className="pref-row" onClick={exportData}>
          <span className="icon-tile sm soft">
            <Icon name="download" size={17} />
          </span>
          <span className="grow">
            <b>Back up my data</b>
            <small>Save plans, favorites & settings to a file</small>
          </span>
        </button>
        <button className="pref-row" onClick={() => fileRef.current?.click()}>
          <span className="icon-tile sm soft">
            <Icon name="upload" size={17} />
          </span>
          <span className="grow">
            <b>Restore from backup</b>
            <small>Load a backup file</small>
          </span>
        </button>
        <button
          className="pref-row"
          onClick={() => {
            if (window.confirm('Reset everything? This deletes your plans, favorites and settings on this device.')) {
              s.reset();
              nav('/welcome', { replace: true });
            }
          }}
        >
          <span className="icon-tile sm" style={{ background: '#fde2d6' }}>
            <Icon name="trash" size={17} />
          </span>
          <span className="grow">
            <b style={{ color: 'var(--danger)' }}>Reset all data</b>
            <small>Start over with onboarding</small>
          </span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />

      <div className="eyebrow section-title">About</div>
      <div className="card pad" style={{ fontSize: 14.5 }}>
        <p className="muted">
          Your plans, preferences and recipes stay on this device — there’s no account and nothing is uploaded. Grocery totals are a close estimate,
          not an exact receipt; tap any price on your list to use your store’s real price. Nutrition is a helpful guide, not medical advice.
        </p>
        <p className="faint" style={{ marginTop: 10, fontSize: 13 }}>
          Support ID · {s.supportId}
        </p>
        <p className="faint" style={{ fontSize: 13 }}>
          Dish photos from TheMealDB.
        </p>
      </div>
      {toast.node}
    </div>
  );
}

/** Edit one preference section, reusing the onboarding step UI. */
export function ProfileEdit() {
  const { section = '' } = useParams();
  const nav = useNavigate();
  const profile = useApp((s) => s.profile);
  const def = STEPS.find((x) => x.id === section);
  if (!def) return null;
  const blocked = def.block?.(profile) ?? null;
  return (
    <div className="screen">
      <div className="ob-top">
        <button className="icon-btn sq" onClick={() => nav(-1)} aria-label="Back" disabled={!!blocked}>
          <Icon name="back" size={22} stroke={2.4} />
        </button>
      </div>
      <StepHeader eyebrow={def.eyebrow} title={def.title} sub={def.sub} />
      <def.Body />
      <div className="bottom-bar">
        <div className="inner">
          <button className="btn btn-lime btn-block" onClick={() => nav(-1)} disabled={!!blocked}>
            {blocked ?? 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
