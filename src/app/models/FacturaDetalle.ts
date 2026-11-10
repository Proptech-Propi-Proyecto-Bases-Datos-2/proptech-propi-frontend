import { ProductoServicio } from './ProductoServicio';

export interface FacturaDetalle {
  idDetalle?: number;
  // Se envía al crear/actualizar; el backend no lo devuelve en las respuestas.
  factura?: { idFactura: number };
  productoServicio: Partial<ProductoServicio> & { idProducto: number };
  cantidad: number;
  montoLinea: number;
}
