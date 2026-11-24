export type Rol = 'Administrador' | 'Digitador' | 'Consulta';

export interface AuthResponse {
  mensaje: string;
  username: string;
  rol: Rol;
  idBitacora: number;
  token: string;
}
