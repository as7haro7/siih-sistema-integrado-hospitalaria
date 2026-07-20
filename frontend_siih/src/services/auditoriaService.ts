import { api } from '@/lib/api';

export interface AuditoriaLog {
  id_auditoria: number;
  usuario_accion: string;
  tabla_afectada: string;
  id_registro_afectado: number;
  tipo_operacion: 'INSERCION' | 'LECTURA' | 'EDICION' | 'ELIMINACION';
  valores_anteriores: string | null;
  valores_nuevos: string | null;
  fecha_hora_evento: string;
  direccion_ip: string | null;
}

export const getAuditoria = async (params?: Record<string, any>) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const { data } = await api.get(`/auditoria/?${queryParams}`);
  return data;
};
