import { api } from '@/lib/api';
import { Factura, Pago } from '@/types';

export const getFacturas = async (params?: { estado_pago?: string; page?: number }) => {
  const queryParams = new URLSearchParams();
  if (params?.estado_pago) queryParams.append('estado_pago', params.estado_pago);
  if (params?.page) queryParams.append('page', params.page.toString());

  const url = `/facturas/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const { data } = await api.get(url);
  return data;
};

export const getFacturaById = async (id: number) => {
  const { data } = await api.get<Factura>(`/facturas/${id}/`);
  return data;
};

export interface ConsolidarPayload {
  id_historial?: number | null;
  id_hospitalizacion?: number | null;
  id_impuesto: number;
  nit_factura?: string;
  razon_social?: string;
}

export const consolidarFactura = async (payload: ConsolidarPayload) => {
  const { data } = await api.post<Factura>('/facturas/consolidar/', payload);
  return data;
};

export interface PagoCreatePayload {
  monto: number;
  metodo_pago: "Efectivo" | "Tarjeta" | "Transferencia" | "Seguro";
}

export const registrarPago = async (idFactura: number, payload: PagoCreatePayload) => {
  const { data } = await api.post<Pago>(`/facturas/${idFactura}/pagos/`, payload);
  return data;
};

export const getPagosFactura = async (idFactura: number) => {
  const { data } = await api.get<Pago[]>(`/facturas/${idFactura}/pagos-lista/`);
  return data;
};
