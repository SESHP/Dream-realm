import { create } from 'zustand';
import type { Character, Village, MapResource } from '../types';

interface GameState {
  token: string | null;
  character: Character | null;
  village: Village | null;
  mapResources: MapResource[];
  currentZone: string;
  
  setToken: (token: string | null) => void;
  setCharacter: (character: Character | null) => void;
  setVillage: (village: Village | null) => void;
  setMapResources: (resources: MapResource[]) => void;
  setCurrentZone: (zone: string) => void;
  logout: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  token: localStorage.getItem('token'),
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

  setCharacter: (character) => set({ character }),
  setVillage: (village) => set({ village }),
  setMapResources: (mapResources) => set({ mapResources }),
  setCurrentZone: (currentZone) => set({ currentZone }),

  logout: () => {
    localStorage.removeItem('token');
    set({
      token: null,
      character: null,
      village: null,
      mapResources: [],
      currentZone: 'shelter',
    });
  },
}));