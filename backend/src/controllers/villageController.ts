import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../types';

// Конфиг зданий
const buildingConfig: Record<string, {
  name: string;
  baseCost: Record<string, number>;
  baseProduction?: Record<string, number>;
  buildTime: number; // секунды
}> = {
  nexus: {
    name: 'Nexus сознания',
    baseCost: { moonDust: 0 },
    buildTime: 0
  },
  nightmare_trap: {
    name: 'Ловушка кошмаров',
    baseCost: { moonDust: 50, crystallizedDesires: 20 },
    baseProduction: { nightmareFragments: 5 },
    buildTime: 60
  },
  wish_crystallizer: {
    name: 'Кристаллизатор желаний',
    baseCost: { moonDust: 40, nightmareFragments: 15 },
    baseProduction: { crystallizedDesires: 4 },
    buildTime: 60
  },
  oblivion_well: {
    name: 'Колодец забвения',
    baseCost: { moonDust: 60, crystallizedDesires: 25 },
    baseProduction: { essenceOblivion: 3 },
    buildTime: 90
  },
  mind_storage: {
    name: 'Хранилище разума',
    baseCost: { moonDust: 100, nightmareFragments: 30 },
    buildTime: 120
  }
};

export const getVillage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const village = await prisma.village.findUnique({
      where: { userId: req.userId },
      include: { buildings: true }
    });

    if (!village) {
      res.status(404).json({ error: 'Village not found' });
      return;
    }

    res.json(village);
  } catch (error) {
    console.error('Get village error:', error);
    res.status(500).json({ error: 'Failed to get village' });
  }
};

export const collectIdleResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const village = await prisma.village.findUnique({
      where: { userId: req.userId },
      include: { buildings: true }
    });

    if (!village) {
      res.status(404).json({ error: 'Village not found' });
      return;
    }

    const now = new Date();
    const hoursPassed = (now.getTime() - village.lastCollectedAt.getTime()) / (1000 * 60 * 60);

    // Считаем продакшн от всех готовых зданий
    let totalProduction: Record<string, number> = {
      nightmareFragments: 0,
      crystallizedDesires: 0,
      essenceOblivion: 0,
      pureFear: 0,
      moonDust: 0
    };

    for (const building of village.buildings) {
      if (building.isConstructing) continue;
      
      const config = buildingConfig[building.type];
      if (!config?.baseProduction) continue;

      for (const [resource, amount] of Object.entries(config.baseProduction)) {
        const produced = Math.floor(amount * building.level * hoursPassed);
        totalProduction[resource] += produced;
      }
    }

    // Применяем лимит хранилища
    const updatedVillage = await prisma.village.update({
      where: { id: village.id },
      data: {
        crystallizedDesires: Math.min(village.crystallizedDesires + totalProduction.crystallizedDesires, village.maxStorage),
        essenceOblivion: Math.min(village.essenceOblivion + totalProduction.essenceOblivion, village.maxStorage),
        moonDust: Math.min(village.moonDust + totalProduction.moonDust, village.maxStorage),
        nightmareFragments: Math.min(village.nightmareFragments + totalProduction.nightmareFragments, village.maxStorage),
        pureFear: Math.min(village.pureFear + totalProduction.pureFear, village.maxStorage),
        lastCollectedAt: now
      }
    });

    res.json({
      message: 'Resources collected',
      collected: totalProduction,
      hoursPassed: Math.round(hoursPassed * 100) / 100,
      village: updatedVillage
    });
  } catch (error) {
    console.error('Collect resources error:', error);
    res.status(500).json({ error: 'Failed to collect resources' });
  }
};

