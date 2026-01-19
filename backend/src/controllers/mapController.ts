import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../types';

export const getMapResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { zone } = req.query;

    const resources = await prisma.mapResource.findMany({
      where: {
        zone: zone as string || undefined,
        depleted: false
      }
    });

    res.json(resources);
  } catch (error) {
    console.error('Get map resources error:', error);
    res.status(500).json({ error: 'Failed to get map resources' });
  }
};

export const seedMapResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Удаляем старые ресурсы
    await prisma.mapResource.deleteMany();

    // Конфиг зон
    const zones = [
      { name: 'twilight_forest', resources: ['frozen_wish', 'moon_dust'] },
      { name: 'nightmare_fields', resources: ['nightmare_shard', 'moon_dust'] },
      { name: 'forgotten_shore', resources: ['oblivion_essence', 'moon_dust'] },
      { name: 'deep_darkness', resources: ['pure_fear', 'nightmare_shard'] }
    ];

    const allResources = [];

    for (const zone of zones) {
      // Генерируем 10-15 ресурсов на зону
      const count = 10 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < count; i++) {
        const type = zone.resources[Math.floor(Math.random() * zone.resources.length)];
        allResources.push({
          type,
          zone: zone.name,
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20),
          depleted: false
        });
      }
    }

    await prisma.mapResource.createMany({
      data: allResources
    });

    res.json({ message: 'Map seeded', count: allResources.length });
  } catch (error) {
    console.error('Seed map error:', error);
    res.status(500).json({ error: 'Failed to seed map' });
  }
};

export const respawnResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const respawned = await prisma.mapResource.updateMany({
      where: {
        depleted: true,
        respawnAt: { lte: now }
      },
      data: {
        depleted: false,
        respawnAt: null
      }
    });

    res.json({ message: 'Resources respawned', count: respawned.count });
  } catch (error) {
    console.error('Respawn error:', error);
    res.status(500).json({ error: 'Failed to respawn resources' });
  }
};