import { api } from '@/lib/api';
import { Cita, CitaForm, CitaUpdate, DisponibilidadResponse } from '@/types';

interface CitasParams {
  estado_cita?: string;
  id_medico?: number;
  id_paciente?: number;
  fecha_cita?: string;
  ordering?: string;
  page?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getCitas = async (params?: CitasParams): Promise<PaginatedResponse<Cita>> => {
  const queryParams = new URLSearchParams();
  if (params?.estado_cita) queryParams.append('estado_cita', params.estado_cita);
  if (params?.id_medico) queryParams.append('id_medico', params.id_medico.toString());
  if (params?.id_paciente) queryParams.append('id_paciente', params.id_paciente.toString());
  if (params?.fecha_cita) queryParams.append('fecha_cita', params.fecha_cita);
  if (params?.ordering) queryParams.append('ordering', params.ordering);
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);

  const { data } = await api.get(`/citas/?${queryParams.toString()}`);
  return data;
};

export const createCita = async (cita: CitaForm): Promise<Cita> => {
  const { data } = await api.post('/citas/', cita);
  return data;
};

export const updateCitaEstado = async (id: number, update: CitaUpdate): Promise<Cita> => {
  const { data } = await api.patch(`/citas/${id}/`, update);
  return data;
};

export const getDisponibilidad = async (medicoId: number, fecha: string): Promise<DisponibilidadResponse> => {
  const { data } = await api.get(`/medicos/${medicoId}/disponibilidad/?fecha=${fecha}`);
  return data;
};
