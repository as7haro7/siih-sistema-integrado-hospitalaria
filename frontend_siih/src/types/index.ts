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
