import { describe, expect, it } from 'vitest';
import { parseParams } from '../src/config';

describe('parseParams', () => {
  it('supplies deterministic defaults without browser globals', () => {
    expect(parseParams('')).toEqual({
      debug: false,
      scene: 'title',
      area: 'bayou',
      night: false,
      boss: false,
      seed: undefined,
    });
  });

  it('parses every supported hook', () => {
    expect(parseParams('?debug=1&scene=hunt&area=ghost_town&night=1&boss=1&seed=42')).toEqual({
      debug: true,
      scene: 'hunt',
      area: 'ghost_town',
      night: true,
      boss: true,
      seed: 42,
    });
  });

  it.each(['title', 'base', 'map', 'hunt', 'gallery'])('accepts the %s scene', (scene) => {
    expect(parseParams(`?scene=${scene}`).scene).toBe(scene);
  });

  it.each(['bayou', 'ghost_town', 'frost_peak', 'toxic_plant'])('accepts the %s area', (area) => {
    expect(parseParams(`?area=${area}`).area).toBe(area);
  });

  it('falls back for unknown scenes and areas', () => {
    expect(parseParams('?scene=boot&area=unknown')).toMatchObject({ scene: 'title', area: 'bayou' });
  });

  it('requires exactly 1 for boolean flags', () => {
    expect(parseParams('?debug=true&night=0&boss')).toMatchObject({
      debug: false,
      night: false,
      boss: false,
    });
  });

  it.each(['', ' ', 'NaN', 'Infinity', '-1', '1.5', '9007199254740992', 'nope'])(
    'rejects invalid seed %j',
    (seed) => {
      expect(parseParams(`?seed=${encodeURIComponent(seed)}`).seed).toBeUndefined();
    },
  );

  it('preserves zero as a valid seed and ignores unrelated params', () => {
    expect(parseParams('?seed=0&unrelated=1').seed).toBe(0);
  });

  it('does not carry values between calls', () => {
    parseParams('?debug=1&seed=25');
    expect(parseParams('').debug).toBe(false);
    expect(parseParams('').seed).toBeUndefined();
  });
});
