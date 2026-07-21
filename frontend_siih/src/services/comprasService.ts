import { api } from '@/lib/api';
import { Proveedor, LoteMedicamento, Compra } from '@/types';

// Proveedores
export const getProveedores = async () => {
  const { data } = await api.get<Proveedor[]>('/proveedores/');
  return data;
};

export const createProveedor = async (proveedor: Omit<Proveedor, 'id_proveedor'>) => {
  const { data } = await api.post<Proveedor>('/proveedores/', proveedor);
  return data;
};

export const updateProveedor = async (id: number, proveedor: Partial<Omit<Proveedor, 'id_proveedor'>>) => {
  const { data } = await api.patch<Proveedor>(`/proveedores/${id}/`, proveedor);
  return data;
};

export const deleteProveedor = async (id: number) => {
  const { data } = await api.delete(`/proveedores/${id}/`);
  return data;
};

// Lotes de Medicamentos
export const getLotesMedicamento = async (idMedicamento?: number) => {
  let url = '/lotes-medicamentos/';
  if (idMedicamento) {
    url += `?id_medicamento=${idMedicamento}`;
  }
  const { data } = await api.get(url);
  return data; // Returns paginated list of LoteMedicamento or results
};

// Compras
export const getCompras = async (idProveedor?: number) => {
  let url = '/compras/';
  if (idProveedor) {
    url += `?id_proveedor=${idProveedor}`;
  }
  const { data } = await api.get(url);
  return data;
};

export interface CompraCreatePayload {
  id_proveedor: number;
  fecha_compra: string; // YYYY-MM-DD
  numero_factura_compra?: string;
  id_medicamento: number;
  numero_lote?: string;
  cantidad: number;
  precio_compra_unitario: number;
  fecha_vencimiento: string; // YYYY-MM-DD
}

export const createCompra = async (compra: CompraCreatePayload) => {
  const { data } = await api.post<Compra>('/compras/', compra);
  return data;
};
