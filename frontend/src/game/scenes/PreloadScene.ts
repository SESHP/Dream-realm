import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Загрузка...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(Math.round(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0x8b5cf6, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Загружаем единый спрайтшит персонажа
    this.load.spritesheet('player', '/assets/characters/player.png', {
      frameWidth: 48,
      frameHeight: 48
    });
  }

  create() {
    this.createPlayerAnimations();
    this.scene.start('ShelterScene');
  }

  private createPlayerAnimations() {
    // IDLE анимации (строки 0-3, по 6 кадров)
    this.anims.create({
      key: 'player-idle-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-up',
      frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-right',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-idle-left',
      frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
      frameRate: 8,
      repeat: -1
    });

    // WALK анимации (строки 4-7)
    this.anims.create({
      key: 'player-walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'player-walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });
  }
}