import Phaser from 'phaser';
import { TRANSITION_MS } from '../config';
import { safeAreaEvents } from '../platform/safeArea';
import { UiRoot } from '../ui/UiRoot';

export function uiFor(scene: Phaser.Scene): UiRoot {
  const ui: unknown = scene.registry.get('ui');
  if (!(ui instanceof UiRoot)) throw new Error('UiRoot must be mounted before scenes start');
  return ui;
}

export function onLayout(scene: Phaser.Scene, layout: () => void): void {
  scene.scale.on('resize', layout);
  safeAreaEvents.addEventListener('change', layout);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off('resize', layout);
    safeAreaEvents.removeEventListener('change', layout);
    uiFor(scene).clearSceneAction();
  });
  layout();
}

export function transition(scene: Phaser.Scene, key: string): void {
  if (scene.cameras.main.fadeEffect.isRunning) return;
  scene.input.enabled = false;
  uiFor(scene).clearSceneAction();
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key));
  scene.cameras.main.fadeOut(TRANSITION_MS, 26, 18, 38);
}

export function heading(scene: Phaser.Scene, text: string, size = 64): Phaser.GameObjects.Text {
  return scene.add
    .text(0, 0, text, {
      fontFamily: '"Lilita One"',
      fontSize: `${size}px`,
      color: '#ffd23f',
      align: 'center',
      stroke: '#1f1430',
      strokeThickness: 6,
    })
    .setOrigin(0.5);
}

export function caption(scene: Phaser.Scene, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(0, 0, text, {
      fontFamily: 'system-ui',
      fontSize: '28px',
      color: '#fff6df',
      align: 'center',
    })
    .setOrigin(0.5);
}
