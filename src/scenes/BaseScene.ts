import Phaser from 'phaser';
import { DESIGN_H } from '../config';
import { SCENES } from './keys';
import { caption, heading, onLayout, transition, uiFor } from './sceneHelpers';

export class BaseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.base);
  }

  create(): void {
    this.input.enabled = true;
    const title = heading(this, 'The yard');
    const note = caption(this, 'Undead Juice Co. headquarters · M0 scaffold');
    const go = () => transition(this, SCENES.hunt);
    uiFor(this).setSceneAction('Go hunt', go);
    this.input.keyboard?.on('keydown-ENTER', go);
    onLayout(this, () => {
      const { width, height } = this.scale;
      const zoom = height / DESIGN_H;
      this.cameras.main.setOrigin(0, 0).setZoom(zoom).setScroll(0, 0);
      title.setPosition(width / zoom / 2, 255);
      note.setPosition(width / zoom / 2, 350);
    });
  }
}
