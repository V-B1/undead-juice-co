import Phaser from 'phaser';
import { SCENES } from './keys';
import { caption, heading, onLayout, transition, uiFor } from './sceneHelpers';

export class GalleryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.gallery);
  }

  create(): void {
    this.input.enabled = true;
    const title = heading(this, 'Art gallery');
    const note = caption(this, 'The cast arrives in M2.');
    uiFor(this).setSceneAction('Back', () => transition(this, SCENES.title), 'back');
    onLayout(this, () => {
      title.setPosition(this.scale.width / 2, this.scale.height * 0.4);
      note.setPosition(this.scale.width / 2, this.scale.height * 0.54);
    });
  }
}
