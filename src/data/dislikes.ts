import { ING, ingName } from './ingredients';
import type { Country } from '../types';

/**
 * Whipp's "Common picks" on the Dislikes screen. Each pick covers every ingredient of that kind,
 * so disliking "Tomato" also drops passata, cherry tomatoes and tomato paste.
 */
export const DISLIKE_PICKS: { id: string; label: string; labelUK?: string; emoji: string; ids: string[] }[] = [
  { id: 'cilantro', label: 'Cilantro', labelUK: 'Coriander', emoji: '🌿', ids: ['cilantro'] },
  { id: 'mushroom', label: 'Mushroom', emoji: '🍄', ids: ['mushrooms'] },
  { id: 'olives', label: 'Olives', emoji: '🫒', ids: ['olives'] },
  { id: 'cucumber', label: 'Cucumber', emoji: '🥒', ids: ['cucumber'] },
  {
    id: 'tomato',
    label: 'Tomato',
    emoji: '🍅',
    ids: ['tomato', 'cherry_tomatoes', 'canned_tomatoes', 'passata', 'tomato_paste', 'sundried_tomatoes'],
  },
  { id: 'onion', label: 'Onion', emoji: '🧅', ids: ['onion', 'red_onion', 'shallot'] },
  { id: 'capers', label: 'Capers', emoji: '🫛', ids: ['capers'] },
  { id: 'tofu', label: 'Tofu', emoji: '🌱', ids: ['tofu'] },
  { id: 'feta', label: 'Feta', emoji: '🧀', ids: ['feta'] },
  { id: 'halloumi', label: 'Halloumi', emoji: '🧀', ids: ['halloumi'] },
  { id: 'shrimp', label: 'Shrimp', labelUK: 'Prawns', emoji: '🦐', ids: ['shrimp'] },
  { id: 'chorizo', label: 'Chorizo', emoji: '🌭', ids: ['chorizo'] },
  { id: 'coconut', label: 'Coconut', emoji: '🥥', ids: ['coconut_milk'] },
  { id: 'peanut', label: 'Peanut', emoji: '🥜', ids: ['peanuts', 'peanut_butter'] },
  { id: 'chili', label: 'Chili', labelUK: 'Chilli', emoji: '🌶️', ids: ['chili', 'chili_flakes', 'chili_powder', 'sweet_chili'] },
  { id: 'egg', label: 'Egg', emoji: '🥚', ids: ['eggs'] },
].map((p) => ({ ...p, ids: p.ids.filter((id) => ING[id]) }));

export const pickLabel = (p: (typeof DISLIKE_PICKS)[number], country: Country) => (country === 'UK' && p.labelUK ? p.labelUK : p.label);
export const pickOn = (p: (typeof DISLIKE_PICKS)[number], dislikes: string[]) => p.ids.length > 0 && p.ids.every((id) => dislikes.includes(id));

/** Dislikes as people think of them: whole picks first, then any single ingredients left over. */
export function dislikeLabels(dislikes: string[], country: Country): string[] {
  const picks = DISLIKE_PICKS.filter((p) => pickOn(p, dislikes));
  const covered = new Set(picks.flatMap((p) => p.ids));
  return [...picks.map((p) => pickLabel(p, country)), ...dislikes.filter((id) => !covered.has(id)).map((id) => ingName(id, country))];
}
