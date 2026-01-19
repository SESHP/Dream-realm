export interface User {
  id: string;
  username: string;
}

export interface Inventory {
  id: string;
  nightmareShards: number;
  frozenWishes: number;
  oblivionEssence: number;
  pureFear: number;
  moonDust: number;
  maxCapacity: number;
}

export interface Character {
  id: string;
  x: number;
  y: number;
  currentZone: string;
  currentAction: string | null;
  actionStartedAt: string | null;
  actionTargetId: string | null;
  inventory: Inventory;
}

export interface Building {
  id: string;
  type: string;
  level: number;
  positionX: number;
  positionY: number;
  isConstructing: boolean;
  constructionEndsAt: string | null;
}

export interface Village {
  id: string;
  nightmareShards: number;
  frozenWishes: number;
  oblivionEssence: number;
  pureFear: number;
  moonDust: number;
  maxStorage: number;
  buildings: Building[];
}

export interface MapResource {
  id: string;
  type: string;
  zone: string;
  x: number;
  y: number;
  depleted: boolean;
}