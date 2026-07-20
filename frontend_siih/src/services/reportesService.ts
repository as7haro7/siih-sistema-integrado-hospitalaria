import { api } from '@/lib/api';

export const getReporteIngresos = async (fechaInicio?: string, fechaFin?: string) => {
  let url = '/reportes/ingresos/';
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  const { data } = await api.get(url);
  return data; // { reporte, periodo, resumen: { total_facturado, total_cobrado, pendiente_cobro }, desglose_por_estado }
};

export const getReportePacientesEspecialidad = async (fechaInicio?: string, fechaFin?: string) => {
  let url = '/reportes/pacientes-por-especialidad/';
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  const { data } = await api.get(url);
  return data; // { reporte, periodo, datos: [] }
};
