import { Cliente } from './Cliente';
import { FacturaDetalle } from './FacturaDetalle';
import { NotaCreditoDebito } from './NotaCreditoDebito';

export interface Factura {
  idFactura?: number;
  cliente: Partial<Cliente> & { idCliente: number };
  fechaFactura?: string;
  condicionVenta: string;
  medioPago: string;
  moneda: string;
  tipoCambio?: number;
  observaciones?: string;
  subtotal: number;
  totalImpuestos: number;
  montoTotal: number;
  detalles?: FacturaDetalle[];
  notas?: NotaCreditoDebito[];
}
