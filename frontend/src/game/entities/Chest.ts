import Phaser from 'phaser';
import { CrystalReward } from '../entities/Crystal';
import { getRandomCrystalAmount, getRandomCrystalType } from '../config/CrystalConfig';

export class Chest extends Phaser.GameObjects.Sprite {
  private isOpen: boolean = false;
  private isDestroyed: boolean = false;
  private promptText!: Phaser.GameObjects.Text;
  private playerInRange: boolean = false;
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private eKey!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'chest', 0);
    
    scene.add.existing(this);
    
    // Origin внизу по центру
    this.setOrigin(0.5, 1);
    
    // Текст подсказки "Открыть [E]"
    this.promptText = scene.add.text(x, y - 28, 'Открыть[E]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1,
      letterSpacing: 1.5,
    });
    this.promptText.setOrigin(0.5, 1);
    this.promptText.setVisible(false);
    this.promptText.setDepth(1000);
    
    // Отключаем сглаживание для чёткого пиксельного текста
    this.promptText.setResolution(3);
    
    // Клавиша E
    if (scene.input.keyboard) {
      this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  // Вызывается из сцены для настройки взаимодействия с игроком
  setupInteraction(player: Phaser.Physics.Arcade.Sprite) {
    this.player = player;
  }

  // Вызывается в update сцены
  update() {
    if (this.isDestroyed || this.isOpen) return;
    
    // Проверяем дистанцию до игрока (от центра сундука)
    if (this.player) {
      // this.y это низ сундука (origin 0.5, 1), центр примерно на 8 пикселей выше
      const chestCenterY = this.y - 8;
      const distance = Phaser.Math.Distance.Between(
        this.x, chestCenterY,
        this.player.x, this.player.y
      );
      this.playerInRange = distance < 28; // радиус взаимодействия
    }
    
    // Показываем/скрываем подсказку
    this.promptText.setVisible(this.playerInRange);
    
    // Проверяем нажатие E
    if (this.playerInRange && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.open();
    }
  }

  open() {
    if (this.isOpen || this.isDestroyed) return;
    
    this.isOpen = true;
    this.promptText.setVisible(false);
    
    // Анимация открытия — переключаем кадры
    this.scene.time.delayedCall(0, () => {
      if (this.isDestroyed) return;
      this.setFrame(1);
    });
    
    this.scene.time.delayedCall(150, () => {
      if (this.isDestroyed) return;
      this.setFrame(2);
    });
    
    this.scene.time.delayedCall(300, () => {
      if (this.isDestroyed) return;
      this.setFrame(3);
      
      // Здесь можно добавить логику выдачи лута
      this.onOpened();
    });
  }

  private async onOpened() {
    const crystalType = getRandomCrystalType();
    const crystalAmount = getRandomCrystalAmount();
    
    new CrystalReward(
      this.scene, 
      this.x, 
      this.y - 20,
      crystalAmount,
      crystalType.key
    );
    
    this.emit('opened', this, {
      type: crystalType.key,
      name: crystalType.name,
      amount: crystalAmount
    });

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('User not authenticated');
        return;
      }

      const response = await fetch('http://localhost:3000/api/inventory/add-crystal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          crystalType: crystalType.key,
          amount: crystalAmount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Crystal saved:', data);
      
    } catch (error) {
      console.error('❌ Failed to save crystal:', error);
    }
    
    console.log(`Chest opened! ${crystalType.name}: +${crystalAmount.toFixed(2)}`);
  }

  isOpened(): boolean {
    return this.isOpen;
  }

  destroy(fromScene?: boolean) {
    this.isDestroyed = true;
    if (this.promptText) {
      this.promptText.destroy();
    }
    super.destroy(fromScene);
  }
}