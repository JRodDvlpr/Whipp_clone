import { Link } from 'react-router-dom';
import { antiInflammatoryCheck, STARS } from '../engine/antiInflammatory';
import { balanceCheck, HIGHLIGHTS } from '../engine/balance';
import { proteinCheck } from '../engine/protein';
import { ING } from '../data/ingredients';
import type { Recipe } from '../types';

/** "Why it fits" card on a recipe that meets every Her Balance rule. */
export function BalancePanel({ recipe }: { recipe: Recipe }) {
  if (!recipe.tags.includes('balance')) return null;
  const n = recipe.nutrition;
  const { highlights } = balanceCheck(recipe);
  return (
    <div className="card balance-card">
      <div className="row" style={{ gap: 12 }}>
        <span className="balance-icon" aria-hidden="true">
          🌸
        </span>
        <div className="grow">
          <b>Her Balance</b>
          <div className="faint" style={{ fontSize: 14 }}>
            Weight-loss friendly · supports hormones
          </div>
        </div>
      </div>
      <div className="balance-stats">
        <span>
          <b>{n.protein} g</b> protein
        </span>
        <span>
          <b>{n.fiber} g</b> fiber
        </span>
        <span>
          <b>{n.kcal}</b> kcal
        </span>
        <span>
          <b>{Math.max(0, n.carbs - n.fiber)} g</b> net carbs
        </span>
      </div>
      <ul className="balance-list">
        {highlights.map((h) => (
          <li key={h}>
            <b>{HIGHLIGHTS[h].label}</b> — {HIGHLIGHTS[h].why}
          </li>
        ))}
      </ul>
      <Link to="/info/balance" className="balance-link">
        How we choose Her Balance meals →
      </Link>
    </div>
  );
}

/** "Why it's anti-inflammatory" card on a recipe that meets every anti-inflammatory rule. */
export function AntiInflammatoryPanel({ recipe }: { recipe: Recipe }) {
  if (!recipe.tags.includes('anti_inflammatory')) return null;
  const n = recipe.nutrition;
  const { stars, vegGrams } = antiInflammatoryCheck(recipe);
  return (
    <div className="card balance-card anti">
      <div className="row" style={{ gap: 12 }}>
        <span className="balance-icon" aria-hidden="true">
          🫒
        </span>
        <div className="grow">
          <b>Anti-inflammatory</b>
          <div className="faint" style={{ fontSize: 14 }}>
            Mediterranean-style · calms inflammation
          </div>
        </div>
      </div>
      <div className="balance-stats">
        <span>
          <b>{vegGrams} g</b> veg
        </span>
        <span>
          <b>{n.fiber} g</b> fiber
        </span>
        <span>
          <b>{stars.length}</b> key foods
        </span>
        <span>
          <b>0</b> red meat
        </span>
      </div>
      <ul className="balance-list">
        {stars.map((s) => (
          <li key={s}>
            <b>{STARS[s].label}</b> — {STARS[s].why}
          </li>
        ))}
      </ul>
      <Link to="/info/anti-inflammatory" className="balance-link">
        How we choose anti-inflammatory meals →
      </Link>
    </div>
  );
}

/** "Why it's high protein" card: protein per serving, share of calories, and where it comes from. */
export function ProteinPanel({ recipe }: { recipe: Recipe }) {
  if (!recipe.tags.includes('high_protein')) return null;
  const { grams, share } = proteinCheck(recipe);
  const sources = [
    ...new Set(
      recipe.ingredients
        .map((l) => ING[l[0]])
        .filter((i) => i?.protein)
        .map((i) => i.name),
    ),
  ].slice(0, 3);
  return (
    <div className="card balance-card protein">
      <div className="row" style={{ gap: 12 }}>
        <span className="balance-icon" aria-hidden="true">
          💪
        </span>
        <div className="grow">
          <b>High protein</b>
          <div className="faint" style={{ fontSize: 14 }}>
            Protein-packed · keeps you full and fuels muscle
          </div>
        </div>
      </div>
      <div className="balance-stats three">
        <span>
          <b>{grams} g</b> protein
        </span>
        <span>
          <b>{Math.round(share * 100)}%</b> of calories
        </span>
        <span>
          <b>{recipe.nutrition.kcal}</b> kcal
        </span>
      </div>
      <p className="faint" style={{ fontSize: 14.5, margin: 0 }}>
        From {sources.join(', ').toLowerCase()}.
      </p>
      <Link to="/info/high-protein" className="balance-link">
        How we choose high-protein meals →
      </Link>
    </div>
  );
}
