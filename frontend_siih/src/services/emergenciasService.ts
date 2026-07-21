import { api } from '@/lib/api';
import { Emergencia, EmergenciaForm } from '@/types';

interface EmergenciasParams {
  nivel_triage?: string;
  id_medico_guardia?: number;
  page?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getEmergencias = async (params?: EmergenciasParams): Promise<PaginatedResponse<Emergencia>> => {
  const queryParams = new URLSearchParams();
  if (params?.nivel_triage) queryParams.append('nivel_triage', params.nivel_triage);
  if (params?.id_medico_guardia) queryParams.append('id_medico_guardia', params.id_medico_guardia.toString());
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());
  if (params?.search) queryParams.append('search', params.search);

  const { data } = await api.get(`/emergencias/?${queryParams.toString()}`);
  return data;
};

export const getEmergencia = async (id: number): Promise<Emergencia> => {
  const { data } = await api.get(`/emergencias/${id}/`);
  return data;
};

export const createEmergencia = async (emergencia: EmergenciaForm): Promise<Emergencia> => {
  const { data } = await api.post('/emergencias/', emergencia);
  return data;
};

export const updateEmergencia = async (id: number, emergencia: Partial<EmergenciaForm>): Promise<Emergencia> => {
  const { data } = await api.patch(`/emergencias/${id}/`, emergencia);
  return data;
};
