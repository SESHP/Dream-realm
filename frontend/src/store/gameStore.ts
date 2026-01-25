import { create } from 'zustand';
import type { Character, Village, MapResource } from '../types';

interface GameState {
  token: string | null;
  userId: string | null; // добавили
  character: Character | null;
  village: Village | null;
  mapResources: MapResource[];
  currentZone: string;
  
  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void; // добавили
  setCharacter: (character: Character | null) => void;
  setVillage: (village: Village | null) => void;
  setMapResources: (resources: MapResource[]) => void;
  setCurrentZone: (zone: string) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId'), // добавили
  character: null,
  village: null,
  mapResources: [],
  currentZone: 'shelter',

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setUserId: (userId) => { // добавили
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
    set({ userId });
  },

  setCharacter: (character) => set({ character }),
  setVillage: (village) => set({ village }),
  setMapResources: (mapResources) => set({ mapResources }),
  setCurrentZone: (currentZone) => set({ currentZone }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // добавили
    set({
      token: null,
      userId: null, // добавили
      character: null,
      village: null,
      mapResources: [],
      currentZone: 'shelter',
    });
  },
}));