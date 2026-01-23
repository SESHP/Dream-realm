import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Door } from '../entities/Door';

export class HouseInteriorScene extends Phaser.Scene {
  private player!: Player;
  private doors: Door[] = [];
  private keyE!: Phaser.Input.Keyboard.Key;
  private map!: Phaser.Tilemaps.Tilemap;

  constructor() {
    super({ key: 'HouseInteriorScene' });
  }

  preload() {
    /** TILEMAP & TILESET */
    this.load.image('house_tileset', 'assets/tilesets/house_tileset.png');
    this.load.tilemapTiledJSON('house_map', 'assets/maps/house.json');

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

    /** DOORS из Object Layer */
    const doorObjects = this.map.getObjectLayer('doors')?.objects;
    doorObjects?.forEach(obj => {
      if (obj.x == null || obj.y == null) return;

      const door = new Door(
        this,
        obj.x + (obj.width ?? 16) / 2,
        obj.y + (obj.height ?? 16) / 2,
        this.player // передаем игрока
      );

      // Проверяем body перед добавлением коллайдера
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

    /** CAMERA */
    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.1, 0.1);
    cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    cam.setZoom(5);

    /** DEBUG */
    console.log('Door frames:', this.textures.get('door').getFrameNames());
    console.log('Doors loaded:', this.doors.length);
  }

  update() {
    if (this.player) {
      this.player.update();
      this.player.setDepth(this.player.y);
    }

    this.doors.forEach(door => door.update());

    /** Открытие дверей по E */
    if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
      this.doors.forEach(door => {
        // проверяем overlap игрока и двери по body
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
    }
  }
}
