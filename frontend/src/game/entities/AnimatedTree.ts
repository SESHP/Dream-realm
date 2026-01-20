import Phaser from 'phaser';

export class AnimatedTree extends Phaser.GameObjects.Sprite {
  private swayTween: Phaser.Tweens.Tween | null = null;
  private swayTimer: Phaser.Time.TimerEvent | null = null;
  private isDestroyed: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    
    // Origin внизу по центру — точка вращения у корней
    this.setOrigin(0.5, 1);
    
    // Случайный начальный угол
    this.angle = Phaser.Math.FloatBetween(-0.5, 0.5);
    
    // Случайная задержка перед началом анимации
    const randomDelay = Phaser.Math.Between(0, 2000);
    this.swayTimer = scene.time.delayedCall(randomDelay, () => {
      if (!this.isDestroyed && this.scene && this.active) {
        this.startSwaying();
      }
    });
  }

  private startSwaying() {
    if (this.isDestroyed || !this.scene || !this.active) return;
    
    // Лёгкое покачивание
    const swayAngle = Phaser.Math.FloatBetween(0.5, 1.2);
    const swayDuration = Phaser.Math.Between(2500, 4000);
    
    this.swayTween = this.scene.tweens.add({
      targets: this,
      angle: { from: -swayAngle, to: swayAngle },
      duration: swayDuration,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  destroy(fromScene?: boolean) {
    this.isDestroyed = true;
    
    if (this.swayTimer) {
      this.swayTimer.destroy();
      this.swayTimer = null;
    }
    
    if (this.swayTween) {
      this.swayTween.destroy();
      this.swayTween = null;
    }
    
    super.destroy(fromScene);
  }
}