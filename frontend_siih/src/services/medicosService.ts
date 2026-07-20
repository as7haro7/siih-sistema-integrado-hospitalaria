import { api } from '@/lib/api';

export interface MedicoList {
  id_medico: number;
  nombre_medico: string;
  id_especialidad: number;
  especialidad_nombre: string;
  telefono: string | null;
}

export const getMedicos = async (especialidadId?: number) => {
  let url = '/medicos/';
  if (especialidadId) {
    url += `?id_especialidad=${especialidadId}`;
  }
  const { data } = await api.get(url);
  return data;
};
