import { Response } from 'express';
import prisma from '../services/prisma';
import { AuthRequest } from '../types';
import { CRYSTAL_DB_MAP } from '../config/crystalConfig';

export const addCrystal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { crystalType, amount } = req.body;
    
    // Валидация
    if (!CRYSTAL_DB_MAP[crystalType]) {
      res.status(400).json({ error: 'Invalid crystal type' });
      return;
    }
    
    const dbField = CRYSTAL_DB_MAP[crystalType];
    
    // Находим инвентарь персонажа
    const character = await prisma.character.findUnique({
      where: { userId: req.userId },
      include: { inventory: true }
    });
    
    if (!character?.inventory) {
      res.status(404).json({ error: 'Inventory not found' });
      return;
    }
    
    // Обновляем инвентарь
    const inventory = await prisma.inventory.update({
      where: { characterId: character.id },
      data: {
        [dbField]: {
          increment: amount
        }
      }
    });
    
    res.json({ 
      success: true, 
      inventory 
    });
    
  } catch (error) {
    console.error('Add crystal error:', error);
    res.status(500).json({ error: 'Failed to add crystal' });
  }
};