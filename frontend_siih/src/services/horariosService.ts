import { api } from '@/lib/api';

export interface HorarioMedico {
  id: number;
  medico_id: number;
  medico_nombre?: string;
  especialidad_id: number;
  especialidad_nombre?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  is_active: boolean;
}

export const getHorariosMedicos = async () => {
  const { data } = await api.get('/horarios-medicos/');
  return data;
};

export const createHorarioMedico = async (horario: Partial<HorarioMedico>) => {
  const { data } = await api.post('/horarios-medicos/', horario);
  return data;
};

export const deleteHorarioMedico = async (id: number) => {
  const { data } = await api.delete(`/horarios-medicos/${id}/`);
  return data;
};
