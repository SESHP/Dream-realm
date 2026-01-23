import Phaser from 'phaser';

export class House extends Phaser.GameObjects.Sprite {
  private isDoorOpen: boolean = false;
  private isAnimating: boolean = false;
  private player: Phaser.GameObjects.Sprite | null = null;
  private interactionZone!: Phaser.GameObjects.Zone;
  private isPlayerNear: boolean = false;
  private eKey!: Phaser.Input.Keyboard.Key;
  private promptText: Phaser.GameObjects.Text | null = null;
  private doorX: number = 0;
  private doorY: number = 0;
  

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'house', 0);
    
    scene.add.existing(this);
    
    // Origin внизу по центру — дом "стоит" на этой точке
    this.setOrigin(0.5, 1);

    // Позиция двери (центр-низ дома)
    this.doorX = x;
    this.doorY = y - 15; // Чуть выше нижней точки
    
    // Создаём анимации
    this.createAnimations();
    
    // Клавиша E
    this.eKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private createAnimations() {
    // Анимация открытия двери
    if (!this.scene.anims.exists('house_door_open')) {
      this.scene.anims.create({
        key: 'house_door_open',
        frames: this.scene.anims.generateFrameNumbers('house', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    // Анимация закрытия двери (обратная)
    if (!this.scene.anims.exists('house_door_close')) {
      this.scene.anims.create({
        key: 'house_door_close',
        frames: this.scene.anims.generateFrameNumbers('house', { start: 4, end: 0 }),
        frameRate: 8,
        repeat: 0
      });
    }
  }

  setupInteraction(player: Phaser.GameObjects.Sprite) {
    this.player = player;
    
    // Зона взаимодействия перед дверью (внизу дома)
    this.interactionZone = this.scene.add.zone(
      this.x,
      this.y - 20,  // Чуть выше нижней точки дома
      50,           // Ширина зоны
      30            // Высота зоны
    );
    
    this.scene.physics.add.existing(this.interactionZone, true);
    
    // Overlap с игроком
    this.scene.physics.add.overlap(
      player,
      this.interactionZone,
      () => this.onPlayerEnter(),
      undefined,
      this
    );
  }

  private onPlayerEnter() {
    this.isPlayerNear = true;
  }

  update() {
    if (!this.player) return;
    
    // Проверяем дистанцию вручную (overlap не даёт событие выхода)
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.x,
      this.y - 20
    );
    
    this.isPlayerNear = distance < 40;
    
    // Показываем/скрываем подсказку
    this.updatePrompt();
    
    // Проверяем нажатие E
    if (this.isPlayerNear && Phaser.Input.Keyboard.JustDown(this.eKey) && !this.isAnimating) {
        this.enterHouse();
    }
  }

  private updatePrompt() {
    if (this.isPlayerNear && !this.promptText) {
      this.promptText = this.scene.add.text(
        this.x,
        this.y - 120,
        'Войти[E]',
        {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '6px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 1,
          letterSpacing: 1.5,
        }
      );
      this.promptText.setOrigin(0.5);
      this.promptText.setDepth(1000);
      this.promptText.setResolution(3);
    } else if (!this.isPlayerNear && this.promptText) {
      this.promptText.destroy();
      this.promptText = null;
    }
  }

    private enterHouse() {
        if (!this.player || this.isAnimating) return;
        
        this.isAnimating = true;
        this.player.setData('controlsEnabled', false);
        
        const speed = 60; // Как в Player.ts
        
        // Точка перед дверью
        const targetX = this.doorX - 5;
        const targetY = this.doorY + 35;
        
        // 1. Идём к двери спиной к камере
        this.walkTo(targetX, targetY, speed, () => {
            
            // 2. Открываем дверь
            this.play('house_door_open');
            this.once('animationcomplete', () => {
            this.isDoorOpen = true;
            
            // 3. Заходим в дом
            const enterY = this.doorY + 15;
            this.walkTo(targetX, enterY, speed, () => {
                
                // 4. Fade out и переход
                
                this.scene.cameras.main.fadeOut(300, 0, 0, 0);
                this.scene.cameras.main.once('camerafadeoutcomplete', () => {
                  this.scene.scene.start('HouseInteriorScene');
                  // this.scene.scene.start('VillageScene');
                });
            }, 'up');
            });
        }, 'up');
        }

    private walkTo(
        targetX: number, 
        targetY: number, 
        speed: number, 
        onComplete: () => void,
        forceDirection?: string
        ) {
        const player = this.player!;
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 2) {
            onComplete();
            return;
        }
        
        const duration = (distance / speed) * 1000;
        
        // Определяем направление
        let direction = forceDirection;
        if (!direction) {
            if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? 'right' : 'left';
            } else {
            direction = dy > 0 ? 'down' : 'up';
            }
        }
        
        // Flip для left
        if (direction === 'left') {
            player.setFlipX(true);
        } else if (direction === 'right') {
            player.setFlipX(false);
        }
        
        // Анимация — left использует right с flipX
        const animDirection = direction === 'left' ? 'right' : direction;
        player.anims.play(`player-walk-${animDirection}`, true);
        
        this.scene.tweens.add({
            targets: player,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
            // Idle в том же направлении
            player.anims.play(`player-idle-${animDirection}`, true);
            onComplete();
            }
        });
        }
    
    

  private toggleDoor() {
    // Теперь только для ручного открытия/закрытия без входа
    this.isAnimating = true;
    
    if (this.isDoorOpen) {
        this.play('house_door_close');
        this.once('animationcomplete', () => {
        this.isDoorOpen = false;
        this.isAnimating = false;
        });
    } else {
        this.play('house_door_open');
        this.once('animationcomplete', () => {
        this.isDoorOpen = true;
        this.isAnimating = false;
        });
    }
  }

  // Принудительное открытие/закрытие
  openDoor() {
    if (!this.isDoorOpen && !this.isAnimating) {
      this.toggleDoor();
    }
  }

  closeDoor() {
    if (this.isDoorOpen && !this.isAnimating) {
      this.toggleDoor();
    }
  }

  isDoorOpened(): boolean {
    return this.isDoorOpen;
  }

  destroy(fromScene?: boolean) {
    if (this.promptText) {
      this.promptText.destroy();
    }
    if (this.interactionZone) {
      this.interactionZone.destroy();
    }
    super.destroy(fromScene);
  }
}