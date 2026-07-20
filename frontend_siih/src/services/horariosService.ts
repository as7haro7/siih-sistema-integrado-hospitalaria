import { api } from '@/lib/api';

export interface HorarioMedico {
  id_horario: number;
  id_medico: number;
  dia_semana: string; // "Lunes", "Martes", etc.
  hora_inicio: string;
  hora_fin: string;
  estado_turno: 'Activo' | 'Inactivo';
}

export const getHorariosMedicos = async () => {
  const { data } = await api.get('/horarios-medicos/');
  return data;
};

export const createHorarioMedico = async (horario: Partial<HorarioMedico>) => {
  const { data } = await api.post('/horarios-medicos/', horario);
  return data;
};

export const updateHorarioMedico = async (id: number, horario: Partial<HorarioMedico>) => {
  const { data } = await api.patch(`/horarios-medicos/${id}/`, horario);
  return data;
};

export const deleteHorarioMedico = async (id: number) => {
  const { data } = await api.delete(`/horarios-medicos/${id}/`);
  return data;
};
