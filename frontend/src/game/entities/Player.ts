import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  
  private speed: number = 120;
  private currentDirection: string = 'down';
  private isGathering: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.setSize(16, 12);
    this.setOffset(16, 32);
    
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
    
    this.play('player-idle-down');
    console.log('Player created at:', x, y);
  }

  update() {
    if (this.isGathering) {
      this.setVelocity(0, 0);
      return;
    }

    const speed = this.speed;
    let velocityX = 0;
    let velocityY = 0;
    let moving = false;
    let newDirection = this.currentDirection;

    const left = this.cursors?.left.isDown || this.wasd?.A.isDown;
    const right = this.cursors?.right.isDown || this.wasd?.D.isDown;
    const up = this.cursors?.up.isDown || this.wasd?.W.isDown;
    const down = this.cursors?.down.isDown || this.wasd?.S.isDown;

    if (left) {
      velocityX = -speed;
      newDirection = 'left';
      moving = true;
    } else if (right) {
      velocityX = speed;
      newDirection = 'right';
      moving = true;
    }

    if (up) {
      velocityY = -speed;
      newDirection = 'up';
      moving = true;
    } else if (down) {
      velocityY = speed;
      newDirection = 'down';
      moving = true;
    }

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.setVelocity(velocityX, velocityY);

    // Flip для левой стороны (используем right анимацию)
    if (newDirection === 'left') {
      this.setFlipX(true);
    } else if (newDirection === 'right') {
      this.setFlipX(false);
    }

    const animDirection = newDirection === 'left' ? 'right' : newDirection;
    const animKey = moving ? `player-walk-${animDirection}` : `player-idle-${animDirection}`;
    
    if (this.anims.currentAnim?.key !== animKey) {
      this.play(animKey, true);
    }
    
    this.currentDirection = newDirection;
  }

  startGathering() {
    this.isGathering = true;
    this.setVelocity(0, 0);
  }

  stopGathering() {
    this.isGathering = false;
  }

  getDirection(): string {
    return this.currentDirection;
  }
}