import Phaser from 'phaser';

export class Door extends Phaser.Physics.Arcade.Sprite {
  private isOpen = false;                  // статус двери
  private autoCloseTimer?: Phaser.Time.TimerEvent;
  private player!: Phaser.Physics.Arcade.Sprite;
  private hasExited = false;               // чтобы один раз вызвать телепорт
  private onExit?: () => void;             // callback при выходе через дверь

  constructor(scene: Phaser.Scene, x: number, y: number, player: Phaser.Physics.Arcade.Sprite) {
    super(scene, x, y, 'door', 0);

    this.player = player;

    // добавляем спрайт в сцену и включаем физику
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setSize(16, 16);
      this.body.setOffset(0, 0);
    }
  }

  /** Установить callback для телепорта */
  setExitCallback(callback: () => void) {
    this.onExit = callback;
  }

  /** Открытие двери с плавной анимацией */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;

    // отключаем коллизию
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.enable = false;
    }

    // Tween кадра 0 → 1
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 150,
      onUpdate: (tween) => {
        this.setFrame(Math.round(tween.getValue()));
      }
    });

    // запускаем таймер автозакрытия
    this.startAutoCloseTimer();
  }

  /** Закрытие двери с плавной анимацией */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.enable = true;
    }

    this.scene.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 150,
      onUpdate: (tween) => {
        this.setFrame(Math.round(tween.getValue()));
      }
    });
  }

  /** Автозакрытие с проверкой игрока рядом */
  private startAutoCloseTimer() {
    if (this.autoCloseTimer) this.autoCloseTimer.remove(false);

    this.autoCloseTimer = this.scene.time.delayedCall(2000, () => {
      if (!this.isOpen) return;

      const playerRect = this.player.getBounds();
      const doorRect = this.getBounds();
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.x, this.y);

      // если игрок рядом или в проёме → перезапустить таймер
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, doorRect) || distance < 24) {
        this.startAutoCloseTimer();
      } else {
        this.close();
      }
    });
  }

  /** Проверка overlap с игроком для телепорта */
  update() {
    if (!this.isOpen || this.hasExited) return;

    const playerRect = this.player.getBounds();
    const doorRect = this.getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, doorRect)) {
      this.hasExited = true;
      this.onExit?.();
    }
  }
}
