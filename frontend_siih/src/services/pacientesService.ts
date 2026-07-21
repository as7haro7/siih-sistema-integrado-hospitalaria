import { api } from '@/lib/api';
import { Paciente, PacienteList, PacienteForm, BajaForm, HistorialClinico } from '@/types';

interface PacientesParams {
  search?: string;
  estado_baja?: 'Activo' | 'Baja';
  ordering?: string;
  page?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getPacientes = async (params?: PacientesParams): Promise<PaginatedResponse<PacienteList>> => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.estado_baja) queryParams.append('estado_baja', params.estado_baja);
  if (params?.ordering) queryParams.append('ordering', params.ordering);
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());
  
  const { data } = await api.get(`/pacientes/?${queryParams.toString()}`);
  return data;
};

export const getPaciente = async (id: number): Promise<Paciente> => {
  const { data } = await api.get(`/pacientes/${id}/`);
  return data;
};

export const createPaciente = async (paciente: PacienteForm): Promise<Paciente> => {
  const { data } = await api.post('/pacientes/', paciente);
  return data;
};

export const updatePaciente = async (id: number, paciente: Partial<PacienteForm>): Promise<Paciente> => {
  const { data } = await api.patch(`/pacientes/${id}/`, paciente);
  return data;
};

export const getHistorialPaciente = async (id: number, page: number = 1): Promise<PaginatedResponse<HistorialClinico>> => {
  const queryParams = new URLSearchParams();
  if (page > 1) queryParams.append('page', page.toString());
  
  const { data } = await api.get(`/pacientes/${id}/historial/?${queryParams.toString()}`);
  return data;
};

export const darDeBajaPaciente = async (id: number, form?: BajaForm): Promise<any> => {
  const { data } = await api.post(`/pacientes/${id}/baja/`, form || {});
  return data;
};
