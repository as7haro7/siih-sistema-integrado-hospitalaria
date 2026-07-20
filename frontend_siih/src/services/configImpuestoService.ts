import { api } from '@/lib/api';

export interface ConfigImpuesto {
  id: number;
  nombre: string;
  porcentaje: number;
  is_active: boolean;
}

export const getConfigImpuestos = async () => {
  const { data } = await api.get('/facturas/config-impuesto/');
  return data;
};

export const createConfigImpuesto = async (impuesto: Partial<ConfigImpuesto>) => {
  const { data } = await api.post('/facturas/config-impuesto/', impuesto);
  return data;
};

export const updateConfigImpuesto = async (id: number, impuesto: Partial<ConfigImpuesto>) => {
  const { data } = await api.put(`/facturas/config-impuesto/${id}/`, impuesto);
  return data;
};

export const deleteConfigImpuesto = async (id: number) => {
  const { data } = await api.delete(`/facturas/config-impuesto/${id}/`);
  return data;
};
