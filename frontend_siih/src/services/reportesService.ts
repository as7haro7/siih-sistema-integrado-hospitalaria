import { api, getApiBaseUrl } from '@/lib/api';

export const getReporteIngresos = async (fechaInicio?: string, fechaFin?: string) => {
  let url = '/reportes/ingresos/';
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  const { data } = await api.get(url);
  return data;
};

export const getReportePacientesEspecialidad = async (fechaInicio?: string, fechaFin?: string) => {
  let url = '/reportes/pacientes-por-especialidad/';
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  const { data } = await api.get(url);
  return data;
};

export const getReporteConsumoMedicamentos = async (fechaInicio?: string, fechaFin?: string) => {
  let url = '/reportes/consumo-medicamentos/';
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  const { data } = await api.get(url);
  return data;
};

// Obtiene la URL de exportación para botones de descarga
export const getExportUrl = (reportType: 'ingresos' | 'pacientes-por-especialidad' | 'consumo-medicamentos', format: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) => {
  const baseUrl = getApiBaseUrl();
  let url = `${baseUrl}/reportes/${reportType}/exportar/${format}/`;
  if (fechaInicio && fechaFin) {
    url += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
  }
  return url;
};
