// src/entities/InteractiveObject.ts
import Phaser from 'phaser';
import { Player } from './Player';

export abstract class InteractiveObject extends Phaser.Physics.Arcade.Sprite {
  protected player: Player;
  protected isPlayerNearby: boolean = false;
  protected interactionRadius: number = 24; // радиус взаимодействия в пикселях
  protected hintText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    player: Player,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    this.player = player;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Создаем подсказку "[E] Interact"
    this.createHint();
  }

  private createHint() {
    this.hintText = this.scene.add.text(this.x, this.y - 20, '[E]', {
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setVisible(false);
    this.hintText.setDepth(100);
  }

  update() {
    // Проверяем дистанцию до игрока
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y
    );

    this.isPlayerNearby = distance < this.interactionRadius;

    // Показываем/скрываем подсказку
    if (this.hintText) {
      this.hintText.setVisible(this.isPlayerNearby);
      this.hintText.setPosition(this.x, this.y - 20);
    }
  }

  canInteract(): boolean {
    return this.isPlayerNearby;
  }

  abstract interact(): void;

  destroy(fromScene?: boolean) {
    if (this.hintText) {
      this.hintText.destroy();
    }
    super.destroy(fromScene);
  }
}