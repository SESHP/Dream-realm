import Phaser from 'phaser';

interface ResourceData {
  type: string;
  amount: number;
}

interface MenuData {
  type: string;
}

export class UIScene extends Phaser.Scene {
  private resources: Record<string, number> = {
    'memory-shard': 0,
    'echo-joy': 0,
    'frozen-fear': 0,
    'tears-oblivion': 0,
    'pure-longing': 0
  };
  
  private resourceTexts: Record<string, Phaser.GameObjects.Text> = {};
  private menuContainer: Phaser.GameObjects.Container | null = null;
  private isMenuOpen: boolean = false;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Панель ресурсов (верхний левый угол)
    this.createResourcePanel();
    
    // Слушаем события от других сцен
    this.events.on('resourceGathered', this.onResourceGathered, this);
    this.events.on('openMenu', this.openMenu, this);
    
    // Клавиша закрытия меню
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.isMenuOpen) {
          this.closeMenu();
        }
      });
    }
  }

  private createResourcePanel() {
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.7);
    panel.fillRoundedRect(10, 10, 200, 140, 8);
    
    const resourceNames: Record<string, {name: string, color: string}> = {
      'memory-shard': { name: 'Осколки памяти', color: '#8b5cf6' },
      'echo-joy': { name: 'Эхо радости', color: '#fbbf24' },
      'frozen-fear': { name: 'Застывший страх', color: '#3b82f6' },
      'tears-oblivion': { name: 'Слёзы забвения', color: '#94a3b8' },
      'pure-longing': { name: 'Чистая тоска', color: '#06b6d4' }
    };
    
    let y = 20;
    Object.entries(resourceNames).forEach(([key, config]) => {
      // Цветной индикатор
      const indicator = this.add.graphics();
      indicator.fillStyle(parseInt(config.color.replace('#', '0x')), 1);
      indicator.fillCircle(25, y + 8, 6);
      
      // Название и количество
      this.add.text(40, y, config.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff'
      });
      
      this.resourceTexts[key] = this.add.text(180, y, '0', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: config.color
      }).setOrigin(1, 0);
      
      y += 24;
    });
  }

  private onResourceGathered(data: ResourceData) {
    if (this.resources[data.type] !== undefined) {
      this.resources[data.type] += data.amount;
      this.updateResourceDisplay(data.type);
      
      // Анимация обновления
      const text = this.resourceTexts[data.type];
      if (text) {
        this.tweens.add({
          targets: text,
          scale: 1.3,
          duration: 100,
          yoyo: true
        });
      }
    }
  }

  private updateResourceDisplay(type: string) {
    if (this.resourceTexts[type]) {
      this.resourceTexts[type].setText(this.resources[type].toString());
    }
  }

  private openMenu(data: MenuData) {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
    
    this.isMenuOpen = true;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Затемнение фона
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, width, height);
    
    // Контейнер меню
    this.menuContainer = this.add.container(width / 2, height / 2);
    this.menuContainer.add(overlay);
    overlay.setPosition(-width / 2, -height / 2);
    
    // Панель меню
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(-200, -150, 400, 300, 16);
    panel.lineStyle(2, 0x8b5cf6, 1);
    panel.strokeRoundedRect(-200, -150, 400, 300, 16);
    this.menuContainer.add(panel);
    
    // Заголовок в зависимости от типа меню
    const titles: Record<string, string> = {
      'memory-altar': 'АЛТАРЬ ПАМЯТИ',
      'upgrade-altar': 'АЛТАРЬ УСИЛЕНИЯ',
      'workshop': 'МАСТЕРСКАЯ'
    };
    
    const title = this.add.text(0, -120, titles[data.type] || 'МЕНЮ', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#8b5cf6'
    }).setOrigin(0.5);
    this.menuContainer.add(title);
    
    // Контент меню
    switch (data.type) {
      case 'memory-altar':
        this.createMemoryAltarContent();
        break;
      case 'upgrade-altar':
        this.createUpgradeAltarContent();
        break;
      case 'workshop':
        this.createWorkshopContent();
        break;
    }
    
    // Кнопка закрытия
    const closeBtn = this.add.text(170, -130, '✕', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff6b6b'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerdown', () => this.closeMenu());
    
    this.menuContainer.add(closeBtn);
    
    // Подсказка
    const hint = this.add.text(0, 130, 'Нажмите ESC чтобы закрыть', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);
    this.menuContainer.add(hint);
  }

  private createMemoryAltarContent() {
    if (!this.menuContainer) return;
    
    const shards = this.resources['memory-shard'];
    
    // Информация о прогрессе
    const progressText = this.add.text(0, -60, `Собрано осколков: ${shards}`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.menuContainer.add(progressText);
    
    // Доступные воспоминания
    const memories = [
      { name: 'Первый фрагмент', cost: 10, unlocked: shards >= 10 },
      { name: 'Голос из прошлого', cost: 50, unlocked: shards >= 50 },
      { name: 'Лицо в тумане', cost: 100, unlocked: shards >= 100 },
      { name: 'Потерянное имя', cost: 200, unlocked: shards >= 200 }
    ];
    
    let y = -20;
    memories.forEach(memory => {
      const color = memory.unlocked ? '#ffffff' : '#666666';
      const status = memory.unlocked ? '▶ Смотреть' : `🔒 ${memory.cost} осколков`;
      
      const memoryText = this.add.text(-150, y, memory.name, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: color
      });
      
      const statusText = this.add.text(150, y, status, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: memory.unlocked ? '#8b5cf6' : '#666666'
      }).setOrigin(1, 0);
      
      if (memory.unlocked) {
        memoryText.setInteractive({ useHandCursor: true });
        memoryText.on('pointerover', () => memoryText.setColor('#8b5cf6'));
        memoryText.on('pointerout', () => memoryText.setColor('#ffffff'));
        memoryText.on('pointerdown', () => this.playMemory(memory.name));
      }
      
      this.menuContainer!.add(memoryText);
      this.menuContainer!.add(statusText);
      
      y += 30;
    });
  }

  private createUpgradeAltarContent() {
    if (!this.menuContainer) return;
    
    const upgrades = [
      { name: 'Скорость сбора +10%', cost: { 'memory-shard': 20 }, level: 0 },
      { name: 'Размер инвентаря +10', cost: { 'echo-joy': 15 }, level: 0 },
      { name: 'Скорость движения +5%', cost: { 'frozen-fear': 10 }, level: 0 }
    ];
    
    let y = -40;
    upgrades.forEach(upgrade => {
      const text = this.add.text(-150, y, `${upgrade.name} (Ур. ${upgrade.level})`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff'
      });
      
      const costText = Object.entries(upgrade.cost)
        .map(([res, amount]) => `${amount} ${res}`)
        .join(', ');
      
      const buyBtn = this.add.text(150, y, `Улучшить`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#10b981',
        backgroundColor: '#1a1a2e',
        padding: { x: 8, y: 4 }
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
      
      buyBtn.on('pointerover', () => buyBtn.setColor('#34d399'));
      buyBtn.on('pointerout', () => buyBtn.setColor('#10b981'));
      
      this.menuContainer!.add(text);
      this.menuContainer!.add(buyBtn);
      
      y += 40;
    });
  }

  private createWorkshopContent() {
    if (!this.menuContainer) return;
    
    const recipes = [
      { 
        name: 'Мост желаний', 
        description: 'Позволяет пересечь разломы',
        cost: { 'echo-joy': 10, 'memory-shard': 5 }
      },
      { 
        name: 'Ключ забвения', 
        description: 'Открывает запечатанные двери',
        cost: { 'tears-oblivion': 8, 'memory-shard': 10 }
      },
      { 
        name: 'Факел радости', 
        description: 'Освещает тёмные области',
        cost: { 'echo-joy': 5, 'frozen-fear': 5 }
      }
    ];
    
    let y = -50;
    recipes.forEach(recipe => {
      const nameText = this.add.text(-150, y, recipe.name, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ffffff'
      });
      
      const descText = this.add.text(-150, y + 18, recipe.description, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#888888'
      });
      
      const craftBtn = this.add.text(150, y + 8, 'Создать', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#f59e0b',
        backgroundColor: '#1a1a2e',
        padding: { x: 8, y: 4 }
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
      
      craftBtn.on('pointerover', () => craftBtn.setColor('#fbbf24'));
      craftBtn.on('pointerout', () => craftBtn.setColor('#f59e0b'));
      
      this.menuContainer!.add(nameText);
      this.menuContainer!.add(descText);
      this.menuContainer!.add(craftBtn);
      
      y += 55;
    });
  }

  private playMemory(name: string) {
    console.log('Playing memory:', name);
    // TODO: Реализовать систему воспоминаний
    this.closeMenu();
  }

  private closeMenu() {
    if (this.menuContainer) {
      this.menuContainer.destroy();
      this.menuContainer = null;
    }
    this.isMenuOpen = false;
  }

  getResources(): Record<string, number> {
    return { ...this.resources };
  }

  setResources(resources: Record<string, number>) {
    this.resources = { ...resources };
    Object.keys(this.resources).forEach(key => {
      this.updateResourceDisplay(key);
    });
  }
}
