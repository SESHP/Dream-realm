import Phaser from 'phaser';

export class CrystalReward extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private icon: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    amount: number,
    crystalKey: string
  ) {
    super(scene, x, y);
    
    scene.add.existing(this);
    
    // Иконка кристалла
    this.icon = scene.add.sprite(0, 0, crystalKey);
    this.icon.setOrigin(0.5);
    this.icon.setScale(0.5); // ← УМЕНЬШИ до 0.3-0.5
    
    // Текст "+0.15"
    this.text = scene.add.text(-10, 0, `+${amount.toFixed(2)}`, { // ← -10 вместо -14
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', // ← УМЕНЬШИ с 8px до 6px или 5px
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 1, // ← УМЕНЬШИ с 2 до 1
    });
    this.text.setOrigin(1, 0.5);
    this.text.setResolution(3);
    
    this.add([this.text, this.icon]);
    this.setDepth(1000);
    
    this.playAnimation();
  }

  private playAnimation() {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30, // ← УМЕНЬШИ с 50 до 30
      alpha: { from: 1, to: 0 },
      duration: 1200, // ← можно уменьшить до 1000
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
    
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-5, 5), // ← УМЕНЬШИ с 10 до 5
      duration: 600,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    this.scene.tweens.add({
      targets: this.icon,
      scale: { from: 0.3, to: 0.5 }, // ← подкорректируй под размер иконки
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}