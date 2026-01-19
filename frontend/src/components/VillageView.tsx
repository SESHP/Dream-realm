import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { buildBuilding, collectIdleResources, getVillage } from '../api/game';

const buildingTypes = [
  { type: 'nightmare_trap', name: 'Ловушка кошмаров', icon: '👻', cost: { moonDust: 50, frozenWishes: 20 } },
  { type: 'wish_crystallizer', name: 'Кристаллизатор желаний', icon: '💎', cost: { moonDust: 40, nightmareShards: 15 } },
  { type: 'oblivion_well', name: 'Колодец забвения', icon: '💨', cost: { moonDust: 60, frozenWishes: 25 } },
  { type: 'mind_storage', name: 'Хранилище разума', icon: '🧠', cost: { moonDust: 100, nightmareShards: 30 } },
];

export default function Village() {
  const { village, setVillage } = useGameStore();
  const [building, setBuilding] = useState(false);

  if (!village) return null;

  const handleCollect = async () => {
    try {
      const result = await collectIdleResources();
      setVillage(result.village);
    } catch (err) {
      console.error('Failed to collect:', err);
    }
  };

  const handleBuild = async (type: string) => {
    setBuilding(true);
    try {
      const posX = Math.floor(Math.random() * 10);
      const posY = Math.floor(Math.random() * 10);
      await buildBuilding(type, posX, posY);
      const updated = await getVillage();
      setVillage(updated);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось построить');
    } finally {
      setBuilding(false);
    }
  };

  return (
    <div className="village">
      <div className="village-header">
        <h2>🏠 Убежище</h2>
        <button onClick={handleCollect} className="collect-btn">
          Собрать ресурсы
        </button>
      </div>

      <div className="buildings-grid">
        {village.buildings.map((b) => (
          <div key={b.id} className={`building ${b.isConstructing ? 'constructing' : ''}`}>
            <span className="building-icon">
              {b.type === 'nexus' && '🌀'}
              {b.type === 'nightmare_trap' && '👻'}
              {b.type === 'wish_crystallizer' && '💎'}
              {b.type === 'oblivion_well' && '💨'}
              {b.type === 'mind_storage' && '🧠'}
            </span>
            <span className="building-level">Ур. {b.level}</span>
            {b.isConstructing && <span className="building-status">🔨</span>}
          </div>
        ))}
      </div>

      <div className="build-menu">
        <h3>Построить</h3>
        <div className="build-options">
          {buildingTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => handleBuild(bt.type)}
              disabled={building}
              className="build-btn"
            >
              <span>{bt.icon} {bt.name}</span>
              <span className="cost">
                🌙{bt.cost.moonDust} 
                {bt.cost.frozenWishes && ` 💎${bt.cost.frozenWishes}`}
                {bt.cost.nightmareShards && ` 👻${bt.cost.nightmareShards}`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}