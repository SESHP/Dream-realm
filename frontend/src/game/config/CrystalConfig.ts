// CrystalConfig.ts
export const CRYSTAL_TYPES = [
  { key: 'crystallized_desires', name: 'Crystallized Desires' },
  { key: 'essence_oblivion', name: 'Essence Oblivion' },
  { key: 'moon_dust', name: 'Moon Dust' },
  { key: 'nightmare_fragments', name: 'Nightmare Fragments' },
  { key: 'pure_fear', name: 'Pure Fear' }
] as const;

// Настройка шансов для разных количеств (чем больше вес, тем выше шанс)
export const CRYSTAL_AMOUNTS = [
  { amount: 0.05, weight: 5 },   // самый частый
  { amount: 0.1, weight: 10 },   // частый
  { amount: 0.15, weight: 8 },
  { amount: 0.2, weight: 6 },
  { amount: 0.25, weight: 4 },
  { amount: 0.3, weight: 3 },
  { amount: 0.35, weight: 2 },
  { amount: 0.4, weight: 1.5 },
  { amount: 0.45, weight: 1 },
  { amount: 0.5, weight: 0.5 }   // самый редкий
];

export function getRandomCrystalAmount(): number {
  const totalWeight = CRYSTAL_AMOUNTS.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of CRYSTAL_AMOUNTS) {
    random -= item.weight;
    if (random <= 0) {
      return item.amount;
    }
  }
  
  return CRYSTAL_AMOUNTS[0].amount; // fallback
}

export function getRandomCrystalType() {
  return CRYSTAL_TYPES[Math.floor(Math.random() * CRYSTAL_TYPES.length)];
}