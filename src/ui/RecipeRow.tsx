import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { perServing } from '../engine/cost';
import { money } from '../engine/pricing';
import { usePriceCtx } from '../state/hooks';
import { useApp } from '../state/store';
import type { Recipe } from '../types';
import { MealImage, Tags, recipeTags } from './primitives';

/** Sticky page header used by Discover, Favorites and Profile (bold sans title, like Whipp). */
export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="inner">
        <h1 className="page-title">{title}</h1>
        {children}
      </div>
    </header>
  );
}

/** Meal card linking to the recipe — same look as the Plan cards, priced per person at your store. */
export function RecipeRow({ recipe }: { recipe: Recipe }) {
  const ctx = usePriceCtx();
  const priorities = useApp((s) => s.profile.priorities);
  return (
    <Link to={`/recipe/${recipe.id}`} className="meal-card">
      <div className="thumb">
        <MealImage recipe={recipe} />
      </div>
      <div className="body">
        <Tags tags={recipeTags(recipe, priorities)} />
        <h3 style={{ paddingRight: 0 }}>{recipe.title}</h3>
        <p className="desc">{recipe.description}</p>
        <div className="foot">
          <span className="muted">
            Serves {recipe.serves} · {recipe.time} min
          </span>
          <span className="price">
            {money(perServing(recipe, ctx), ctx.country)}
            <small>pp</small>
          </span>
        </div>
      </div>
    </Link>
  );
}
