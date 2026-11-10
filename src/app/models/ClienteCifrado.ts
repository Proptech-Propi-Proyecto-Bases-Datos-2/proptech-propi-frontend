// Los campos cifrados (byte[] en el backend) llegan como texto en base64.
export interface ClienteCifrado {
  idCliente: number;
  nombre: string;
  numIdentificacion: string;
  tipoIdentificacion: string;
  provincia: string;
  canton: string;
  distrito: string;
  barrio: string;
  direccionExacta: string;
  profesion: string;
  actividadEconomica: string;
  correoElectronico: string;
  telefono: string;
  fechaRegistro: string;
  estado: string;
}
