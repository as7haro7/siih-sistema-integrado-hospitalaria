import { api } from '@/lib/api';

export interface TarifaHabitacion {
  id: number;
  tipo_habitacion: string;
  precio_por_dia: number;
  is_active: boolean;
}

export const getTarifas = async () => {
  const { data } = await api.get('/tarifas-habitacion/');
  return data;
};

export const createTarifa = async (tarifa: Partial<TarifaHabitacion>) => {
  const { data } = await api.post('/tarifas-habitacion/', tarifa);
  return data;
};

export const updateTarifa = async (id: number, tarifa: Partial<TarifaHabitacion>) => {
  const { data } = await api.put(`/tarifas-habitacion/${id}/`, tarifa);
  return data;
};

export const deleteTarifa = async (id: number) => {
  const { data } = await api.delete(`/tarifas-habitacion/${id}/`);
  return data;
};
