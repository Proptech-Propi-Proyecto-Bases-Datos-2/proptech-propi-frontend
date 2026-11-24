import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosServiciosService } from '../../services/productos-servicios.service';
import { TiposImpuestoService } from '../../services/tipos-impuesto.service';
import { ProductoServicio as ProductoServicioModel } from '../../models/ProductoServicio';
import { TipoImpuesto } from '../../models/TipoImpuesto';
import { ApiError } from '../../models/ApiError';

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-producto-servicio',
  styleUrls: ['../../shared/crud.css', './producto-servicio.css'],
  templateUrl: './producto-servicio.html',
})
export class ProductoServicio implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly products = signal<ProductoServicioModel[]>([]);
  // Impuestos para llenar el select del formulario
  readonly taxes = signal<TipoImpuesto[]>([]);
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

  // Datos del formulario
  form: ProductoServicioModel = this.emptyProduct();

  constructor(
    private productosService: ProductosServiciosService,
    private tiposImpuestoService: TiposImpuestoService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadTaxes();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.sinPermiso.set(false);
    this.errorMessage.set('');
    this.productosService.findAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loading.set(false);
        this.sinPermiso.set(err.status === 403);
      },
    });
  }

  loadTaxes(): void {
    this.tiposImpuestoService.findAll().subscribe({
      next: (data) => this.taxes.set(data),
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  // Solo se pueden escoger impuestos activos (o el que ya tiene el producto al editar)
  get availableTaxes(): TipoImpuesto[] {
    return this.taxes().filter(
      (t) => t.estado === 'A' || t.idImpuesto === this.form.tipoImpuesto.idImpuesto,
    );
  }

  openCreate(): void {
    this.form = this.emptyProduct();
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(product: ProductoServicioModel): void {
    // Se copia también el objeto del impuesto para no modificar la fila de la tabla
    this.form = { ...product, tipoImpuesto: { ...product.tipoImpuesto } };
    this.isEditing.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  // Si estamos editando usa el SP ActualizarProductoServicio, si no el SP InsertarProductoServicio
  save(): void {
    this.saving.set(true);
    this.formError.set('');

    // El backend solo necesita el id del impuesto
    const body: ProductoServicioModel = {
      ...this.form,
      tipoImpuesto: { idImpuesto: Number(this.form.tipoImpuesto.idImpuesto) },
    };

    if (this.isEditing() && this.form.idProducto) {
      this.productosService.update(this.form.idProducto, body).subscribe({
        next: () => this.afterSave('Producto o servicio actualizado correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    } else {
      this.productosService.insertarProducto(body).subscribe({
        next: () => this.afterSave('Producto o servicio insertado correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    }
  }

  // Borrado lógico con el SP DesactivarProductoServicio
  deactivate(product: ProductoServicioModel): void {
    if (!product.idProducto) return;
    if (!confirm(`¿Desea inactivar "${product.descripcion}"?`)) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.productosService.delete(product.idProducto).subscribe({
      next: () => {
        this.successMessage.set('Producto o servicio inactivado correctamente.');
        this.loadProducts();
      },
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  private afterSave(message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.successMessage.set(message);
    this.loadProducts();
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  private emptyProduct(): ProductoServicioModel {
    return {
      codCabys: '',
      tipoImpuesto: { idImpuesto: 0 },
      descripcion: '',
      unidadMedida: 'Unid',
      precio: 0,
      estado: 'A',
    };
  }
}
