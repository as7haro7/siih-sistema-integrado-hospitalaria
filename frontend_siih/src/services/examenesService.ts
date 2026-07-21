import { api } from '@/lib/api';
import { ExamenLaboratorio, ResultadoExamenForm } from '@/types';

interface ExamenesParams {
  estado_examen?: string;
  id_historial?: number;
  page?: number;
  ordering?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getExamenes = async (params?: ExamenesParams): Promise<PaginatedResponse<ExamenLaboratorio>> => {
  const queryParams = new URLSearchParams();
  if (params?.estado_examen) queryParams.append('estado_examen', params.estado_examen);
  if (params?.id_historial) queryParams.append('id_historial', params.id_historial.toString());
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());
  if (params?.ordering) queryParams.append('ordering', params.ordering);

  const { data } = await api.get(`/examenes/?${queryParams.toString()}`);
  return data;
};

export const getExamen = async (id: number): Promise<ExamenLaboratorio> => {
  const { data } = await api.get(`/examenes/${id}/`);
  return data;
};

export const cargarResultado = async (id: number, resultado: ResultadoExamenForm): Promise<ExamenLaboratorio> => {
  const { data } = await api.patch(`/examenes/${id}/resultado/`, resultado);
  return data;
};
