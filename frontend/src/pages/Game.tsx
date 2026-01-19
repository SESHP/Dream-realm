import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameCanvas } from '../components/GameCanvas';

export const Game = () => {
  const navigate = useNavigate();
  const { token } = useGameStore();

  useEffect(() => {
    if (!token) {
      navigate('/');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return <GameCanvas />;
};
