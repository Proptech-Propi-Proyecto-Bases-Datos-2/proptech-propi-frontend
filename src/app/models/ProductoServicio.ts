import { TipoImpuesto } from './TipoImpuesto';

export interface ProductoServicio {
  idProducto?: number;
  codCabys: string;
  tipoImpuesto: Partial<TipoImpuesto> & { idImpuesto: number };
  descripcion: string;
  unidadMedida: string;
  precio: number;
  estado?: string;
}
