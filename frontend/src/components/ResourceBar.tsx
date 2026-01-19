import { useGameStore } from '../store/gameStore';

export default function ResourceBar() {
  const { character, village, currentZone } = useGameStore();
  
  const resources = currentZone === 'shelter' ? village : character?.inventory;
  
  if (!resources) return null;

  return (
    <div className="resource-bar">
      <div className="resource">
        <span className="icon">🌙</span>
        <span>{resources.moonDust}</span>
      </div>
      <div className="resource">
        <span className="icon">💎</span>
        <span>{resources.frozenWishes}</span>
      </div>
      <div className="resource">
        <span className="icon">👻</span>
        <span>{resources.nightmareShards}</span>
      </div>
      <div className="resource">
        <span className="icon">💨</span>
        <span>{resources.oblivionEssence}</span>
      </div>
      <div className="resource">
        <span className="icon">😱</span>
        <span>{resources.pureFear}</span>
      </div>
      
      {currentZone !== 'shelter' && (
        <div className="capacity">
          Инвентарь: {Object.values(character?.inventory || {}).reduce((a, b) => typeof b === 'number' ? a + b : a, 0)} / {character?.inventory?.maxCapacity}
        </div>
      )}
    </div>
  );
}