import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { startGathering, finishGathering, getCharacter } from '../api/game';

const resourceIcons: Record<string, string> = {
  moon_dust: '🌙',
  frozen_wish: '💎',
  nightmare_shard: '👻',
  oblivion_essence: '💨',
  pure_fear: '😱',
};

const gatheringTimes: Record<string, number> = {
  moon_dust: 3,
  frozen_wish: 4,
  nightmare_shard: 5,
  oblivion_essence: 6,
  pure_fear: 10,
};

interface Props {
  onResourceCollected: () => void;
}

export default function ZoneMap({ onResourceCollected }: Props) {
  const { mapResources, character, setCharacter, currentZone } = useGameStore();
  const [gathering, setGathering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentResource, setCurrentResource] = useState<string | null>(null);

  const handleGather = async (resourceId: string, resourceType: string) => {
    if (gathering) return;

    setGathering(true);
    setCurrentResource(resourceId);
    setProgress(0);

    try {
      await startGathering(resourceId);

      const duration = gatheringTimes[resourceType] || 5;
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + (100 / duration / 10);
        });
      }, 100);

      setTimeout(async () => {
        clearInterval(interval);
        try {
          await finishGathering();
          const updated = await getCharacter();
          setCharacter(updated);
          onResourceCollected();
        } catch (err) {
          console.error('Failed to finish gathering:', err);
        } finally {
          setGathering(false);
          setProgress(0);
          setCurrentResource(null);
        }
      }, duration * 1000);

    } catch (err) {
      console.error('Failed to start gathering:', err);
      setGathering(false);
      setCurrentResource(null);
    }
  };

  const zoneNames: Record<string, string> = {
    twilight_forest: '🌲 Сумеречный лес',
    nightmare_fields: '👁️ Поле кошмаров',
    forgotten_shore: '🌊 Забытый берег',
    deep_darkness: '🕳️ Глубокая тьма',
  };

  return (
    <div className="zone-map">
      <h2>{zoneNames[currentZone]}</h2>
      
      <div className="resources-grid">
        {mapResources.map((resource) => (
          <button
            key={resource.id}
            className={`resource-node ${currentResource === resource.id ? 'gathering' : ''}`}
            onClick={() => handleGather(resource.id, resource.type)}
            disabled={gathering}
          >
            <span className="resource-icon">{resourceIcons[resource.type]}</span>
            {currentResource === resource.id && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </button>
        ))}
      </div>

      {mapResources.length === 0 && (
        <p className="empty-zone">Ресурсы ещё не появились...</p>
      )}
    </div>
  );
}