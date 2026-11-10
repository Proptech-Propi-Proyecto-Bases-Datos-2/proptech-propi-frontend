export type TipoNota = 'Credito' | 'Debito';

export interface NotaCreditoDebito {
  idNota?: number;
  // Se envía al crear/actualizar; el backend no lo devuelve en las respuestas.
  factura?: { idFactura: number };
  fecha?: string;
  tipo: TipoNota;
  motivo: string;
  montoTotal: number;
}
