import { api } from '@/lib/api';

export interface AuditoriaLog {
  id: number;
  usuario_id: number;
  usuario_nombre?: string;
  tabla_afectada: string;
  registro_id: number;
  accion: string;
  valores_anteriores: Record<string, any>;
  valores_nuevos: Record<string, any>;
  fecha_hora: string;
  ip_address: string;
}

// Para la paginación que implementamos en DataTable, el endpoint solo necesita los query params de search
// pero podemos tener utilidades aquí si fuera necesario
export const getAuditoria = async (params?: Record<string, any>) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const { data } = await api.get(`/auditoria/?${queryParams}`);
  return data;
};
