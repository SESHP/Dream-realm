// src/entities/Chest.ts
import Phaser from 'phaser';
import { InteractiveObject } from './InteractiveObject';
import { Player } from './Player';

export class Chest extends InteractiveObject {
  private isOpen: boolean = false;
  private contents: { type: string; amount: number }[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    contents?: { type: string; amount: number }[]
  ) {
    super(scene, x, y, 'chest', player, 0);

    if (contents) {
      this.contents = contents;
    }

    // Настройка физики
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setImmovable(true);
      this.body.setSize(16, 16);
    }

    this.setDepth(5);
  }

  interact(): void {
    if (this.isOpen) {
      console.log('Chest is already empty');
      return;
    }

    // Анимация открытия
    this.setFrame(1); // открытый спрайт
    this.isOpen = true;

    // Выдаем содержимое игроку
    this.giveContentsToPlayer();

    // Звук открытия (если есть)
    // this.scene.sound.play('chest_open');
  }

  private giveContentsToPlayer(): void {
    this.contents.forEach(item => {
      console.log(`Player received: ${item.amount}x ${item.type}`);
      // Здесь будет добавление в инвентарь
      // this.player.inventory.add(item.type, item.amount);
    });

    // Показываем всплывающий текст
    this.showPopupText('Chest opened!');
  }

  private showPopupText(text: string): void {
    const popup = this.scene.add.text(this.x, this.y - 30, text, {
      fontSize: '10px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    popup.setOrigin(0.5);
    popup.setDepth(101);

    // Анимация всплытия и исчезновения
    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 20,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });
  }
}