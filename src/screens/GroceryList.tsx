import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ING, ingName } from '../data/ingredients';
import { RECIPE_BY_ID } from '../data/recipes';
import { STORE_BY_ID, storeSearchUrl } from '../data/stores';
import { weekRange } from '../engine/dates';
import { buildList, listToText, type ListItem } from '../engine/groceryList';
import { fromDisplayPrice, money, priceUnitLabel, toDisplayPrice, unitPrice } from '../engine/pricing';
import { isMetric } from '../engine/units';
import { useIsWide, usePlanCtx } from '../state/hooks';
import { useApp } from '../state/store';
import { Icon } from '../ui/Icon';
import { Ring, Sheet, useToast } from '../ui/primitives';

export function GroceryList() {
  const { week = '' } = useParams();
  const nav = useNavigate();
  const plan = useApp((s) => s.plans[week]);
  const units = useApp((s) => s.profile.units);
  const toggleCheck = useApp((s) => s.toggleCheck);
  const addCustom = useApp((s) => s.addCustom);
  const removeCustom = useApp((s) => s.removeCustom);
  const ctx = usePlanCtx(plan);
  const wide = useIsWide();
  const toast = useToast();
  const [text, setText] = useState('');
  const [priceFor, setPriceFor] = useState<ListItem | null>(null);
  const [showPantry, setShowPantry] = useState(false);

  const list = useMemo(() => (plan ? buildList(plan, RECIPE_BY_ID, ctx, units) : null), [plan, ctx, units]);
  if (!plan || !list) {
    return (
      <div className="screen">
        <p>No plan for this week yet.</p>
        <Link to="/plan" className="btn btn-lime" style={{ marginTop: 16 }}>
          Back to plan
        </Link>
      </div>
    );
  }

  const store = STORE_BY_ID[plan.storeId];
  const fmt = (n: number) => money(n, plan.country);
  const title = plan.country === 'UK' ? 'Shopping list' : 'Grocery list';
  const pct = plan.budget ? list.total / plan.budget : 0;

  const share = async () => {
    const body = listToText(list, `${title} · ${weekRange(week)} · ${store?.name ?? ''}`, fmt);
    try {
      if (navigator.share) await navigator.share({ title, text: body });
      else {
        await navigator.clipboard.writeText(body);
        toast.show('List copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };
  const add = () => {
    if (!text.trim()) return;
    addCustom(week, text);
    setText('');
  };

  const totalCard = (
    <div className="total-card">
      {wide && <Ring pct={pct} size={64} stroke={6} label={`${Math.round(pct * 100)}%`} sub="used" />}
      <div className="grow">
        <div
          style={{
            fontSize: wide ? 12 : 15,
            opacity: 0.8,
            fontWeight: 600,
            letterSpacing: wide ? '0.08em' : 0,
            textTransform: wide ? 'uppercase' : 'none',
          }}
        >
          Estimated total
        </div>
        {wide && (
          <div className="amt">
            {fmt(list.total)} <small>of {money(plan.budget, plan.country, true)}</small>
          </div>
        )}
        {wide && (
          <div style={{ fontSize: 13.5, opacity: 0.7, marginTop: 2 }}>
            {list.inCart} of {list.count} in the cart
          </div>
        )}
      </div>
      {!wide && (
        <div className="amt">
          {fmt(list.total)} <small>of {money(plan.budget, plan.country, true)}</small>
        </div>
      )}
    </div>
  );

  const addCard = (
    <div className="card pad" style={{ marginTop: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        Add your own item
      </div>
      <form
        className="add-row"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={plan.country === 'UK' ? 'e.g. Kitchen roll' : 'e.g. Paper towels'}
          aria-label="Add your own item"
        />
        <button className="icon-btn sq" style={{ boxShadow: 'none', background: 'var(--paper)' }} aria-label="Add item" type="submit">
          <Icon name="plus" size={20} />
        </button>
      </form>
    </div>
  );

  const groups = list.groups.map((g) => {
    // Pantry staples start ticked; keep them tucked away unless the user unticked one.
    const isPantry = g.aisle === 'pantry';
    const hidden = isPantry && !showPantry ? g.items.filter((i) => i.checked).length : 0;
    const items = isPantry && !showPantry ? g.items.filter((i) => !i.checked) : g.items;
    return (
      <section key={g.aisle}>
        <div className="aisle-head">
          <span className="icon-tile sm">{g.emoji}</span>
          <span className="eyebrow grow">{g.label}</span>
          {g.aisle === 'pantry' && (
            <span className="faint" style={{ fontSize: 13 }}>
              Probably in your pantry
            </span>
          )}
        </div>
        <div className="list-card">
          {items.map((item) => (
            <div key={item.key} className={`item-row ${item.checked ? 'done' : ''} ${item.pantry ? 'pantry' : ''}`}>
              <button
                className={`check ${item.checked ? 'on' : ''}`}
                onClick={() => toggleCheck(week, item.key, item.checked)}
                aria-label={`${item.checked ? 'Untick' : 'Tick'} ${item.name}`}
                aria-pressed={item.checked}
              >
                {item.checked && <Icon name="check" size={15} stroke={3} />}
              </button>
              <button className="name" style={{ textAlign: 'left' }} onClick={() => toggleCheck(week, item.key, item.checked)}>
                {item.name}
                {item.usedIn.length > 0 && !item.pantry && <small>{item.usedIn.join(', ')}</small>}
              </button>
              {item.qty && <span className="qty">{item.qty}</span>}
              {item.custom ? (
                <button className="icon-btn sm ghost" onClick={() => removeCustom(week, item.key)} aria-label={`Remove ${item.name}`}>
                  <Icon name="close" size={16} />
                </button>
              ) : (
                !item.pantry && (
                  <button className="cost" onClick={() => setPriceFor(item)} aria-label={`Edit price for ${item.name}`}>
                    {fmt(item.cost)}
                  </button>
                )
              )}
            </div>
          ))}
          {isPantry && (
            <button
              className="item-row pantry"
              style={{ justifyContent: 'center', fontWeight: 700, color: 'var(--ink-soft)' }}
              onClick={() => setShowPantry(!showPantry)}
            >
              {showPantry ? 'Hide pantry items' : `Show ${hidden} pantry ${hidden === 1 ? 'item' : 'items'}`}
              <Icon name={showPantry ? 'chevronLeft' : 'chevronRight'} size={16} />
            </button>
          )}
        </div>
      </section>
    );
  });

  return (
    <>
      <div className={`screen ${wide ? 'wide' : ''}`} style={{ paddingBottom: 'calc(var(--safe-bottom) + 120px)' }}>
        <div className="row between" style={{ marginTop: 6 }}>
          <div>
            <h1 className="title-xl">{title}</h1>
            <p className="faint" style={{ marginTop: 4, fontWeight: 500 }}>
              {list.count} items · {weekRange(week)} · {store?.name}
            </p>
          </div>
          <button className="icon-btn" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/plan'))} aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        {wide ? (
          <div className="grocery-cols" style={{ marginTop: 10 }}>
            <div>{groups.filter((_, i) => i % 2 === 0)}</div>
            <div>{groups.filter((_, i) => i % 2 === 1)}</div>
            <div style={{ position: 'sticky', top: 20, marginTop: 22 }}>
              {totalCard}
              {addCard}
              <div className="stack" style={{ marginTop: 14 }}>
                <button className="btn btn-white" onClick={share}>
                  <Icon name="share" size={18} /> Share list
                </button>
                {store && (
                  <a className="btn btn-lime" href={store.home} target="_blank" rel="noreferrer">
                    <Icon name="external" size={18} /> Shop online at {store.name}
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 16 }}>{totalCard}</div>
            <div className="faint" style={{ fontSize: 13.5, marginTop: 8, textAlign: 'right' }}>
              {list.inCart} of {list.count} in the cart
            </div>
            {groups}
            {addCard}
            <p className="faint" style={{ fontSize: 12.5, marginTop: 16 }}>
              Prices are estimates for what each recipe uses. Tap a price to set your store’s real price.
            </p>
          </>
        )}
      </div>

      {!wide && (
        <div className="bottom-bar">
          <div className="inner">
            <button className="icon-btn sq" style={{ width: 56, height: 56 }} onClick={share} aria-label="Share list">
              <Icon name="share" size={20} />
            </button>
            {store && (
              <a className="btn btn-lime grow" href={store.home} target="_blank" rel="noreferrer">
                <Icon name="external" size={18} /> Shop online at {store.name}
              </a>
            )}
          </div>
        </div>
      )}

      {priceFor?.ingredientId && store && <PriceSheet item={priceFor} storeId={store.id} onClose={() => setPriceFor(null)} />}
      {toast.node}
    </>
  );
}

function PriceSheet({ item, storeId, onClose }: { item: ListItem; storeId: string; onClose: () => void }) {
  const profile = useApp((s) => s.profile);
  const overrides = useApp((s) => s.overrides);
  const setOverride = useApp((s) => s.setOverride);
  const country = profile.country;
  const id = item.ingredientId!;
  const metric = isMetric(country, profile.units);
  const price = unitPrice(id, country, storeId, overrides);
  const key = `${storeId}:${id}`;
  const [val, setVal] = useState(toDisplayPrice(price, metric).toFixed(2));
  const store = STORE_BY_ID[storeId];
  return (
    <Sheet open onClose={onClose} label="Edit price">
      <div className="row" style={{ marginBottom: 14 }}>
        <span className="icon-tile soft" style={{ fontSize: 26 }}>
          {ING[id].emoji}
        </span>
        <div className="grow">
          <h2 className="title-md">{ingName(id, country)}</h2>
          <span className="faint">
            {priceUnitLabel(price[1], metric)} at {store?.name}
          </span>
        </div>
      </div>
      <label className="search">
        <b>{money(0, country).replace(/[\d.,\s]/g, '')}</b>
        <input inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} aria-label="Price" />
        <span className="faint">{priceUnitLabel(price[1], metric)}</span>
      </label>
      <p className="faint" style={{ fontSize: 13.5, margin: '10px 0 16px' }}>
        Used for every plan from now on. Recipes are costed by the amount they use.
      </p>
      <div className="row">
        {overrides[key] !== undefined && (
          <button
            className="btn btn-white"
            onClick={() => {
              setOverride(key, null);
              onClose();
            }}
          >
            Reset
          </button>
        )}
        <a
          className="btn btn-white"
          href={store ? storeSearchUrl(store, ingName(id, country)) : '#'}
          target="_blank"
          rel="noreferrer"
          aria-label="Look it up on the store website"
        >
          <Icon name="search" size={18} />
        </a>
        <button
          className="btn btn-lime grow"
          onClick={() => {
            const n = Number(val.replace(',', '.'));
            if (Number.isFinite(n) && n > 0) setOverride(key, fromDisplayPrice(n, price[1], metric));
            onClose();
          }}
        >
          Save price
        </button>
      </div>
    </Sheet>
  );
}
