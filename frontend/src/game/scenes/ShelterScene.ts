import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class ShelterScene extends Phaser.Scene {
  private player!: Player;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: Phaser.GameObjects.Sprite[] = [];
  private currentInteractable: Phaser.GameObjects.Sprite | null = null;
  private interactPrompt!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ShelterScene' });
  }

  create() {
    this.scene.stop('UIScene');
    
    // Фон (временно - градиент)
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Создаём простую карту пока нет тайлмапа
    this.createTemporaryMap();
    
    // Создаём игрока в центре
    this.player = new Player(this, 400, 300);
    
    // Создаём интерактивные объекты
    this.createInteractables();
    
    // Настройка камеры
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    
    // Клавиша взаимодействия
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    
    // Подсказка взаимодействия
    this.interactPrompt = this.add.text(0, 0, '[E] Взаимодействовать', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);
    
    // Запускаем UI сцену
    this.scene.launch('UIScene');
    
    // Порталы в миры
    this.createPortals();
    
    // Текст локации
    this.add.text(400, 50, 'УБЕЖИЩЕ', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#8b5cf6'
    }).setOrigin(0.5).setScrollFactor(0);
  }

  private createTemporaryMap() {
    // Временный пол из графики (пока нет тайлмапа)
    const graphics = this.add.graphics();
    
    // Пол убежища
    graphics.fillStyle(0x2d2d44, 1);
    graphics.fillRect(100, 100, 600, 400);
    
    // Границы
    graphics.lineStyle(2, 0x8b5cf6, 0.5);
    graphics.strokeRect(100, 100, 600, 400);
    
    // Декоративные элементы
    graphics.fillStyle(0x3d3d5c, 1);
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i + j) % 2 === 0) {
          graphics.fillRect(120 + i * 120, 120 + j * 100, 100, 80);
        }
      }
    }
  }

  private createInteractables() {
    // Алтарь Памяти (просмотр воспоминаний)
    const altarMemory = this.add.sprite(200, 200, 'altar-memory')
      .setInteractive()
      .setData('type', 'altar-memory')
      .setData('name', 'Алтарь Памяти');
    
    // Временная графика для алтаря
    const g1 = this.add.graphics();
    g1.fillStyle(0x8b5cf6, 1);
    g1.fillCircle(200, 200, 20);
    g1.fillStyle(0xffffff, 0.3);
    g1.fillCircle(200, 195, 8);
    altarMemory.setPosition(200, 200);
    
    // Алтарь Усиления (прокачка)
    const altarUpgrade = this.add.sprite(400, 180, 'altar-upgrade')
      .setInteractive()
      .setData('type', 'altar-upgrade')
      .setData('name', 'Алтарь Усиления');
    
    const g2 = this.add.graphics();
    g2.fillStyle(0xf59e0b, 1);
    g2.fillCircle(400, 180, 20);
    g2.fillStyle(0xffffff, 0.3);
    g2.fillCircle(400, 175, 8);
    
    // Мастерская (крафт)
    const workshop = this.add.sprite(600, 200, 'workshop')
      .setInteractive()
      .setData('type', 'workshop')
      .setData('name', 'Мастерская');
    
    const g3 = this.add.graphics();
    g3.fillStyle(0x10b981, 1);
    g3.fillCircle(600, 200, 20);
    g3.fillStyle(0xffffff, 0.3);
    g3.fillCircle(600, 195, 8);
    
    this.interactables = [altarMemory, altarUpgrade, workshop];
  }

  private createPortals() {
    // Портал в Осколочные пустоши
    const portal1 = this.add.sprite(400, 450, 'portal')
      .setInteractive()
      .setData('type', 'portal')
      .setData('destination', 'shattered-wastes')
      .setData('name', 'Осколочные пустоши');
    
    const gPortal = this.add.graphics();
    gPortal.fillStyle(0x6366f1, 0.8);
    gPortal.fillEllipse(400, 450, 60, 30);
    
    // Анимация портала
    this.tweens.add({
      targets: gPortal,
      alpha: 0.4,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    this.interactables.push(portal1);
  }

  update() {
    console.log('Camera:', this.cameras.main.scrollX.toFixed(1), this.cameras.main.scrollY.toFixed(1));

    this.player.update();
    
    // Проверяем близость к интерактивным объектам
    this.currentInteractable = null;
    
    for (const obj of this.interactables) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        obj.x, obj.y
      );
      
      if (distance < 50) {
        this.currentInteractable = obj;
        this.interactPrompt.setPosition(obj.x, obj.y - 40);
        this.interactPrompt.setText(`[E] ${obj.getData('name')}`);
        this.interactPrompt.setVisible(true);
        break;
      }
    }
    
    if (!this.currentInteractable) {
      this.interactPrompt.setVisible(false);
    }
    
    // Обработка взаимодействия
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.currentInteractable) {
      this.handleInteraction(this.currentInteractable);
    }
  }

  private handleInteraction(obj: Phaser.GameObjects.Sprite) {
    const type = obj.getData('type');
    
    switch (type) {
      case 'altar-memory':
        this.openMemoryAltar();
        break;
      case 'altar-upgrade':
        this.openUpgradeAltar();
        break;
      case 'workshop':
        this.openWorkshop();
        break;
      case 'portal':
        this.enterPortal(obj.getData('destination'));
        break;
    }
  }

  private openMemoryAltar() {
    // Отправляем событие в UI сцену
    this.events.emit('openMenu', { type: 'memory-altar' });
    this.scene.get('UIScene').events.emit('openMenu', { type: 'memory-altar' });
  }

  private openUpgradeAltar() {
    this.scene.get('UIScene').events.emit('openMenu', { type: 'upgrade-altar' });
  }

  private openWorkshop() {
    this.scene.get('UIScene').events.emit('openMenu', { type: 'workshop' });
  }

  private enterPortal(destination: string) {
    // Эффект перехода
    this.cameras.main.fadeOut(500, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('WorldScene', { world: destination });
    });
  }
}
