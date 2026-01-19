import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Загружаем минимальные ассеты для экрана загрузки
    this.load.image('logo', '/assets/ui/logo.png');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
