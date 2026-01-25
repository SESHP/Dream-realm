import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { AnimatedTree } from '../entities/AnimatedTree';
import { Chest } from '../entities/Chest';
import { House } from '../entities/House';
import { CrystalReward } from '../entities/Crystal'; // добавь
import { getRandomCrystalAmount, getRandomCrystalType } from '../config/CrystalConfig'; // добавь



interface Chunk {
  ground: Phaser.Tilemaps.TilemapLayer | null;
  paths: Phaser.Tilemaps.TilemapLayer | null;
  decor: Phaser.Tilemaps.TilemapLayer | null;
  trees: AnimatedTree[];
  chests: Chest[];
  map: Phaser.Tilemaps.Tilemap;
  gridX: number;
  gridY: number;
  house: House | null;
}

// Добавь интерфейс для кристаллов игрока
interface PlayerCrystals {
  [key: string]: number;
}

export class VillageScene extends Phaser.Scene {
  private player!: Player;
  private mapData: any;
  private mapWidth: number = 50 * 16;  // 800
  private mapHeight: number = 50 * 16; // 800
  
  private chunks: Chunk[] = [];
  private lastPlayerChunkX: number = 200;
  private lastPlayerChunkY: number = 200;
  
  private treePositions: { x: number, y: number }[] = [];
  private chestPositions: { x: number, y: number }[] = [];

  private housePosition: { x: number, y: number } | null = null;

  private playerCrystals: PlayerCrystals = {};

  // Начальная позиция чанков — далеко от нуля
  private startChunkX: number = 200;
  private startChunkY: number = 200;

  constructor() {
    super({ key: 'VillageScene' });
  }

