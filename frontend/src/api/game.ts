import client from './client';

export const getCharacter = async () => {
  const response = await client.get('/character');
  return response.data;
};

export const moveCharacter = async (x: number, y: number, zone?: string) => {
  const response = await client.post('/character/move', { x, y, zone });
  return response.data;
};

export const startGathering = async (resourceId: string) => {
  const response = await client.post('/character/gather/start', { resourceId });
  return response.data;
};

export const finishGathering = async () => {
  const response = await client.post('/character/gather/finish');
  return response.data;
};

export const getVillage = async () => {
  const response = await client.get('/village');
  return response.data;
};

export const depositResources = async () => {
  const response = await client.post('/village/deposit');
  return response.data;
};

export const collectIdleResources = async () => {
  const response = await client.post('/village/collect');
  return response.data;
};

export const buildBuilding = async (type: string, positionX: number, positionY: number) => {
  const response = await client.post('/village/build', { type, positionX, positionY });
  return response.data;
};

export const getMapResources = async (zone: string) => {
  const response = await client.get(`/map/resources?zone=${zone}`);
  return response.data;
};