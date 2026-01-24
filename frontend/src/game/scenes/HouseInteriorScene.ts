import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';

export class HouseInteriorScene extends Phaser.Scene {
  private player!: Player;
  private doors: Door[] = [];
  private keyE!: Phaser.Input.Keyboard.Key;
  private map!: Phaser.Tilemaps.Tilemap;
  private chests: Phaser.Physics.Arcade.Sprite[] = [];
  private chestUI!: Phaser.GameObjects.Container;
  private isChestOpen: boolean = false;
  private currentChest?: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({ key: 'HouseInteriorScene' });
  }

  preload() {
    /** TILEMAP & TILESET */
    this.load.image('house_tileset', 'assets/tilesets/house_tileset.png');
    this.load.tilemapTiledJSON('house_map', 'assets/maps/house.json');

    this.load.spritesheet('chest', 'assets/objects/chest.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.image('ui_panel', 'assets/ui/ui_panel.png');
    this.load.image('ui_slot', 'assets/ui/ui_slot.png');

    /** PLAYER */
    this.load.spritesheet('player', 'assets/characters/player.png', {
      frameWidth: 48,
      frameHeight: 48
    });

    /** DOOR */
    this.load.spritesheet('door', 'assets/objects/door.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    this.textures.get('ui_panel').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('ui_slot').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  init() {
    if (!this.anims.exists('chest_open')) {
      this.anims.create({
        key: 'chest_open',
        frames: this.anims.generateFrameNumbers('chest', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!this.anims.exists('chest_close')) {
      this.anims.create({
        key: 'chest_close',
        frames: this.anims.generateFrameNumbers('chest', { start: 3, end: 0 }),
        frameRate: 10,
        repeat: 0
      });
    }
  }

  create() {
    /** INPUT */
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    /** MAP */
    this.map = this.make.tilemap({ key: 'house_map' });
    const tileset = this.map.addTilesetImage('house_tileset', 'house_tileset');

    if (!tileset) {
      console.error('Tileset not found');
      return;
    }

    /** LAYERS */
    const floor = this.map.createLayer('floor', tileset, 0, 0);
    const walls = this.map.createLayer('walls', tileset, 0, 0);
    const furniture = this.map.createLayer('furniture', tileset, 0, 0);

    walls.setCollisionByExclusion([-1]);
    furniture.setCollisionByExclusion([-1]);

    floor.setDepth(0);
    walls.setDepth(1);
    furniture.setDepth(2);

    /** PLAYER */
    this.player = new Player(this, 14 * 16 + 7, 16 * 12 + 5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.body.setSize(16, 12);
    this.player.body.setOffset(16, 32);

    /** WORLD BOUNDS */
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    /** COLLIDERS */
    this.physics.add.collider(this.player, walls);
    this.physics.add.collider(this.player, furniture);

    /** DOORS */
    const doorObjects = this.map.getObjectLayer('doors')?.objects;
    doorObjects?.forEach(obj => {
      if (obj.x == null || obj.y == null) return;

      const door = new Door(
        this,
        obj.x + (obj.width ?? 16) / 2,
        obj.y + (obj.height ?? 16) / 2,
        this.player
      );

      if (door.body instanceof Phaser.Physics.Arcade.Body) {
        this.physics.add.collider(this.player, door);
      }

      if (obj.name === 'exitDoor') {
        door.setExitCallback(() => {
          const cam = this.cameras.main;
          cam.fadeOut(400, 0, 0, 0);
          cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('VillageScene');
          });
        });
      }

      this.doors.push(door);
    });

    /** CHESTS */
    const chestObjects = this.map.getObjectLayer('chest')?.objects;
    const chests: Phaser.Physics.Arcade.Sprite[] = [];
    
    chestObjects?.forEach(obj => {
      if (obj.x == null || obj.y == null) return;

      const chest = this.physics.add.sprite(obj.x, obj.y, 'chest', 0);
      chest.setOrigin(0, 1);
      chest.setDepth(5);
      
      if (chest.body instanceof Phaser.Physics.Arcade.Body) {
        chest.body.setImmovable(true);
        chest.body.setSize(16, 16);
      }
      this.physics.add.collider(this.player, chest);

      const hint = this.add.text(obj.x + 8, obj.y - 20, 'Открыть[E]', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '3px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
        letterSpacing: 1.5,
      });
      hint.setOrigin(0.5);
      hint.setDepth(100);
      hint.setVisible(false);
      hint.setResolution(5);

      chests.push(chest);
      (chest as any).hint = hint;
    });

    this.chests = chests;

    this.chestUI = this.add.container(0, 0);
    this.chestUI.setVisible(false);
    this.chestUI.setDepth(1000);

    /** CAMERA */
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.1, 0.1);
    cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    cam.setZoom(5);

    this.textures.get('ui_panel').setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get('ui_slot').setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  update() {
    if (this.player) {
      this.player.update();
      this.player.setDepth(this.player.y);
    }

    this.doors.forEach(door => door.update());

    /** Показ подсказок у сундуков */
    this.chests.forEach(chest => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        chest.x,
        chest.y
      );
      
      (chest as any).hint.setVisible(distance < 24);
    });

    /** Взаимодействие по E */
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      // Закрытие UI сундука
      if (this.isChestOpen) {
        this.closeChestUI();
        return;
      }

      // Двери
      this.doors.forEach(door => {
        if (
          this.player.body && 
          door.body && 
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.player.getBounds(),
            door.getBounds()
          )
        ) {
          door.open();
        }
      });

      // Сундуки
      this.chests.forEach(chest => {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          chest.x,
          chest.y
        );

        if (distance < 24 && chest.anims.currentFrame?.index !== 3) {
          console.log('Playing chest animation');
          chest.play('chest_open');
          
          chest.once('animationcomplete', () => {
            console.log('Animation complete, opening UI');
            this.openChestUI(chest);
          });
        }
      });
    }
  }

  private openChestUI(chest: Phaser.Physics.Arcade.Sprite) {
    this.currentChest = chest;
    
    const cam = this.cameras.main;
    const centerX = cam.worldView.centerX;
    const centerY = cam.worldView.centerY;

    // Затемнение
    const overlay = this.add.rectangle(centerX, centerY, cam.worldView.width, cam.worldView.height, 0x000000, 0.7);
    
    // Главная панель
    const panel = this.add.image(centerX, centerY, 'ui_panel');
    panel.setScale(0.5);
    
    // Заголовок сундука
    const title = this.add.text(centerX, centerY - 48, 'Сундук', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
      letterSpacing: 1.3
    });
    title.setOrigin(0.5);
    title.setResolution(5);

    // Слоты сундука (9x3)
    const chestSlots = this.createSlotGrid(centerX, centerY - 17, 10, 2);

    // Заголовок инвентаря
    const invTitle = this.add.text(centerX, centerY + 10, 'Инвентарь', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
      letterSpacing: 1.3
    });
    invTitle.setOrigin(0.5);
    invTitle.setResolution(5);

    // Слоты инвентаря (9x4)
    const invSlots = this.createSlotGrid(centerX, centerY + 40, 8, 2);

    // Кнопка закрытия
    const closeBtn = this.add.text(centerX, centerY + 65, 'Закрыть[E]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '3px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 1,
      letterSpacing: 1.3
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setResolution(5);

    this.chestUI.add([overlay, panel, title, ...chestSlots, invTitle, ...invSlots, closeBtn]);
    this.chestUI.setVisible(true);
    this.isChestOpen = true;
  }

  private createSlotGrid(centerX: number, centerY: number, cols: number, rows: number): Phaser.GameObjects.Image[] {
    const slots: Phaser.GameObjects.Image[] = [];
    const slotSize = 23;
    const spacing = 0.5;
    
    const gridWidth = cols * (slotSize + spacing) - spacing;
    const gridHeight = rows * (slotSize + spacing) - spacing;
    const startX = centerX - gridWidth / 2;
    const startY = centerY - gridHeight / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (slotSize + spacing) + slotSize / 2;
        const y = startY + row * (slotSize + spacing) + slotSize / 2;
        
        const slot = this.add.image(x, y, 'ui_slot');
        slot.setScale(0.5);
        slot.setOrigin(0.5);
        
        slots.push(slot);
      }
    }
    
    return slots;
  }

  private closeChestUI() {
    this.chestUI.removeAll(true);
    this.chestUI.setVisible(false);
    this.isChestOpen = false;
    if (this.currentChest) {
      this.currentChest.play('chest_close');
      this.currentChest = undefined;
    }
  }
}