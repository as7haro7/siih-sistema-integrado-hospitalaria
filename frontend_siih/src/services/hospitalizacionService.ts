import { api } from '@/lib/api';
import { Hospitalizacion, HospitalizacionForm, AltaForm } from '@/types';

interface HospitalizacionesParams {
  estado_internacion?: string;
  id_medico_responsable?: number;
  id_paciente?: number;
  page?: number;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getHospitalizaciones = async (params?: HospitalizacionesParams): Promise<PaginatedResponse<Hospitalizacion>> => {
  const queryParams = new URLSearchParams();
  if (params?.estado_internacion) queryParams.append('estado_internacion', params.estado_internacion);
  if (params?.id_medico_responsable) queryParams.append('id_medico_responsable', params.id_medico_responsable.toString());
  if (params?.id_paciente) queryParams.append('id_paciente', params.id_paciente.toString());
  if (params?.page && params.page > 1) queryParams.append('page', params.page.toString());

  const { data } = await api.get(`/hospitalizaciones/?${queryParams.toString()}`);
  return data;
};

export const createHospitalizacion = async (formData: HospitalizacionForm): Promise<Hospitalizacion> => {
  const { data } = await api.post('/hospitalizaciones/', formData);
  return data;
};

export const getHospitalizacion = async (id: number): Promise<Hospitalizacion> => {
  const { data } = await api.get(`/hospitalizaciones/${id}/`);
  return data;
};

export const darDeAlta = async (id: number, formData: AltaForm): Promise<Hospitalizacion> => {
  const { data } = await api.post(`/hospitalizaciones/${id}/alta/`, formData);
  return data;
};
