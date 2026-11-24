import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../services/facturas.service';
import { FacturasDetalleService } from '../../services/facturas-detalle.service';
import { ClientesService } from '../../services/clientes.service';
import { ProductosServiciosService } from '../../services/productos-servicios.service';
import { Factura as FacturaModel } from '../../models/Factura';
import { Cliente } from '../../models/Cliente';
import { ProductoServicio } from '../../models/ProductoServicio';
import { ApiError } from '../../models/ApiError';

// Una línea del formulario de factura nueva
interface InvoiceLine {
  idProducto: number;
  cantidad: number;
}

@Component({
  imports: [FormsModule, DatePipe, DecimalPipe],
  selector: 'app-factura',
  styleUrls: ['../../shared/crud.css', './factura.css'],
  templateUrl: './factura.html',
})
export class Factura implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly invoices = signal<FacturaModel[]>([]);
  // Datos para los select del formulario
  readonly clients = signal<Cliente[]>([]);
  readonly products = signal<ProductoServicio[]>([]);
  readonly loading = signal(false);
  // true cuando la API responde 403: el rol del usuario no puede ver esta lista
  readonly sinPermiso = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Opciones fijas según el enunciado
  readonly saleConditions = ['Contado', 'Crédito'];
  readonly paymentMethods = ['Efectivo', 'Tarjeta', 'Cheque', 'Transferencia', 'SINPE Móvil', 'Otros'];
  readonly currencies = ['CRC', 'USD'];

  // Control del cuadro (modal)
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');
  form: FacturaModel = this.emptyInvoice();
  lines: InvoiceLine[] = [];

  constructor(
    private facturasService: FacturasService,
    private detalleService: FacturasDetalleService,
    private clientesService: ClientesService,
    private productosService: ProductosServiciosService,
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadCatalogs();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.sinPermiso.set(false);
    this.errorMessage.set('');
    this.facturasService.findAll().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loading.set(false);
        this.sinPermiso.set(err.status === 403);
      },
    });
  }

  // Clientes activos y productos activos para armar la factura
  loadCatalogs(): void {
    this.clientesService.listarClientes('A').subscribe({
      next: (data) => this.clients.set(data),
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
    this.productosService.findAll().subscribe({
      next: (data) => this.products.set(data.filter((p) => p.estado === 'A')),
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  // ---------- Insertar ----------
  openCreate(): void {
    this.form = this.emptyInvoice();
    this.lines = [{ idProducto: 0, cantidad: 1 }];
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  addLine(): void {
    this.lines.push({ idProducto: 0, cantidad: 1 });
  }

  removeLine(index: number): void {
    this.lines.splice(index, 1);
  }

  // Busca el producto escogido en una línea
  findProduct(idProducto: number): ProductoServicio | undefined {
    return this.products().find((p) => p.idProducto === Number(idProducto));
  }

  // Monto de la línea antes de impuestos: cantidad x precio
  lineAmount(line: InvoiceLine): number {
    const product = this.findProduct(line.idProducto);
    if (!product) return 0;
    return this.round(line.cantidad * product.precio);
  }

  // Impuesto de la línea según el porcentaje del tipo de impuesto del producto
  lineTax(line: InvoiceLine): number {
    const product = this.findProduct(line.idProducto);
    if (!product) return 0;
    const percentage = product.tipoImpuesto.porcentaje ?? 0;
    return this.round((this.lineAmount(line) * percentage) / 100);
  }

  get subtotal(): number {
    return this.round(this.lines.reduce((sum, line) => sum + this.lineAmount(line), 0));
  }

  get totalTaxes(): number {
    return this.round(this.lines.reduce((sum, line) => sum + this.lineTax(line), 0));
  }

  get total(): number {
    return this.round(this.subtotal + this.totalTaxes);
  }

  // ---------- Editar (solo el encabezado; las líneas se editan en "Factura detalle") ----------
  openEdit(invoice: FacturaModel): void {
    this.form = { ...invoice, cliente: { ...invoice.cliente } };
    this.lines = [];
    this.isEditing.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    this.formError.set('');
    if (this.isEditing()) {
      this.updateInvoice();
    } else {
      this.createInvoice();
    }
  }

  // 1) Inserta el encabezado con el SP InsertarFactura  2) Inserta cada línea con el SP InsertarFacturaDetalle
  private createInvoice(): void {
    if (!this.form.cliente.idCliente) {
      this.formError.set('Debe seleccionar un cliente.');
      return;
    }
    if (this.lines.length === 0 || this.lines.some((l) => !l.idProducto || l.cantidad <= 0)) {
      this.formError.set('Cada línea debe tener un producto y una cantidad mayor a cero.');
      return;
    }

    this.saving.set(true);
    const header: FacturaModel = {
      cliente: { idCliente: Number(this.form.cliente.idCliente) },
      condicionVenta: this.form.condicionVenta,
      medioPago: this.form.medioPago,
      moneda: this.form.moneda,
      tipoCambio: this.form.tipoCambio,
      observaciones: this.form.observaciones,
      subtotal: this.subtotal,
      totalImpuestos: this.totalTaxes,
      montoTotal: this.total,
    };

    this.facturasService.insertarFactura(header).subscribe({
      next: (res) => this.insertLine(res.idFactura, 0),
      error: (err: ApiError) => this.showFormError(err),
    });
  }

  // Inserta las líneas una por una (cuando termina una sigue con la siguiente)
  private insertLine(idFactura: number, index: number): void {
    if (index >= this.lines.length) {
      this.afterSave(`Factura #${idFactura} registrada correctamente.`);
      return;
    }

    const line = this.lines[index];
    this.detalleService
      .insertarDetalle({
        factura: { idFactura },
        productoServicio: { idProducto: Number(line.idProducto) },
        cantidad: line.cantidad,
        montoLinea: this.lineAmount(line),
      })
      .subscribe({
        next: () => this.insertLine(idFactura, index + 1),
        error: (err: ApiError) => {
          this.saving.set(false);
          this.formError.set(`La factura #${idFactura} se creó, pero falló la línea ${index + 1}: ${err.mensaje}`);
          this.loadInvoices();
        },
      });
  }

  private updateInvoice(): void {
    if (!this.form.idFactura) return;
    this.saving.set(true);

    // Se envía el encabezado sin las listas de detalles y notas
    const body: FacturaModel = {
      idFactura: this.form.idFactura,
      cliente: { idCliente: this.form.cliente.idCliente },
      fechaFactura: this.form.fechaFactura,
      condicionVenta: this.form.condicionVenta,
      medioPago: this.form.medioPago,
      moneda: this.form.moneda,
      tipoCambio: this.form.tipoCambio,
      observaciones: this.form.observaciones,
      subtotal: this.form.subtotal,
      totalImpuestos: this.form.totalImpuestos,
      montoTotal: this.form.montoTotal,
    };

    this.facturasService.update(this.form.idFactura, body).subscribe({
      next: () => this.afterSave(`Factura #${this.form.idFactura} actualizada correctamente.`),
      error: (err: ApiError) => this.showFormError(err),
    });
  }

  private afterSave(message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.successMessage.set(message);
    this.loadInvoices();
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  // Redondea a 2 decimales
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private emptyInvoice(): FacturaModel {
    return {
      cliente: { idCliente: 0 },
      condicionVenta: 'Contado',
      medioPago: 'Efectivo',
      moneda: 'CRC',
      tipoCambio: 1,
      observaciones: '',
      subtotal: 0,
      totalImpuestos: 0,
      montoTotal: 0,
    };
  }
}
