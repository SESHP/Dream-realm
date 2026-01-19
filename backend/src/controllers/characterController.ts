import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../types';

export const getCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await prisma.character.findUnique({
      where: { userId: req.userId },
      include: { inventory: true }
    });

    if (!character) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Failed to get character' });
  }
};

export const moveCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { x, y, zone } = req.body;

    const character = await prisma.character.update({
      where: { userId: req.userId },
      data: {
        x: x ?? undefined,
        y: y ?? undefined,
        currentZone: zone ?? undefined,
        currentAction: null,
        actionStartedAt: null,
        actionTargetId: null
      }
    });

    res.json(character);
  } catch (error) {
    console.error('Move character error:', error);
    res.status(500).json({ error: 'Failed to move character' });
  }
};

export const startGathering = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resourceId } = req.body;

    const resource = await prisma.mapResource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    if (resource.depleted) {
      res.status(400).json({ error: 'Resource is depleted' });
      return;
    }

    const character = await prisma.character.update({
      where: { userId: req.userId },
      data: {
        currentAction: 'gathering',
        actionStartedAt: new Date(),
        actionTargetId: resourceId
      }
    });

    res.json({ message: 'Started gathering', character });
  } catch (error) {
    console.error('Start gathering error:', error);
    res.status(500).json({ error: 'Failed to start gathering' });
  }
};

export const finishGathering = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const character = await prisma.character.findUnique({
      where: { userId: req.userId },
      include: { inventory: true }
    });

    if (!character || !character.inventory) {
      res.status(404).json({ error: 'Character not found' });
      return;
    }

    if (character.currentAction !== 'gathering' || !character.actionTargetId) {
      res.status(400).json({ error: 'Not currently gathering' });
      return;
    }

    const resource = await prisma.mapResource.findUnique({
      where: { id: character.actionTargetId }
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    // Время добычи по типу ресурса (в секундах)
    const gatheringTimes: Record<string, number> = {
      nightmare_shard: 5,
      frozen_wish: 4,
      oblivion_essence: 6,
      pure_fear: 10,
      moon_dust: 3
    };

    const requiredTime = gatheringTimes[resource.type] || 5;
    const elapsedTime = (Date.now() - character.actionStartedAt!.getTime()) / 1000;

    if (elapsedTime < requiredTime) {
      res.status(400).json({ 
        error: 'Still gathering', 
        remainingTime: requiredTime - elapsedTime 
      });
      return;
    }

    // Количество ресурсов за добычу
    const resourceYields: Record<string, number> = {
      nightmare_shard: 3,
      frozen_wish: 2,
      oblivion_essence: 2,
      pure_fear: 1,
      moon_dust: 5
    };

    const amount = resourceYields[resource.type] || 1;

    // Маппинг типа ресурса на поле в инвентаре
    const fieldMap: Record<string, string> = {
      nightmare_shard: 'nightmareShards',
      frozen_wish: 'frozenWishes',
      oblivion_essence: 'oblivionEssence',
      pure_fear: 'pureFear',
      moon_dust: 'moonDust'
    };

    const field = fieldMap[resource.type];

    // Обновляем инвентарь и ресурс на карте
    await prisma.$transaction([
      prisma.inventory.update({
        where: { characterId: character.id },
        data: {
          [field]: { increment: amount }
        }
      }),
      prisma.mapResource.update({
        where: { id: resource.id },
        data: {
          depleted: true,
          respawnAt: new Date(Date.now() + 60000) // Респавн через минуту
        }
      }),
      prisma.character.update({
        where: { id: character.id },
        data: {
          currentAction: null,
          actionStartedAt: null,
          actionTargetId: null
        }
      })
    ]);

    res.json({ 
      message: 'Gathering complete', 
      resourceType: resource.type,
      amount 
    });
  } catch (error) {
    console.error('Finish gathering error:', error);
    res.status(500).json({ error: 'Failed to finish gathering' });
  }
};