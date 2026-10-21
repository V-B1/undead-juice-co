import Phaser from 'phaser';
import { requestFullscreen } from '../platform/fullscreen';
import { insets } from '../platform/safeArea';
import { SCENES } from './keys';
import { caption, heading, onLayout, transition, uiFor } from './sceneHelpers';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENES.title);
  }

  create(): void {
    this.input.enabled = true;
    const title = heading(this, 'Undead Juice Co.', 100);
    const subtitle = caption(this, "Catch 'em. Juice 'em. Sell 'em.");
    const start = () => {
      if (!this.input.enabled) return;
      requestFullscreen();
      transition(this, SCENES.base);
    };
    uiFor(this).setSceneAction('Tap to start', start);
    uiFor(this).pulseSceneAction();
    this.input.on('pointerup', start);
    this.input.keyboard?.on('keydown-ENTER', start);
    this.input.keyboard?.on('keydown-SPACE', start);
    onLayout(this, () => {
      const { width, height } = this.scale;
      const safe = insets();
      const ratio = width / this.game.canvas.clientWidth;
      const available = width - (safe.left + safe.right) * ratio - 80;
      title.setFontSize(Math.min(100, available / 8)).setPosition(width / 2, height * 0.36);
      subtitle.setPosition(width / 2, height * 0.49);
    });
  }
}
