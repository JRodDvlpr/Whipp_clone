import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dislikeLabels } from '../data/dislikes';
import { STORE_BY_ID } from '../data/stores';
import { ALLERGENS, APPLIANCES, DAY_SHORT, DIETS, PRIORITIES } from '../data/taxonomy';
import { money } from '../engine/pricing';
import { reminderLabel } from '../engine/reminder';
import { useApp } from '../state/store';
import { Icon, type IconName } from '../ui/Icon';
import { useToast } from '../ui/primitives';
import { PageHead } from '../ui/RecipeRow';
import { SECTIONS } from './onboarding/steps';

/** "High protein, Family favorites +1" — first two, then a count. */
function summarize(items: string[], none: string): string {
  if (!items.length) return none;
  return items.length > 2 ? `${items.slice(0, 2).join(', ')} +${items.length - 2}` : items.join(', ');
}

const labels = <T extends string>(list: { id: T; label: string }[], ids: T[]) => ids.map((id) => list.find((x) => x.id === id)?.label ?? id);

const FEEDBACK_URL = 'https://github.com/JRodDvlpr/Whipp_clone/issues/new?title=Feedback%3A%20';

/** Like Whipp, the "Help shape Whipp" card goes away once you've sent feedback (remembered per device). */
const FEEDBACK_KEY = 'whipp-feedback-sent';
const readFlag = () => {
  try {
    return localStorage.getItem(FEEDBACK_KEY) === '1';
  } catch {
    return false;
  }
};

function Row({ to, icon, label, value, onClick }: { to?: string; icon: IconName; label?: string; value: ReactNode; onClick?: () => void }) {
  const body = (
    <>
      <span className="icon-tile">
        <Icon name={icon} size={22} />
      </span>
      <span className="grow">
        {label && <span className="row-label">{label}</span>}
        <span className={label ? 'row-value' : 'row-value solo'}>{value}</span>
      </span>
      <Icon name="chevronRight" size={20} className="faint" />
    </>
  );
  if (to)
    return (
      <Link to={to} className="pref-row">
        {body}
      </Link>
    );
  return (
    <button className="pref-row" onClick={onClick}>
      {body}
    </button>
  );
}

