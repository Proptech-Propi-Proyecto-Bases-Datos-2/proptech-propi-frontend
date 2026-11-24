import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../services/facturas.service';
import { FacturasDetalleService } from '../../services/facturas-detalle.service';
import { ProductosServiciosService } from '../../services/productos-servicios.service';
import { Factura } from '../../models/Factura';
import { FacturaDetalle as FacturaDetalleModel } from '../../models/FacturaDetalle';
import { ProductoServicio } from '../../models/ProductoServicio';
import { ApiError } from '../../models/ApiError';

// Fila de la tabla: la línea junto con los datos de su factura
interface DetailRow {
  idFactura: number;
  clientName: string;
  detail: FacturaDetalleModel;
}

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-factura-detalle',
  styleUrls: ['../../shared/crud.css', './factura-detalle.css'],
  templateUrl: './factura-detalle.html',
})
export class FacturaDetalle implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly rows = signal<DetailRow[]>([]);
  readonly invoices = signal<Factura[]>([]);
  readonly products = signal<ProductoServicio[]>([]);
  readonly loading = signal(false);
  // true cuando la API responde 403: el rol del usuario no puede ver esta lista
  readonly sinPermiso = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Control del cuadro (modal) para insertar o editar
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  // Datos del formulario y filtro (se llenan con lo que escribe el usuario)
  form: FacturaDetalleModel = this.emptyDetail();
  formInvoiceId = 0;
  // Filtro por número de factura (0 = todas)
  invoiceFilter = 0;

  constructor(
    private facturasService: FacturasService,
    private detalleService: FacturasDetalleService,
    private productosService: ProductosServiciosService,
  ) {}

  ngOnInit(): void {
    this.loadRows();
    this.productosService.findAll().subscribe({
      next: (data) => this.products.set(data),
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  // El backend no devuelve la factura de cada línea, por eso se arma la lista desde las facturas
  loadRows(): void {
    this.loading.set(true);
    this.sinPermiso.set(false);
    this.facturasService.findAll().subscribe({
      next: (data) => {
        const list: DetailRow[] = [];
        for (const invoice of data) {
          for (const detail of invoice.detalles ?? []) {
            list.push({
              idFactura: invoice.idFactura ?? 0,
              clientName: invoice.cliente.nombre ?? '',
              detail,
            });
          }
        }
        this.invoices.set(data);
        this.rows.set(list);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loading.set(false);
        this.sinPermiso.set(err.status === 403);
      },
    });
  }

  get filteredRows(): DetailRow[] {
    if (!this.invoiceFilter) return this.rows();
    return this.rows().filter((r) => r.idFactura === Number(this.invoiceFilter));
  }

  // Productos que se pueden escoger: los activos y el que ya tiene la línea al editar
  get availableProducts(): ProductoServicio[] {
    return this.products().filter(
      (p) => p.estado === 'A' || p.idProducto === this.form.productoServicio.idProducto,
    );
  }

  // Monto de la línea antes de impuestos: cantidad x precio
  get lineAmount(): number {
    const product = this.products().find((p) => p.idProducto === Number(this.form.productoServicio.idProducto));
    if (!product) return 0;
    return this.round(this.form.cantidad * product.precio);
  }

  openCreate(): void {
    this.form = this.emptyDetail();
    this.formInvoiceId = this.invoiceFilter ? Number(this.invoiceFilter) : 0;
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(row: DetailRow): void {
    this.form = { ...row.detail, productoServicio: { ...row.detail.productoServicio } };
    this.formInvoiceId = row.idFactura;
    this.isEditing.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.formError.set('');
    if (!this.formInvoiceId || !this.form.productoServicio.idProducto || this.form.cantidad <= 0) {
      this.formError.set('Debe escoger la factura, el producto y una cantidad mayor a cero.');
      return;
    }

    this.saving.set(true);
    const idFactura = Number(this.formInvoiceId);
    const body: FacturaDetalleModel = {
      idDetalle: this.form.idDetalle,
      factura: { idFactura },
      productoServicio: { idProducto: Number(this.form.productoServicio.idProducto) },
      cantidad: this.form.cantidad,
      montoLinea: this.lineAmount,
    };

    if (this.isEditing() && this.form.idDetalle) {
      this.detalleService.update(this.form.idDetalle, body).subscribe({
        next: () => this.afterChange(idFactura, 'Línea actualizada correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    } else {
      // La línea nueva se inserta con el SP InsertarFacturaDetalle
      this.detalleService.insertarDetalle(body).subscribe({
        next: () => this.afterChange(idFactura, 'Línea agregada correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    }
  }

  // Eliminar es un borrado físico de la línea
  remove(row: DetailRow): void {
    if (!row.detail.idDetalle) return;
    if (!confirm(`¿Desea eliminar la línea #${row.detail.idDetalle} de la factura #${row.idFactura}?`)) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.detalleService.delete(row.detail.idDetalle).subscribe({
      next: () => this.afterChange(row.idFactura, 'Línea eliminada correctamente.'),
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  // Después de cambiar una línea se recalculan los totales de su factura
  private afterChange(idFactura: number, message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.errorMessage.set('');
    this.successMessage.set(message);
    this.updateInvoiceTotals(idFactura);
  }

  private updateInvoiceTotals(idFactura: number): void {
    this.facturasService.findById(idFactura).subscribe({
      next: (invoice) => {
        let subtotal = 0;
        let taxes = 0;
        for (const d of invoice.detalles ?? []) {
          const percentage = d.productoServicio.tipoImpuesto?.porcentaje ?? 0;
          subtotal += d.montoLinea;
          taxes += (d.montoLinea * percentage) / 100;
        }
        subtotal = this.round(subtotal);
        taxes = this.round(taxes);

        // El backend no permite una factura con total 0; en ese caso se dejan los totales como estaban
        if (subtotal + taxes <= 0) {
          this.successMessage.set(this.successMessage() + ' La factura quedó sin líneas, sus totales no se modificaron.');
          this.loadRows();
          return;
        }

        const body: Factura = {
          idFactura: invoice.idFactura,
          cliente: { idCliente: invoice.cliente.idCliente },
          fechaFactura: invoice.fechaFactura,
          condicionVenta: invoice.condicionVenta,
          medioPago: invoice.medioPago,
          moneda: invoice.moneda,
          tipoCambio: invoice.tipoCambio,
          observaciones: invoice.observaciones,
          subtotal,
          totalImpuestos: taxes,
          montoTotal: this.round(subtotal + taxes),
        };
        this.facturasService.update(idFactura, body).subscribe({
          next: () => {
            this.successMessage.set(this.successMessage() + ` Totales de la factura #${idFactura} recalculados.`);
            this.loadRows();
          },
          error: (err: ApiError) => {
            this.errorMessage.set(`No se pudieron recalcular los totales: ${err.mensaje}`);
            this.loadRows();
          },
        });
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loadRows();
      },
    });
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  // Redondea a 2 decimales
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private emptyDetail(): FacturaDetalleModel {
    return { productoServicio: { idProducto: 0 }, cantidad: 1, montoLinea: 0 };
  }
}
