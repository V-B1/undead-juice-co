import Phaser from 'phaser';
import { BOOT_MIN_MS, config } from '../config';
import { SCENES } from './keys';
import { heading, onLayout } from './sceneHelpers';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  create(): void {
    this.textures.createCanvas('px', 1, 1)?.refresh();
    const title = heading(this, 'Squeezing the good stuff…', 40);
    const bar = this.add.graphics();
    let progress = 0;
    const layout = () => {
      const { width, height } = this.scale;
      title.setPosition(width / 2, height / 2 - 60);
      bar
        .clear()
        .fillStyle(0x2a1f3d)
        .fillRoundedRect(width / 2 - 240, height / 2, 480, 28, 14);
      if (progress > 0)
        bar.fillStyle(0x7dff6a).fillRoundedRect(width / 2 - 236, height / 2 + 4, 472 * progress, 20, 10);
    };
    onLayout(this, layout);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: BOOT_MIN_MS,
      onUpdate: (tween) => {
        progress = tween.getValue() ?? 0;
        layout();
      },
      onComplete: () => this.scene.start(config.startScene),
    });
  }
}
