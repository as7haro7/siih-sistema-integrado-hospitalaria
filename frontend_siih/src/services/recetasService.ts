import { api } from '@/lib/api';
import { RecetaDetalle, DespachoResponse } from '@/types';

export const getRecetas = async (params?: { estado_despacho?: string; id_historial?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.estado_despacho) queryParams.append('estado_despacho', params.estado_despacho);
  if (params?.id_historial) queryParams.append('id_historial', params.id_historial.toString());

  const url = `/recetas/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const { data } = await api.get(url);
  return data;
};

export const getRecetasPendientes = async () => {
  const { data } = await api.get<RecetaDetalle[]>('/recetas/pendientes/');
  return data;
};

export const despacharReceta = async (id: number) => {
  const { data } = await api.post<DespachoResponse>(`/recetas/${id}/despachar/`);
  return data;
};
