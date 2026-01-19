import Phaser from 'phaser';
import { Player } from '../entities/Player';

interface WorldData {
  world: string;
}

interface Resource extends Phaser.GameObjects.Sprite {
  resourceType: string;
  amount: number;
  gatherTime: number;
  isDepleted: boolean;
}

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private resources: Resource[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private currentResource: Resource | null = null;
  private gatherProgress: Phaser.GameObjects.Graphics | null = null;
  private isGathering: boolean = false;
  private gatherTimer: number = 0;
  private worldName: string = '';
  private returnPortal!: Phaser.GameObjects.Sprite;
  private interactPrompt!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data: WorldData) {
    this.worldName = data.world || 'shattered-wastes';
  }

  create() {
    // Настройка мира в зависимости от типа
    this.setupWorld();
    
    // Создаём игрока
    this.player = new Player(this, 400, 500);
    
    // Создаём ресурсы
    this.createResources();
    
    // Создаём портал возврата
    this.createReturnPortal();
    
    // Камера
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);
    this.cameras.main.fadeIn(500);
    
    // Управление
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    
    // Подсказка
    this.interactPrompt = this.add.text(0, 0, '', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);
    
    // Прогресс-бар сбора
    this.gatherProgress = this.add.graphics().setDepth(100);
    
    // Запускаем UI
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }
    
    // Название мира
    const worldTitles: Record<string, string> = {
      'shattered-wastes': 'ОСКОЛОЧНЫЕ ПУСТОШИ',
      'frozen-city': 'ЗАСТЫВШИЙ ГОРОД',
      'mirror-labyrinth': 'ЗЕРКАЛЬНЫЙ ЛАБИРИНТ',
      'drowning-library': 'ТОНУЩАЯ БИБЛИОТЕКА'
    };
    
    this.add.text(400, 50, worldTitles[this.worldName] || this.worldName.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#6366f1'
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private setupWorld() {
    // Разные цвета фона для разных миров
    const worldColors: Record<string, number> = {
      'shattered-wastes': 0x1e1b4b,
      'frozen-city': 0x1e3a5f,
      'mirror-labyrinth': 0x2d1b4e,
      'drowning-library': 0x134e4a
    };
    
    this.cameras.main.setBackgroundColor(worldColors[this.worldName] || 0x1a1a2e);
    
    // Временная карта
    const graphics = this.add.graphics();
    
    // Основная область
    graphics.fillStyle(0x2d2d44, 0.5);
    graphics.fillRect(0, 0, 1200, 800);
    
    // Парящие острова (для Осколочных пустошей)
    if (this.worldName === 'shattered-wastes') {
      this.createFloatingIslands(graphics);
    }
  }

  private createFloatingIslands(graphics: Phaser.GameObjects.Graphics) {
    const islands = [
      { x: 200, y: 200, w: 150, h: 100 },
      { x: 500, y: 150, w: 200, h: 120 },
      { x: 800, y: 250, w: 180, h: 90 },
      { x: 300, y: 400, w: 250, h: 150 },
      { x: 700, y: 450, w: 200, h: 130 },
      { x: 400, y: 550, w: 300, h: 100 }
    ];
    
    islands.forEach(island => {
      // Тень
      graphics.fillStyle(0x000000, 0.3);
      graphics.fillEllipse(island.x + 10, island.y + island.h + 20, island.w, 30);
      
      // Остров
      graphics.fillStyle(0x3d3d5c, 1);
      graphics.fillRoundedRect(island.x - island.w/2, island.y, island.w, island.h, 16);
      
      // Верхняя поверхность
      graphics.fillStyle(0x4a4a6a, 1);
      graphics.fillRoundedRect(island.x - island.w/2 + 5, island.y + 5, island.w - 10, 20, 8);
    });
  }

  private createResources() {
    // Типы ресурсов для каждого мира
    const worldResources: Record<string, Array<{type: string, color: number, amount: number, time: number}>> = {
      'shattered-wastes': [
        { type: 'memory-shard', color: 0x8b5cf6, amount: 5, time: 3000 },
        { type: 'echo-joy', color: 0xfbbf24, amount: 3, time: 4000 }
      ],
      'frozen-city': [
        { type: 'memory-shard', color: 0x8b5cf6, amount: 5, time: 3000 },
        { type: 'frozen-fear', color: 0x3b82f6, amount: 2, time: 5000 }
      ],
      'mirror-labyrinth': [
        { type: 'tears-oblivion', color: 0x94a3b8, amount: 3, time: 4000 },
        { type: 'memory-shard', color: 0x8b5cf6, amount: 4, time: 3000 }
      ],
      'drowning-library': [
        { type: 'pure-longing', color: 0x06b6d4, amount: 2, time: 6000 },
        { type: 'tears-oblivion', color: 0x94a3b8, amount: 3, time: 4000 }
      ]
    };
    
    const resourceTypes = worldResources[this.worldName] || worldResources['shattered-wastes'];
    
    // Случайные позиции для ресурсов
    const positions = [
      { x: 200, y: 220 },
      { x: 350, y: 180 },
      { x: 550, y: 200 },
      { x: 750, y: 280 },
      { x: 250, y: 420 },
      { x: 450, y: 380 },
      { x: 650, y: 450 },
      { x: 350, y: 550 },
      { x: 550, y: 520 }
    ];
    
    positions.forEach((pos, index) => {
      const resType = resourceTypes[index % resourceTypes.length];
      this.createResource(pos.x, pos.y, resType);
    });
  }

  private createResource(x: number, y: number, config: {type: string, color: number, amount: number, time: number}) {
    // Создаём визуал ресурса
    const graphics = this.add.graphics();
    
    // Свечение
    graphics.fillStyle(config.color, 0.3);
    graphics.fillCircle(x, y, 20);
    
    // Основной кристалл
    graphics.fillStyle(config.color, 1);
    graphics.fillCircle(x, y, 12);
    
    // Блик
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(x - 4, y - 4, 4);
    
    // Создаём спрайт для интерактивности
    const resource = this.add.sprite(x, y, 'resources') as Resource;
    resource.setInteractive();
    resource.resourceType = config.type;
    resource.amount = config.amount;
    resource.gatherTime = config.time;
    resource.isDepleted = false;
    resource.setAlpha(0.01); // Почти невидимый, но интерактивный
    
    // Сохраняем ссылку на графику
    resource.setData('graphics', graphics);
    
    // Анимация парения
    this.tweens.add({
      targets: graphics,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.resources.push(resource);
  }

  private createReturnPortal() {
    const graphics = this.add.graphics();
    
    // Портал возврата внизу карты
    graphics.fillStyle(0x8b5cf6, 0.8);
    graphics.fillEllipse(400, 700, 80, 40);
    
    this.returnPortal = this.add.sprite(400, 700, 'portal')
      .setInteractive()
      .setData('type', 'return-portal')
      .setAlpha(0.01);
    
    // Анимация
    this.tweens.add({
      targets: graphics,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Текст
    this.add.text(400, 730, 'Вернуться в Убежище', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#8b5cf6'
    }).setOrigin(0.5);
  }

  update(time: number, delta: number) {
    this.player.update();
    
    // Проверяем сбор ресурсов
    if (this.isGathering && this.currentResource) {
      this.gatherTimer += delta;
      this.updateGatherProgress();
      
      if (this.gatherTimer >= this.currentResource.gatherTime) {
        this.finishGathering();
      }
      return;
    }
    
    // Проверяем близость к ресурсам
    this.currentResource = null;
    
    for (const resource of this.resources) {
      if (resource.isDepleted) continue;
      
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        resource.x, resource.y
      );
      
      if (distance < 40) {
        this.currentResource = resource;
        const resourceNames: Record<string, string> = {
          'memory-shard': 'Осколок памяти',
          'echo-joy': 'Эхо радости',
          'frozen-fear': 'Застывший страх',
          'tears-oblivion': 'Слёзы забвения',
          'pure-longing': 'Чистая тоска'
        };
        this.interactPrompt.setPosition(resource.x, resource.y - 30);
        this.interactPrompt.setText(`[E] ${resourceNames[resource.resourceType] || resource.resourceType}`);
        this.interactPrompt.setVisible(true);
        break;
      }
    }
    
    // Проверяем портал возврата
    const portalDistance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.returnPortal.x, this.returnPortal.y
    );
    
    if (portalDistance < 50) {
      this.interactPrompt.setPosition(this.returnPortal.x, this.returnPortal.y - 40);
      this.interactPrompt.setText('[E] Вернуться');
      this.interactPrompt.setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.returnToShelter();
        return;
      }
    } else if (!this.currentResource) {
      this.interactPrompt.setVisible(false);
    }
    
    // Начать сбор
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.currentResource) {
      this.startGathering();
    }
  }

  private startGathering() {
    if (!this.currentResource) return;
    
    this.isGathering = true;
    this.gatherTimer = 0;
    this.player.startGathering();
    this.interactPrompt.setVisible(false);
  }

  private updateGatherProgress() {
    if (!this.gatherProgress || !this.currentResource) return;
    
    const progress = this.gatherTimer / this.currentResource.gatherTime;
    const width = 40;
    const height = 6;
    const x = this.currentResource.x - width / 2;
    const y = this.currentResource.y - 35;
    
    this.gatherProgress.clear();
    
    // Фон
    this.gatherProgress.fillStyle(0x000000, 0.7);
    this.gatherProgress.fillRect(x, y, width, height);
    
    // Прогресс
    this.gatherProgress.fillStyle(0x8b5cf6, 1);
    this.gatherProgress.fillRect(x, y, width * progress, height);
  }

  private finishGathering() {
    if (!this.currentResource) return;
    
    const resource = this.currentResource;
    
    // Эффект сбора
    this.createGatherEffect(resource.x, resource.y);
    
    // Скрываем ресурс
    resource.isDepleted = true;
    const graphics = resource.getData('graphics') as Phaser.GameObjects.Graphics;
    if (graphics) {
      this.tweens.add({
        targets: graphics,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => {
          graphics.destroy();
        }
      });
    }
    
    // Отправляем событие в UI
    this.scene.get('UIScene').events.emit('resourceGathered', {
      type: resource.resourceType,
      amount: resource.amount
    });
    
    // Показываем +amount
    const floatText = this.add.text(resource.x, resource.y - 20, `+${resource.amount}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#8b5cf6',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: floatText,
      y: resource.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => floatText.destroy()
    });
    
    // Сброс
    this.isGathering = false;
    this.gatherTimer = 0;
    this.gatherProgress?.clear();
    this.player.stopGathering();
    this.currentResource = null;
  }

  private createGatherEffect(x: number, y: number) {
    // Партиклы
    for (let i = 0; i < 8; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x8b5cf6, 1);
      particle.fillCircle(0, 0, 3);
      particle.setPosition(x, y);
      
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  private returnToShelter() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ShelterScene');
    });
  }
}
