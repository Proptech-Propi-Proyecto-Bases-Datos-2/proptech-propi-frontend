// Filas que devuelve cada reporte del backend (/api/reportes/...)

export interface ReporteCliente {
  nombre: string;
  numIdentificacion: string;
  actividadEconomica: string;
  correoElectronico: string;
  telefono: string;
}

export interface ReporteFactura {
  nombreCliente: string;
  numIdentificacion: string;
  actividadEconomica: string;
  numeroFactura: number;
  fechaFactura: string;
  subtotal: number;
  totalImpuestos: number;
  montoTotal: number;
}

export interface ReporteAuditoria {
  fecRegistro: string;
  accion: string;
  nombreUsuario: string;
  tablaAfectada: string;
  llaveRegistro: string;
  datosAfectados: string;
}

export interface ReporteSeguridad {
  nombreUsuario: string;
  rol: string;
  nombreObjeto: string;
  tipoObjeto: string;
  tipoPermiso: string;
  estadoPermiso: string;
}
