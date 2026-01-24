// src/entities/FragmentProcessor.ts
import Phaser from 'phaser';
import { InteractiveObject } from './InteractiveObject';
import { Player } from './Player';

export class FragmentProcessor extends InteractiveObject {
  private requiredFragments: number = 5;
  private isProcessing: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player
  ) {
    super(scene, x, y, 'fragment_processor', player, 0);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setImmovable(true);
      this.body.setSize(16, 16);
    }

    this.setDepth(5);
  }

  interact(): void {
    if (this.isProcessing) {
      console.log('Already processing...');
      return;
    }

    // Проверяем количество осколков у игрока
    const playerFragments = 0; // this.player.inventory.count('fragment');

    if (playerFragments < this.requiredFragments) {
      this.showMessage(`Need ${this.requiredFragments} fragments (you have ${playerFragments})`);
      return;
    }

    this.processFragments();
  }

  private processFragments(): void {
    this.isProcessing = true;
    this.showMessage('Processing fragments...');

    // Анимация обработки
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.5 },
      yoyo: true,
      repeat: 3,
      duration: 300,
      onComplete: () => {
        this.completeProcessing();
      }
    });
  }

  private completeProcessing(): void {
    // Забираем осколки
    // this.player.inventory.remove('fragment', this.requiredFragments);

    // Выдаем награду (например, ключ или новый предмет)
    // this.player.inventory.add('processed_crystal', 1);

    this.showMessage('Processing complete! Crystal created.');
    this.isProcessing = false;

    // Звук завершения
    // this.scene.sound.play('process_complete');
  }

  private showMessage(text: string): void {
    const message = this.scene.add.text(this.x, this.y - 40, text, {
      fontSize: '8px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    });
    message.setOrigin(0.5);
    message.setDepth(101);

    this.scene.tweens.add({
      targets: message,
      y: message.y - 15,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => message.destroy()
    });
  }
}