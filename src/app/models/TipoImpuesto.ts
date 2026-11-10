export interface TipoImpuesto {
  idImpuesto?: number;
  tarifa: string;
  descripcion: string;
  porcentaje: number;
  estado?: string;
}
