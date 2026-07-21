import { api } from '@/lib/api';
import { Cita, CitaForm, CitaUpdate, DisponibilidadResponse } from '@/types';
import { Cama } from '@/types';

interface CamasParams {
  estado_cama?: string;
  nro_habitacion?: string;
  page?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getCamas = async (params?: CamasParams): Promise<PaginatedResponse<Cama>> => {
  const queryParams = new URLSearchParams();
  if (params?.estado_cama) queryParams.append('estado_cama', params.estado_cama);
  if (params?.nro_habitacion) queryParams.append('nro_habitacion', params.nro_habitacion);
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());

  const { data } = await api.get(`/camas/?${queryParams.toString()}`);
  return data;
};

export const getCamasDisponibles = async (): Promise<Cama[]> => {
  // El endpoint de disponibles no está paginado según los requerimientos
  const { data } = await api.get('/camas/disponibles/');
  return data;
};
