import '@fontsource/lilita-one';
import Phaser from 'phaser';
import { config, DESIGN_H, DESIGN_W, FPS_REFRESH_MS } from './config';
import { GRAVITY_Y } from './data/balance';
import { startLifecycle, lifecycleEvents } from './platform/lifecycle';
import { orientationEvents, startOrientation } from './platform/orientation';
import { startPwa } from './platform/pwa';
import { startSafeArea } from './platform/safeArea';
import { BaseScene } from './scenes/BaseScene';
import { BootScene } from './scenes/BootScene';
import { GalleryScene } from './scenes/GalleryScene';
import { HuntScene } from './scenes/HuntScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { UiRoot } from './ui/UiRoot';
import { h } from './ui/dom';
import './ui/styles.css';

await document.fonts.load('48px "Lilita One"');

const game = new Phaser.Game({
  type: Phaser.AUTO,
  backgroundColor: '#1a1226',
  banner: false,
  scale: {
    mode: Phaser.Scale.EXPAND,
    parent: 'game',
    width: DESIGN_W,
    height: DESIGN_H,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: document.body,
  },
  input: { activePointers: 4 },
  render: { antialias: true, roundPixels: false },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: GRAVITY_Y }, debug: config.debug } },
  scene: [BootScene, TitleScene, BaseScene, WorldMapScene, HuntScene, GalleryScene],
});
const root = document.getElementById('ui');
const rotate = document.getElementById('rotate');
if (!root || !rotate) throw new Error('Missing game shell elements');
const ui = new UiRoot(root);
game.registry.set('ui', ui);

startSafeArea();
let portrait = matchMedia('(orientation: portrait)').matches;
let hidden = document.hidden;
const updatePause = () => {
  if (portrait || hidden) game.pause();
  else game.resume();
};
orientationEvents.addEventListener('pause', () => {
  portrait = true;
  updatePause();
});
orientationEvents.addEventListener('landscape', () => {
  portrait = false;
  updatePause();
});
lifecycleEvents.addEventListener('hidden', () => {
  hidden = true;
  updatePause();
});
lifecycleEvents.addEventListener('visible', () => {
  hidden = false;
  updatePause();
});
startOrientation(rotate);
startLifecycle();
startPwa(ui);

document.addEventListener('gesturestart', (event) => event.preventDefault(), { passive: false });
document.addEventListener('dblclick', (event) => event.preventDefault(), { passive: false });

if (config.debug) {
  const fps = h('div', { className: 'fps' }, 'FPS —');
  root.append(fps);
  let last = 0;
  game.events.on(Phaser.Core.Events.POST_STEP, (time: number) => {
    if (time - last < FPS_REFRESH_MS) return;
    last = time;
    fps.textContent = `${Math.round(game.loop.actualFps)} FPS`;
  });
}
