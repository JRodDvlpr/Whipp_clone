import { describe, expect, it } from 'vitest';
import { DISLIKE_PICKS, dislikeLabels, pickOn } from './dislikes';
import { ING } from './ingredients';

describe('dislike picks', () => {
  it('every pick covers at least one real ingredient', () => {
    for (const p of DISLIKE_PICKS) {
      expect(p.ids.length, p.id).toBeGreaterThan(0);
      for (const id of p.ids) expect(ING[id], `${p.id} → ${id}`).toBeDefined();
    }
  });

  it('summarises whole picks by name and leftovers by ingredient', () => {
    const tomato = DISLIKE_PICKS.find((p) => p.id === 'tomato')!;
    const dislikes = [...tomato.ids, 'avocado'];
    expect(pickOn(tomato, dislikes)).toBe(true);
    expect(dislikeLabels(dislikes, 'US')).toEqual(['Tomato', 'Avocado']);
    expect(dislikeLabels(['shrimp'], 'UK')).toEqual(['Prawns']);
  });
});
