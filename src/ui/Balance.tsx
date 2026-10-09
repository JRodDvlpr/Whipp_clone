import { Link } from 'react-router-dom';
import { balanceCheck, HIGHLIGHTS } from '../engine/balance';
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
        How we choose these meals →
      </Link>
    </div>
  );
}
