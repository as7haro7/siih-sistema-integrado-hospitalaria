import { api } from '@/lib/api';

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
  is_active: boolean;
}

export const getEspecialidades = async () => {
  const { data } = await api.get('/especialidades/');
  return data;
};

export const createEspecialidad = async (especialidad: Partial<Especialidad>) => {
  const { data } = await api.post('/especialidades/', especialidad);
  return data;
};

export const updateEspecialidad = async (id: number, especialidad: Partial<Especialidad>) => {
  const { data } = await api.put(`/especialidades/${id}/`, especialidad);
  return data;
};

export const deleteEspecialidad = async (id: number) => {
  const { data } = await api.delete(`/especialidades/${id}/`);
  return data;
};
