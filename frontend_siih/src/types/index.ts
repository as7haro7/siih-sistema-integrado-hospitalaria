export interface PerfilUsuario {
  cargo: string;
  telefono: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  perfil: PerfilUsuario;
  roles: string[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  // Opcionalmente el backend podría devolver el usuario en el login, 
  // pero si no, se saca decodificando el token o llamando a /usuarios/me/
}

// ─── Pacientes ─────────────────────────────────────────────
export interface PacienteForm {
  cedula_paciente?: string | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  seguro_medico?: string;
}

export interface PacienteList {
  id_paciente: number;
  cedula_paciente: string | null;
  nombre: string;
  apellido: string;
  telefono: string | null;
  estado_baja: 'Activo' | 'Baja';
}

export interface Paciente extends PacienteForm {
  id_paciente: number;
  estado_baja: 'Activo' | 'Baja';
}

export interface BajaForm {
  motivo_baja?: string;
}

// ─── Citas ──────────────────────────────────────────────────
export interface CitaForm {
  id_paciente: number;
  id_medico: number;
  fecha_cita: string;
  hora_cita: string;
}

export interface Cita {
  id_cita: number;
  id_paciente: number;
  paciente_nombre: string;
  id_medico: number;
  medico_nombre: string;
  fecha_cita: string;
  hora_cita: string;
  estado_cita: 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada' | 'No Asistio';
}

export interface CitaUpdate {
  estado_cita: 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada' | 'No Asistio';
}

export interface DisponibilidadResponse {
  medico: string;
  fecha: string;
  dia_semana: string;
  horarios_disponibles: string[];
  mensaje?: string;
}

// ─── Emergencias ────────────────────────────────────────────
export type NivelTriage = 'Rojo' | 'Naranja' | 'Amarillo' | 'Verde' | 'Azul';

export interface EmergenciaForm {
  id_paciente: number;
  id_medico_guardia: number;
  fecha_hora_ingreso: string;
  nivel_triage: NivelTriage;
  descripcion_urgencia?: string;
  destino_paciente?: string;
}

export interface Emergencia {
  id_emergencia: number;
  id_paciente: number;
  paciente_nombre: string;
  id_medico_guardia: number;
  medico_nombre: string;
  fecha_hora_ingreso: string;
  nivel_triage: NivelTriage;
  descripcion_urgencia: string | null;
  destino_paciente: string | null;
}

// ─── Historial Clínico (lectura para detalle paciente) ──────
export interface HistorialClinico {
  id_historial: number;
  id_cita: number | null;
  id_hospitalizacion: number | null;
  id_emergencia: number | null;
  fecha_registro: string;
  motivo_consulta: string | null;
  tratamiento: string | null;
  diagnostico: string | null;
  medico_tratante: string | null;
}

// Interfaces temporales para resolver errores de compilación
export type Factura = any;
export type Pago = any;
export type Proveedor = any;
export type Medicamento = any;
export type Compra = any;
export type LoteMedicamento = any;
export type AlertasFarmacia = any;
export type RecetaDetalle = any;
export type DespachoResponse = any;