  preload() {
    this.load.json('village-data', '/assets/maps/village.json');
    
    this.load.image('grass', '/assets/tilesets/grass.png');
    this.load.image('plains', '/assets/tilesets/plains.png');
    this.load.image('decor_16x16', '/assets/tilesets/decor_16x16.png');
    this.load.image('objects', '/assets/tilesets/objects.png');
    this.load.image('fences', '/assets/tilesets/fences.png');
    
    this.load.image('tree', '/assets/objects/tree.png');
    
    // Спрайтшит сундука — 4 кадра по 16x16
    this.load.spritesheet('chest', '/assets/objects/chest.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    // Спрайтшит дома — 5 кадров по 106x115
    this.load.spritesheet('house', '/assets/objects/house.png', {
      frameWidth: 106,
      frameHeight: 115
    });

    this.load.image('crystallized_desires', '/assets/objects/crystallized_desires.png');
    this.load.image('essence_oblivion', '/assets/objects/essence_oblivion.png');
    this.load.image('moon_dust', '/assets/objects/moon_dust.png');
    this.load.image('nightmare_fragments', '/assets/objects/nightmare_fragments.png');
    this.load.image('pure_fear', '/assets/objects/pure_fear.png');
  }

  create() {
    this.scene.stop('UIScene');
    this.mapData = this.cache.json.get('village-data');
    const data = this.scene.settings.data as { exitingHouse?: boolean } | undefined;
    const isExitingHouse = data?.exitingHouse || false;
    
    // Загружаем позиции объектов
    this.loadTreePositions();
    this.loadChestPositions();
    this.loadHousePosition();

    // Игрок в центре центрального чанка
    const centerX = this.startChunkX * this.mapWidth + this.housePosition.x - 5;
    const centerY = this.startChunkY * this.mapHeight + this.housePosition.y + 20;
    
    this.player = new Player(this, centerX, centerY);
    this.player.setDepth(10);

    if (isExitingHouse && this.housePosition) {
      // Ставим игрока перед дверью дома
      const houseX = this.startChunkX * this.mapWidth + this.housePosition.x;
      const houseY = this.startChunkY * this.mapHeight + this.housePosition.y;
      
      this.player.setPosition(houseX - 5, houseY + 20);
      this.player.anims.play('player-idle-down', true);
      this.player.setData('controlsEnabled', true);
      
      this.cameras.main.fadeIn(300, 0, 0, 0);
    }

    // Создаём 9 чанков (3x3) вокруг позиции (200, 200)
    for (let gridY = this.startChunkY - 1; gridY <= this.startChunkY + 1; gridY++) {
      for (let gridX = this.startChunkX - 1; gridX <= this.startChunkX + 1; gridX++) {
        const chunk = this.createChunk(gridX, gridY);
        this.chunks.push(chunk);
      }
    }


    // Коллизия
    this.setupCollisions();

    // Камера
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(3);
    
    this.player.setCollideWorldBounds(false);
    
    this.lastPlayerChunkX = this.startChunkX;
    this.lastPlayerChunkY = this.startChunkY;
  }

  private loadTreePositions() {
    const treesLayer = this.mapData.layers.find((l: any) => l.name === 'trees');
    if (!treesLayer || !treesLayer.objects) return;
    
    treesLayer.objects.forEach((obj: any) => {
      if (obj.x !== undefined && obj.y !== undefined && !obj.gid) {
        this.treePositions.push({ x: obj.x, y: obj.y });
      }
    });
  }

  private loadChestPositions() {
    const chestsLayer = this.mapData.layers.find((l: any) => l.name === 'chests');
    if (!chestsLayer || !chestsLayer.objects) return;
    
    chestsLayer.objects.forEach((obj: any) => {
      if (obj.x !== undefined && obj.y !== undefined && !obj.gid) {
        this.chestPositions.push({ x: obj.x, y: obj.y });
      }
    });
  }
  private loadHousePosition() {
    const houseLayer = this.mapData.layers.find((l: any) => l.name === 'player_house');
    
    if (houseLayer && houseLayer.objects && houseLayer.objects.length > 0) {
      const houseObj = houseLayer.objects[0];
      this.housePosition = { x: houseObj.x, y: houseObj.y };
    }
  }

  private createChunk(gridX: number, gridY: number): Chunk {
    const map = this.make.tilemap({ 
      tileWidth: 16, 
      tileHeight: 16, 
      width: 50, 
      height: 50 
    });

    const grassTiles = map.addTilesetImage('grass', 'grass', 16, 16, 0, 0, 1);
    const plainsTiles = map.addTilesetImage('plains', 'plains', 16, 16, 0, 0, 2);
    const decorTiles = map.addTilesetImage('decor_16x16', 'decor_16x16', 16, 16, 0, 0, 74);
    const objectsTiles = map.addTilesetImage('objects', 'objects', 16, 16, 0, 0, 94);
    const fencesTiles = map.addTilesetImage('fences', 'fences', 16, 16, 0, 0, 302);

    const allTilesets = [grassTiles, plainsTiles, decorTiles, objectsTiles, fencesTiles].filter(Boolean) as Phaser.Tilemaps.Tileset[];

    const posX = gridX * this.mapWidth;
    const posY = gridY * this.mapHeight;

    const chunk: Chunk = {
      map,
      gridX,
      gridY,
      ground: this.createLayerFromData(map, 'ground', allTilesets, posX, posY, 0),
      paths: this.createLayerFromData(map, 'paths', allTilesets, posX, posY, 1),
      decor: this.createLayerFromData(map, 'decor', allTilesets, posX, posY, 2),
      trees: [],
      chests: [],
      house: null,
    };
    
    // Создаём объекты для этого чанка
    this.createTreesForChunk(chunk);
    this.createChestsForChunk(chunk);
    this.createHouseForChunk(chunk);

    return chunk;
  }

  private createTreesForChunk(chunk: Chunk) {
    const offsetX = chunk.gridX * this.mapWidth;
    const offsetY = chunk.gridY * this.mapHeight;
    
    this.treePositions.forEach(pos => {
      const treeX = pos.x + offsetX;
      const treeY = pos.y + offsetY;
      
      const tree = new AnimatedTree(this, treeX, treeY, 'tree');
      tree.setDepth(treeY);
      tree.setCrop(1, 1, 46, 62);  // ← добавь сюда

      
      // Физика для коллизии
      this.physics.add.existing(tree, true);
      const body = tree.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(24, 25);      // шире и выше
      body.setOffset(12, 44);    // центрируем по X, внизу по Y
      
      chunk.trees.push(tree);
    });
  }

  private createChestsForChunk(chunk: Chunk) {
    if (this.chestPositions.length === 0) return;
    
    const offsetX = chunk.gridX * this.mapWidth;
    const offsetY = chunk.gridY * this.mapHeight;
    
    // Рандомное количество сундуков 3-5
    const chestCount = Phaser.Math.Between(3, 5);
    
    // Копируем и перемешиваем позиции
    const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.chestPositions]);
    
