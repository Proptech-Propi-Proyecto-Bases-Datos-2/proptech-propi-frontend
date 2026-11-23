import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TiposImpuestoService } from '../../services/tipos-impuesto.service';
import { TipoImpuesto as TipoImpuestoModel } from '../../models/TipoImpuesto';
import { ApiError } from '../../models/ApiError';

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-tipo-impuesto',
  styleUrls: ['../../shared/crud.css', './tipo-impuesto.css'],
  templateUrl: './tipo-impuesto.html',
})
export class TipoImpuesto implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly taxes = signal<TipoImpuestoModel[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Control del cuadro (modal) para insertar o editar
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  // Datos del formulario
  form: TipoImpuestoModel = this.emptyTax();

  constructor(private tiposImpuestoService: TiposImpuestoService) {}

  ngOnInit(): void {
    this.loadTaxes();
  }

  loadTaxes(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.tiposImpuestoService.findAll().subscribe({
      next: (data) => {
        this.taxes.set(data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.form = this.emptyTax();
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(tax: TipoImpuestoModel): void {
    this.form = { ...tax };
    this.isEditing.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  // Si estamos editando usa el SP ActualizarTipoImpuesto, si no el SP InsertarTipoImpuesto
  save(): void {
    this.saving.set(true);
    this.formError.set('');

    if (this.isEditing() && this.form.idImpuesto) {
      this.tiposImpuestoService.update(this.form.idImpuesto, this.form).subscribe({
        next: () => this.afterSave('Tipo de impuesto actualizado correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    } else {
      this.tiposImpuestoService.insertarTipo(this.form).subscribe({
        next: () => this.afterSave('Tipo de impuesto insertado correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    }
  }

  // Borrado lógico con el SP DesactivarTipoImpuesto
  deactivate(tax: TipoImpuestoModel): void {
    if (!tax.idImpuesto) return;
    if (!confirm(`¿Desea inactivar el impuesto "${tax.descripcion}"?`)) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.tiposImpuestoService.delete(tax.idImpuesto).subscribe({
      next: () => {
        this.successMessage.set('Tipo de impuesto inactivado correctamente.');
        this.loadTaxes();
      },
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  private afterSave(message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.successMessage.set(message);
    this.loadTaxes();
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  private emptyTax(): TipoImpuestoModel {
    return { tarifa: '', descripcion: '', porcentaje: 0, estado: 'A' };
  }
}
