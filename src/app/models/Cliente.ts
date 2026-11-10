export interface Cliente {
  idCliente?: number;
  nombre: string;
  numIdentificacion: string;
  tipoIdentificacion: string;
  provincia: string;
  canton: string;
  distrito: string;
  barrio: string;
  direccionExacta?: string;
  profesion: string;
  actividadEconomica: string;
  correoElectronico: string;
  telefono: string;
  fechaRegistro?: string;
  estado?: string;
}

export interface ClienteResponse {
  mensaje: string;
  cliente: Cliente;
}

export interface MensajeResponse {
  mensaje: string;
}