    // Берём только нужное количество
    const selectedPositions = shuffledPositions.slice(0, chestCount);
    
    selectedPositions.forEach(pos => {
      const chestX = pos.x + offsetX;
      const chestY = pos.y + offsetY;
      
      const chest = new Chest(this, chestX, chestY);
      chest.setupInteraction(this.player);
      chest.setDepth(chestY);

      chest.on('opened', (chest: Chest, reward: { type: string; name: string; amount: number }) => {
        // Инициализируем если нет
        if (!this.playerCrystals[reward.type]) {
          this.playerCrystals[reward.type] = 0;
        }
        
        // Добавляем кристаллы
        this.playerCrystals[reward.type] += reward.amount;
        
        console.log(`Got ${reward.name}: +${reward.amount.toFixed(2)}`);
        console.log('Total crystals:', this.playerCrystals);
      });
      
      // Физика для коллизии
      this.physics.add.existing(chest, true);
      const body = chest.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(18, 25);      // шире и выше
      body.setOffset(0, 0);    // центрируем по X, внизу по Y
      
      chunk.chests.push(chest);

    });
  }
  private createHouseForChunk(chunk: Chunk) {
    if (!this.housePosition) return;
    
    const offsetX = chunk.gridX * this.mapWidth;
    const offsetY = chunk.gridY * this.mapHeight;
    
    const houseX = this.housePosition.x + offsetX;
    const houseY = this.housePosition.y + offsetY;
    
    const house = new House(this, houseX, houseY);
    house.setupInteraction(this.player);
    house.setDepth(houseY);
    
    this.physics.add.existing(house, true);
    const body = house.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(95, 56);
    body.setOffset(8, 70);
    
    chunk.house = house;
  }

  private setupCollisions() {
    this.chunks.forEach(chunk => {
      if (chunk.decor && chunk.decor.layer) {
        chunk.decor.setCollisionBetween(302, 320);
        chunk.decor.setCollisionBetween(94, 130);
        chunk.decor.setCollision([216, 217, 232, 233]);
        
        this.physics.add.collider(this.player, chunk.decor);
      }
      
      // Коллизия с деревьями
      chunk.trees.forEach(tree => {
        this.physics.add.collider(this.player, tree);
      });
      
      // Коллизия с сундуками
      chunk.chests.forEach(chest => {
        this.physics.add.collider(this.player, chest);
      });

      if (chunk.house) {
        this.physics.add.collider(this.player, chunk.house);
      }
    });
  }

  private createLayerFromData(
    map: Phaser.Tilemaps.Tilemap,
    layerName: string, 
    tilesets: Phaser.Tilemaps.Tileset[], 
    posX: number,
    posY: number,
    depth: number
  ): Phaser.Tilemaps.TilemapLayer | null {
    const layerData = this.mapData.layers.find((l: any) => l.name === layerName);
    if (!layerData) return null;

    const uniqueName = `${layerName}_${Date.now()}_${Math.random()}`;
    const layer = map.createBlankLayer(uniqueName, tilesets, posX, posY);
    if (!layer) return null;

    const data = layerData.data;
    for (let i = 0; i < data.length; i++) {
      const tileId = data[i];
      if (tileId === 0) continue;
      
      const x = i % 50;
      const y = Math.floor(i / 50);
      
      layer.putTileAt(tileId, x, y);
    }

    layer.setDepth(depth);
    return layer;
  }

  private moveChunk(chunk: Chunk, newGridX: number, newGridY: number) {
    // Удаляем старые объекты
    chunk.trees.forEach(tree => tree.destroy());
    chunk.trees = [];
    
    chunk.chests.forEach(chest => chest.destroy());
    chunk.chests = [];

    if (chunk.house) {
      chunk.house.destroy();
      chunk.house = null;
    }
    
    chunk.gridX = newGridX;
    chunk.gridY = newGridY;
    
    const newPosX = newGridX * this.mapWidth;
    const newPosY = newGridY * this.mapHeight;

    if (chunk.ground) {
      chunk.ground.setPosition(newPosX, newPosY);
    }
    if (chunk.paths) {
      chunk.paths.setPosition(newPosX, newPosY);
    }
    if (chunk.decor) {
      chunk.decor.setPosition(newPosX, newPosY);
    }

    
    // Создаём новые объекты
    this.createTreesForChunk(chunk);
    this.createChestsForChunk(chunk);
    this.createHouseForChunk(chunk);

    // Коллизия для новых объектов
    chunk.trees.forEach(tree => {
      this.physics.add.collider(this.player, tree);
    });
    
    chunk.chests.forEach(chest => {
      this.physics.add.collider(this.player, chest);
    });
    if (chunk.house) {
      this.physics.add.collider(this.player, chunk.house);
    }
  }

  update() {
    if (this.player) {
      this.player.update();
      this.updateInfiniteWorld();
      
      // Depth для сортировки с объектами
      this.player.setDepth(this.player.y);
    }
    this.chunks.forEach(chunk => {
      chunk.chests.forEach(chest => {
        chest.update();
        if (chunk.house) {
          chunk.house.update();
        }
      });
    });
  }

  private updateInfiniteWorld() {
    // Определяем в каком чанке сейчас игрок
    const playerChunkX = Math.floor(this.player.x / this.mapWidth);
    const playerChunkY = Math.floor(this.player.y / this.mapHeight);

    // Аварийный телепорт если дошёл до отрицательных чанков
    if (playerChunkX < 0 || playerChunkY < 0) {
      this.player.x = this.startChunkX * this.mapWidth + this.mapWidth / 2;
      this.player.y = this.startChunkY * this.mapHeight + this.mapHeight / 2;
      return;
    }

    // Если игрок перешёл в другой чанк — перемещаем чанки
    if (playerChunkX !== this.lastPlayerChunkX || playerChunkY !== this.lastPlayerChunkY) {

      // Перемещаем чанки которые остались позади
      this.chunks.forEach(chunk => {
        let newGridX = chunk.gridX;
        let newGridY = chunk.gridY;

        // Если чанк слишком далеко слева — перемещаем вправо
        if (chunk.gridX < playerChunkX - 1) {
          newGridX = playerChunkX + 1;
        }
        // Если чанк слишком далеко справа — перемещаем влево
        else if (chunk.gridX > playerChunkX + 1) {
          newGridX = playerChunkX - 1;
        }

        // Если чанк слишком далеко сверху — перемещаем вниз
        if (chunk.gridY < playerChunkY - 1) {
          newGridY = playerChunkY + 1;
        }
        // Если чанк слишком далеко снизу — перемещаем вверх
        else if (chunk.gridY > playerChunkY + 1) {
          newGridY = playerChunkY - 1;
        }

        if (newGridX !== chunk.gridX || newGridY !== chunk.gridY) {
          this.moveChunk(chunk, newGridX, newGridY);
        }
      });

      this.lastPlayerChunkX = playerChunkX;
      this.lastPlayerChunkY = playerChunkY;
    }
  }
}