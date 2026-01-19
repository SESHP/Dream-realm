import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';

export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(gameConfig);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      id="game-container" 
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#0a0a0f'
      }}
    />
  );
};