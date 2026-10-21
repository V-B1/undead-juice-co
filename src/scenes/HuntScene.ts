import Phaser from 'phaser';
import { config, DESIGN_H, DESIGN_W, POINTER_COLORS, POINTER_RADIUS } from '../config';
import { insets } from '../platform/safeArea';
import { SCENES } from './keys';
import { caption, onLayout, transition, uiFor } from './sceneHelpers';

export class HuntScene extends Phaser.Scene {
  private pointerArt!: Phaser.GameObjects.Graphics;
  private readonly pointerLabels: Phaser.GameObjects.Text[] = [];
  private pointerNames: string[] = [];

  constructor() {
    super(SCENES.hunt);
  }

  create(): void {
    this.input.enabled = true;
    this.pointerLabels.length = 0;
    this.pointerNames = this.input.manager.pointers.map((pointer) => `id ${pointer.id}`);
    const frame = this.add.graphics();
    const hud = this.add.container(0, 0);
    const markers = this.add.graphics();
    this.pointerArt = this.add.graphics();
    const metrics = caption(this, '');
    const help = caption(this, 'Hold up to four fingers · each pointer keeps its own id');
    help.setFontSize(24);
    const mode = caption(
      this,
      `${config.area} · ${config.boss ? 'boss' : config.night ? 'night' : 'day'} · seed ${config.seed ?? 'auto'}`,
    );
    mode.setFontSize(22);
    hud.add([markers, this.pointerArt, metrics, help, mode]);
    for (let i = 0; i < 4; i++) {
      const label = caption(this, '').setVisible(false).setFontSize(24);
      this.pointerLabels.push(label);
      hud.add(label);
    }
    const screenCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.cameras.main.ignore(hud);
    screenCamera.ignore(frame);
    const goBack = () => transition(this, SCENES.base);
    uiFor(this).setSceneAction('Back', goBack, 'back');
    this.input.keyboard?.on('keydown-ESC', goBack);
    onLayout(this, () => {
      const { width, height } = this.scale;
      const zoom = height / DESIGN_H;
      this.cameras.main.setOrigin(0, 0).setZoom(zoom).setScroll(0, 0);
      screenCamera.setSize(width, height);
      const left = (width / zoom - DESIGN_W) / 2;
      frame
        .clear()
        .lineStyle(4, 0xffd23f)
        .strokeRect(left + 2, 2, DESIGN_W - 4, DESIGN_H - 4);
      const safe = insets();
      const ratio = width / this.game.canvas.clientWidth;
      const x1 = safe.left * ratio + 20;
      const x2 = width - safe.right * ratio - 20;
      const y1 = safe.top * ratio + 20;
      const y2 = height - safe.bottom * ratio - 20;
      markers.clear().lineStyle(6, 0x7dff6a);
      for (const [x, y, dx, dy] of [
        [x1, y1, 1, 1],
        [x2, y1, -1, 1],
        [x1, y2, 1, -1],
        [x2, y2, -1, -1],
      ]) {
        markers.lineBetween(x, y, x + dx * 48, y);
        markers.lineBetween(x, y, x, y + dy * 48);
      }
      metrics
        .setText(`${Math.round(width)} × ${Math.round(height)} · zoom ${zoom.toFixed(3)} · frame 1280 × 720`)
        .setPosition(width / 2, y1 + 55);
      help.setPosition(width / 2, y1 + 105);
      mode.setPosition(width / 2, y1 + 145);
    });
  }

  override update(): void {
    this.pointerArt.clear();
    let index = 0;
    const pointers = this.input.manager.pointers;
    for (let i = 0; i < pointers.length; i++) {
      const pointer = pointers[i];
      if (!pointer.isDown || index >= 4) continue;
      this.pointerArt
        .lineStyle(4, POINTER_COLORS[index])
        .fillStyle(POINTER_COLORS[index], 0.2)
        .fillCircle(pointer.x, pointer.y, POINTER_RADIUS)
        .strokeCircle(pointer.x, pointer.y, POINTER_RADIUS);
      const label = this.pointerLabels[index];
      const id = this.pointerNames[pointer.id];
      if (label.text !== id) label.setText(id);
      label
        .setPosition(
          Phaser.Math.Clamp(pointer.x, label.width / 2, this.scale.width - label.width / 2),
          Math.min(pointer.y + POINTER_RADIUS + 24, this.scale.height - label.height / 2),
        )
        .setVisible(true);
      index++;
    }
    while (index < 4) this.pointerLabels[index++].setVisible(false);
  }
}
