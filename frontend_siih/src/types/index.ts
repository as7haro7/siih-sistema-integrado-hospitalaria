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
