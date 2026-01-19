import client from './client';

export const register = async (username: string, password: string) => {
  const response = await client.post('/auth/register', { username, password });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await client.post('/auth/login', { username, password });
  return response.data;
};