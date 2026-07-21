import { api } from '@/lib/api';
import { Medicamento, AlertasFarmacia } from '@/types';

export const getMedicamentos = async (params?: { search?: string; page?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page) queryParams.append('page', params.page.toString());
  
  const url = `/medicamentos/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const { data } = await api.get(url);
  return data; // returns PaginatedResponse<Medicamento>
};

export const getMedicamentoById = async (id: number) => {
  const { data } = await api.get<Medicamento>(`/medicamentos/${id}/`);
  return data;
};

export const createMedicamento = async (medicamento: Omit<Medicamento, 'id_medicamento' | 'stock_actual'>) => {
  const { data } = await api.post<Medicamento>('/medicamentos/', medicamento);
  return data;
};

export const updateMedicamento = async (id: number, medicamento: Partial<Omit<Medicamento, 'id_medicamento' | 'stock_actual'>>) => {
  const { data } = await api.patch<Medicamento>(`/medicamentos/${id}/`, medicamento);
  return data;
};

export const getAlertasFarmacia = async () => {
  const { data } = await api.get<AlertasFarmacia>('/medicamentos/alertas/');
  return data;
};