export const buildBuilding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, positionX, positionY } = req.body;

    const config = buildingConfig[type];
    if (!config) {
      res.status(400).json({ error: 'Invalid building type' });
      return;
    }

    const village = await prisma.village.findUnique({
      where: { userId: req.userId },
      include: { buildings: true }
    });

    if (!village) {
      res.status(404).json({ error: 'Village not found' });
      return;
    }

    // Проверка ресурсов
    const cost = config.baseCost;
    if (
      (cost.moonDust && village.moonDust < cost.moonDust) ||
      (cost.nightmareFragments && village.nightmareFragments < cost.nightmareFragments) ||
      (cost.crystallizedDesires && village.crystallizedDesires < cost.crystallizedDesires) ||
      (cost.essenceOblivion && village.essenceOblivion < cost.essenceOblivion)
    ) {
      res.status(400).json({ error: 'Not enough resources' });
      return;
    }

    // Проверка позиции
    const positionTaken = village.buildings.some(
      b => b.positionX === positionX && b.positionY === positionY
    );
    if (positionTaken) {
      res.status(400).json({ error: 'Position already occupied' });
      return;
    }

    // Создаём здание и списываем ресурсы
    const [building] = await prisma.$transaction([
      prisma.building.create({
        data: {
          villageId: village.id,
          type,
          positionX,
          positionY,
          isConstructing: config.buildTime > 0,
          constructionStartedAt: config.buildTime > 0 ? new Date() : null,
          constructionEndsAt: config.buildTime > 0 
            ? new Date(Date.now() + config.buildTime * 1000) 
            : null
        }
      }),
      prisma.village.update({
        where: { id: village.id },
        data: {
          moonDust: { decrement: cost.moonDust || 0 },
          nightmareFragments: { decrement: cost.nightmareFragments || 0 },
          crystallizedDesires: { decrement: cost.crystallizedDesires || 0 },
          essenceOblivion: { decrement: cost.essenceOblivion || 0 }
        }
      })
    ]);

    res.json({ message: 'Building started', building });
  } catch (error) {
    console.error('Build error:', error);
    res.status(500).json({ error: 'Failed to build' });
  }
};

export const finishConstruction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { buildingId } = req.body;

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
      include: { village: true }
    });

    if (!building || building.village.userId !== req.userId) {
      res.status(404).json({ error: 'Building not found' });
      return;
    }

    if (!building.isConstructing) {
      res.status(400).json({ error: 'Building is not under construction' });
      return;
    }

    if (building.constructionEndsAt && building.constructionEndsAt > new Date()) {
      const remaining = (building.constructionEndsAt.getTime() - Date.now()) / 1000;
      res.status(400).json({ error: 'Still constructing', remainingTime: remaining });
      return;
    }

    const updatedBuilding = await prisma.building.update({
      where: { id: buildingId },
      data: {
        isConstructing: false,
        constructionStartedAt: null,
        constructionEndsAt: null
      }
    });

    res.json({ message: 'Construction complete', building: updatedBuilding });
  } catch (error) {
    console.error('Finish construction error:', error);
    res.status(500).json({ error: 'Failed to finish construction' });
  }
};

export const depositResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await prisma.character.findUnique({
      where: { userId: req.userId },
      include: { inventory: true }
    });

    const village = await prisma.village.findUnique({
      where: { userId: req.userId }
    });

    if (!character?.inventory || !village) {
      res.status(404).json({ error: 'Character or village not found' });
      return;
    }

    const inv = character.inventory;

    await prisma.$transaction([
      prisma.village.update({
        where: { id: village.id },
        data: {
          crystallizedDesires: Math.min(village.crystallizedDesires + inv.crystallizedDesires, village.maxStorage),
          essenceOblivion: Math.min(village.essenceOblivion + inv.essenceOblivion, village.maxStorage),
          moonDust: Math.min(village.moonDust + inv.moonDust, village.maxStorage),
          nightmareFragments: Math.min(village.nightmareFragments + inv.nightmareFragments, village.maxStorage),
          pureFear: Math.min(village.pureFear + inv.pureFear, village.maxStorage),
        }
      }),
      prisma.inventory.update({
        where: { id: inv.id },
        data: {
          crystallizedDesires: 0,
          essenceOblivion: 0,
          moonDust: 0,
          nightmareFragments: 0,
          pureFear: 0
        }
      })
    ]);

    res.json({ message: 'Resources deposited' });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Failed to deposit resources' });
  }
};