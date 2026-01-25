import Phaser from 'phaser';

export class CrystalReward extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private icon: Phaser.GameObjects.Sprite;

  constructor(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    amount: number,
    crystalKey: string // ключ спрайта кристалла
  ) {
    super(scene, x, y);
    
    scene.add.existing(this);
    
    // Иконка кристалла (конкретного типа)
    this.icon = scene.add.sprite(0, 0, crystalKey);
    this.icon.setOrigin(0.5);
    this.icon.setScale(1); // подбери размер
    
    // Текст "+0.15"
    this.text = scene.add.text(-14, 0, `+${amount.toFixed(2)}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.text.setOrigin(1, 0.5);
    this.text.setResolution(3);
    
    this.add([this.text, this.icon]);
    this.setDepth(1000);
    
    this.playAnimation();
  }

  private playAnimation() {
    // Вылет вверх с затуханием
    this.scene.tweens.add({
      targets: this,
      y: this.y - 50,
      alpha: { from: 1, to: 0 },
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
    
    // Легкое покачивание
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-10, 10),
      duration: 750,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    // Появление иконки с пульсацией
    this.scene.tweens.add({
      targets: this.icon,
      scale: { from: 0.5, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
}