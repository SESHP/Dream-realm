import Phaser from 'phaser';
import { Player } from '../entities/Player';

interface Chunk {
  ground: Phaser.Tilemaps.TilemapLayer | null;
  paths: Phaser.Tilemaps.TilemapLayer | null;
  decor: Phaser.Tilemaps.TilemapLayer | null;
  map: Phaser.Tilemaps.Tilemap;
  gridX: number;
  gridY: number;
}

export class VillageScene extends Phaser.Scene {
  private player!: Player;
  private mapData: any;
  private mapWidth: number = 50 * 16;
  private mapHeight: number = 50 * 16;
  
  private chunks: Chunk[] = [];
  private lastPlayerChunkX: number = 0;
  private lastPlayerChunkY: number = 0;

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
  }

  create() {
    this.scene.stop('UIScene');
    this.mapData = this.cache.json.get('village-data');

    // Создаём 9 чанков (3x3) вокруг начальной позиции
    for (let gridY = -1; gridY <= 1; gridY++) {
      for (let gridX = -1; gridX <= 1; gridX++) {
        const chunk = this.createChunk(gridX, gridY);
        this.chunks.push(chunk);
      }
    }

    // Игрок в центре центрального чанка
    const centerX = this.mapWidth / 2;
    const centerY = this.mapHeight / 2;
    
    this.player = new Player(this, centerX, centerY);
    this.player.setDepth(10);

    // Коллизия
    this.setupCollisions();

    // Камера
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(3);
    
    this.player.setCollideWorldBounds(false);
    
    this.lastPlayerChunkX = 0;
    this.lastPlayerChunkY = 0;
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
      decor: this.createLayerFromData(map, 'decor', allTilesets, posX, posY, 2)
    };

    return chunk;
  }

  private setupCollisions() {
    this.chunks.forEach(chunk => {
      if (chunk.decor) {
        
        chunk.decor.setCollisionBetween(302, 320);
        chunk.decor.setCollisionBetween(94, 130);
        chunk.decor.setCollision([216, 217, 232, 233]);
        
        this.physics.add.collider(this.player, chunk.decor);
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
  }

  update() {
    if (this.player) {
      this.player.update();
      this.updateInfiniteWorld();
    }
  }

  private updateInfiniteWorld() {
    // Определяем в каком чанке сейчас игрок
    const playerChunkX = Math.floor(this.player.x / this.mapWidth);
    const playerChunkY = Math.floor(this.player.y / this.mapHeight);

    // Если игрок перешёл в другой чанк — перемещаем чанки
    if (playerChunkX !== this.lastPlayerChunkX || playerChunkY !== this.lastPlayerChunkY) {
      const deltaX = playerChunkX - this.lastPlayerChunkX;
      const deltaY = playerChunkY - this.lastPlayerChunkY;

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