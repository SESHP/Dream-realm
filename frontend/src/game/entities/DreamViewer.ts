// src/entities/DreamViewer.ts
import Phaser from 'phaser';
import { InteractiveObject } from './InteractiveObject';
import { Player } from './Player';

export class DreamViewer extends InteractiveObject {
  private isActive: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player
  ) {
    super(scene, x, y, 'dream_viewer', player, 0);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setImmovable(true);
      this.body.setSize(16, 16);
    }

    this.setDepth(5);
  }

  interact(): void {
    if (this.isActive) {
      console.log('Dream Viewer is already active');
      return;
    }

    this.activateViewer();
  }

  private activateViewer(): void {
    this.isActive = true;

    // Эффект активации
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      yoyo: true,
      duration: 200
    });

    // Открываем UI для просмотра снов/воспоминаний
    this.openDreamUI();
  }

  private openDreamUI(): void {
    // Создаем затемнение
    const overlay = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
      this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0x000000,
      0.7
    );
    overlay.setScrollFactor(0);
    overlay.setDepth(200);

    const panel = this.scene.add.rectangle(
      this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 2,
      this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 2,
      120,
      80,
      0x1a1a2e
    );
    panel.setScrollFactor(0);
    panel.setDepth(201);
    panel.setStrokeStyle(2, 0x16213e);

    const title = this.scene.add.text(
      panel.x,
      panel.y - 30,
      'Dream Viewer',
      {
        fontSize: '10px',
        color: '#ffffff'
      }
    );
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(202);

    const closeText = this.scene.add.text(
      panel.x,
      panel.y + 30,
      '[E] Close',
      {
        fontSize: '8px',
        color: '#aaaaaa'
      }
    );
    closeText.setOrigin(0.5);
    closeText.setScrollFactor(0);
    closeText.setDepth(202);

    // Закрытие по E
    const closeHandler = (event: KeyboardEvent) => {
      if (event.code === 'KeyE') {
        overlay.destroy();
        panel.destroy();
        title.destroy();
        closeText.destroy();
        this.isActive = false;
        this.scene.input.keyboard.off('keydown', closeHandler);
      }
    };

    this.scene.input.keyboard.on('keydown', closeHandler);
  }
}