export function Profile() {
  const s = useApp();
  const nav = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [feedbackSent, setFeedbackSent] = useState(readFlag);
  const p = s.profile;
  const appUrl = window.location.href.split('#')[0];

  const exportData = () => {
    const data = {
      app: 'whipp-clone',
      version: 2,
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
  const share = async () => {
    const text = 'Whipp plans my week of dinners around my budget and my store, with the grocery list done.';
    try {
      if (navigator.share) await navigator.share({ title: 'Whipp', text, url: appUrl });
      else {
        await navigator.clipboard.writeText(`${text} ${appUrl}`);
        toast.show('Link copied');
      }
    } catch {
      /* cancelled */
    }
  };

  const cookingDays =
    p.days.length === 7 ? 'Every day' : p.days.length === 5 && p.days.every((d) => d < 5) ? 'Weekdays' : p.days.map((d) => DAY_SHORT[d]).join(', ');
  const diet = [...labels(DIETS, p.diets), ...labels(ALLERGENS, p.allergens).map((a) => `No ${a.toLowerCase()}`)];

  return (
    <div className="screen flush-top">
      <PageHead title="Profile" />

      {!feedbackSent && (
        <div className="card feedback-card">
          <div className="row" style={{ gap: 16 }}>
            <span className="icon-tile">
              <Icon name="chat" size={22} />
            </span>
            <b style={{ fontSize: 20 }}>Help shape Whipp</b>
          </div>
          <p className="muted" style={{ margin: '14px 0 18px', fontSize: 16.5 }}>
            Let us know how to serve you best. We read every message.
          </p>
          <a
            className="btn btn-lime btn-block"
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              try {
                localStorage.setItem(FEEDBACK_KEY, '1');
              } catch {
                /* private mode: the card just stays */
              }
              // Let the new tab open before the card disappears.
              setTimeout(() => setFeedbackSent(true), 400);
            }}
          >
            Send feedback
          </a>
        </div>
      )}

      <div className="eyebrow section-title">Preferences</div>
      <div className="list-card rows">
        <Row to="/profile/edit/store" icon="store" label="Store" value={STORE_BY_ID[p.storeId]?.name ?? '—'} />
        <Row to="/profile/edit/meals" icon="plateFork" label="Meals per day" value={p.meals.length > 1 ? 'Lunch & dinner' : 'Just dinner'} />
        <Row to="/profile/edit/days" icon="calendarDay" label="Cooking days" value={cookingDays} />
        <Row
          to="/profile/edit/budget"
          icon="coinStack"
          label="Budget & household"
          value={`${money(p.weeklyBudget, p.country, true)} · ${p.household} ${p.household === 1 ? 'person' : 'people'}`}
        />
        <Row to="/profile/edit/priorities" icon="heart" label="Priorities" value={summarize(labels(PRIORITIES, p.priorities), 'Anything goes')} />
        <Row to="/profile/edit/kitchen" icon="oven" label="Kitchen equipment" value={summarize(labels(APPLIANCES, p.appliances), 'None selected')} />
        <Row to="/profile/edit/diet" icon="leaf" label="Dietary needs" value={summarize(diet, 'No restrictions')} />
        <Row to="/profile/edit/dislikes" icon="ban" label="Dislikes" value={summarize(dislikeLabels(p.dislikes, p.country), 'None')} />
      </div>
      <p className="faint" style={{ margin: '12px 4px 0', fontSize: 15 }}>
        Changes apply from your next weekly plan.
      </p>

      <div className="eyebrow section-title">Reminders</div>
      <div className="list-card rows">
        <Row to="/profile/edit/reminder" icon="bell" label="Weekly reminder" value={p.reminder.on ? reminderLabel(p.reminder) : 'Off'} />
      </div>

      <div className="eyebrow section-title">Spread the word</div>
      <div className="list-card rows">
        <Row icon="share" value="Share Whipp" onClick={share} />
      </div>

      <div className="eyebrow section-title">Support & legal</div>
      <div className="list-card rows">
        <Row to="/info/help" icon="help" value="Get help" />
        <Row to="/info/privacy" icon="shield" value="Privacy policy" />
        <Row to="/info/terms" icon="file" value="Terms of use" />
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
      <div className="list-card rows">
        <Row icon="download" value="Back up my data" onClick={exportData} />
        <Row icon="upload" value="Restore from backup" onClick={() => fileRef.current?.click()} />
        <Row
          icon="trash"
          value={<span style={{ color: 'var(--danger)' }}>Reset all data</span>}
          onClick={() => {
            if (window.confirm('Reset everything? This deletes your plans, favorites and settings on this device.')) {
              s.reset();
              try {
                localStorage.removeItem(FEEDBACK_KEY);
              } catch {
                /* nothing stored */
              }
              nav('/welcome', { replace: true });
            }
          }}
        />
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />

      <p className="faint" style={{ textAlign: 'center', fontSize: 13, margin: '24px 0 0' }}>
        Support ID · {s.supportId}
        <br />
        <Link to="/info/credits" style={{ textDecoration: 'underline' }}>
          Dish photos from TheMealDB & Wikimedia Commons
        </Link>
      </p>
      {toast.node}
    </div>
  );
}

/** Edit one preference section, reusing the onboarding step UI. */
export function ProfileEdit() {
  const { section = '' } = useParams();
  const nav = useNavigate();
  const profile = useApp((s) => s.profile);
  const def = SECTIONS[section];
  if (!def) return null;
  const blocked = def.block?.(profile) ?? null;
  return (
    <div className="screen">
      <header className="edit-head">
        <div className="inner">
          <button className="icon-btn sq" onClick={() => nav(-1)} aria-label="Back" disabled={!!blocked}>
            <Icon name="back" size={22} stroke={2.4} />
          </button>
          <h1>{def.editTitle ?? def.eyebrow}</h1>
        </div>
      </header>
      <div className={`edit-body ${section === 'kitchen' ? 'centered' : ''}`}>
        <def.Body editing />
      </div>
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
