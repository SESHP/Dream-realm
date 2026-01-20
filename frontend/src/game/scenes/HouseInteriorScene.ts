import Phaser from 'phaser';

export class HouseInteriorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HouseInteriorScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Inside House\n\nPress E to exit',
        { fontSize: '24px', color: '#ffffff', align: 'center' }
    ).setOrigin(0.5);
    
    // Выход по E
    this.input.keyboard?.once('keydown-E', () => {
        this.exitHouse();
    });
  }

  private exitHouse() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('VillageScene', { exitingHouse: true });
    });
    }
}