import Phaser from 'phaser';

export class Chest extends Phaser.GameObjects.Sprite {
  private isOpen: boolean = false;
  private isDestroyed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'chest', 0);
    
    scene.add.existing(this);
    
    // Origin внизу по центру
    this.setOrigin(0.5, 1);
    
    // Интерактивность
    this.setInteractive({ useHandCursor: true });
    
    // Клик для открытия
    this.on('pointerdown', () => this.open());
  }

  open() {
    if (this.isOpen || this.isDestroyed) return;
    
    this.isOpen = true;
    
    // Анимация открытия — переключаем кадры
    this.scene.time.delayedCall(0, () => {
      if (this.isDestroyed) return;
      this.setFrame(1);
    });
    
    this.scene.time.delayedCall(150, () => {
      if (this.isDestroyed) return;
      this.setFrame(2);
    });
    
    this.scene.time.delayedCall(300, () => {
      if (this.isDestroyed) return;
      this.setFrame(3);
      
      // Здесь можно добавить логику выдачи лута
      this.onOpened();
    });
  }

  private onOpened() {
    // Эмитим событие что сундук открыт — можно слушать в сцене
    this.emit('opened', this);
    
    // Можно добавить эффект частиц, звук и т.д.
    console.log('Chest opened!');
  }

  isOpened(): boolean {
    return this.isOpen;
  }

  destroy(fromScene?: boolean) {
    this.isDestroyed = true;
    super.destroy(fromScene);
  }
}