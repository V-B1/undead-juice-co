export const DESIGN_W = 1280;
export const DESIGN_H = 720;
export const BOOT_MIN_MS = 300;
export const TRANSITION_MS = 200;
export const TOAST_MS = 2500;
export const POINTER_RADIUS = 42;
export const POINTER_COLORS = [0x7dff6a, 0xffd23f, 0xff8a3d, 0x72dbff];
export const FPS_REFRESH_MS = 500;
export const HAPTICS = { catch: 20, stun: 60, levelUp: [30, 40, 30] } as const;

const scenes = ['title', 'base', 'map', 'hunt', 'gallery'] as const;
const areas = ['bayou', 'ghost_town', 'frost_peak', 'toxic_plant'] as const;
export type StartScene = (typeof scenes)[number];

export function parseParams(search: string) {
  const params = new URLSearchParams(search);
  const scene = scenes.find((value) => value === params.get('scene')) ?? 'title';
  const area = areas.find((value) => value === params.get('area')) ?? 'bayou';
  const rawSeed = params.get('seed');
  const number = rawSeed?.trim() ? Number(rawSeed) : NaN;
  const seed = Number.isSafeInteger(number) && number >= 0 ? number : undefined;
  return {
    debug: params.get('debug') === '1',
    scene,
    area,
    night: params.get('night') === '1',
    boss: params.get('boss') === '1',
    seed,
  };
}

const params = parseParams(typeof window === 'undefined' ? '' : window.location.search);
export const config = { ...params, startScene: params.scene };

export function debugLog(...values: readonly unknown[]): void {
  if (config.debug) console.debug('[UJC]', ...values);
}
