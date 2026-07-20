import { api } from '@/lib/api';
import { User } from '@/types';

export const getUsers = async () => {
  const { data } = await api.get('/usuarios/');
  return data;
};

export const createUsuario = async (usuario: any) => {
  const { data } = await api.post('/usuarios/', usuario);
  return data;
};

export const updateUsuario = async (userId: number, usuario: any) => {
  const { data } = await api.patch(`/usuarios/${userId}/`, usuario);
  return data;
};

export const assignRoles = async (userId: number, roles: string[]) => {
  const { data } = await api.patch(`/usuarios/${userId}/roles/`, { roles });
  return data;
};

export const toggleUserStatus = async (userId: number) => {
  // El backend DRF usa DELETE para desactivar (soft delete)
  const { data } = await api.delete(`/usuarios/${userId}/`);
  return data;
};
