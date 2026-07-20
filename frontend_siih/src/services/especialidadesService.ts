import { api } from '@/lib/api';

export interface Especialidad {
  id_especialidad: number;
  nombre_especialidad: string;
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
  const { data } = await api.patch(`/especialidades/${id}/`, especialidad);
  return data;
};

export const deleteEspecialidad = async (id: number) => {
  const { data } = await api.delete(`/especialidades/${id}/`);
  return data;
};
