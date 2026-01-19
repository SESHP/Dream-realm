import { useGameStore } from '../store/gameStore';
import { depositResources } from '../api/game';

const zones = [
  { id: 'shelter', name: '🏠 Убежище', description: 'Твой дом' },
  { id: 'twilight_forest', name: '🌲 Сумеречный лес', description: 'Застывшие желания, луна-пыль' },
  { id: 'nightmare_fields', name: '👁️ Поле кошмаров', description: 'Осколки кошмаров' },
  { id: 'forgotten_shore', name: '🌊 Забытый берег', description: 'Эссенция забвения' },
  { id: 'deep_darkness', name: '🕳️ Глубокая тьма', description: 'Чистый страх' },
];

export default function ZoneSelector() {
  const { currentZone, setCurrentZone, setCharacter, character } = useGameStore();

  const handleZoneChange = async (zoneId: string) => {
    if (zoneId === 'shelter' && currentZone !== 'shelter') {
      try {
        await depositResources();
        const { getCharacter, getVillage } = await import('../api/game');
        const [charData, villageData] = await Promise.all([
          getCharacter(),
          getVillage()
        ]);
        setCharacter(charData);
        useGameStore.getState().setVillage(villageData);
      } catch (err) {
        console.error('Failed to deposit:', err);
      }
    }
    setCurrentZone(zoneId);
  };

  return (
    <div className="zone-selector">
      {zones.map((zone) => (
        <button
          key={zone.id}
          className={`zone-btn ${currentZone === zone.id ? 'active' : ''}`}
          onClick={() => handleZoneChange(zone.id)}
          title={zone.description}
        >
          {zone.name}
        </button>
      ))}
    </div>
  );
}