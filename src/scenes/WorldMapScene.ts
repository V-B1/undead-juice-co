import Phaser from 'phaser';
import { DESIGN_H } from '../config';
import { SCENES } from './keys';
import { caption, heading, onLayout, transition, uiFor } from './sceneHelpers';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super(SCENES.map);
  }

  create(): void {
    this.input.enabled = true;
    const title = heading(this, 'World map');
    const note = caption(this, 'Area selection arrives in M6.');
    uiFor(this).setSceneAction('Back', () => transition(this, SCENES.base), 'back');
    onLayout(this, () => {
      const zoom = this.scale.height / DESIGN_H;
      this.cameras.main.setOrigin(0, 0).setZoom(zoom).setScroll(0, 0);
      title.setPosition(this.scale.width / zoom / 2, 280);
      note.setPosition(this.scale.width / zoom / 2, 380);
    });
  }
}
