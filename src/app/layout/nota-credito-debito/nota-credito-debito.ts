import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService } from '../../services/facturas.service';
import { NotasCreditoDebitoService } from '../../services/notas-credito-debito.service';
import { Factura } from '../../models/Factura';
import { NotaCreditoDebito as NotaModel } from '../../models/NotaCreditoDebito';
import { ApiError } from '../../models/ApiError';

// Fila de la tabla: la nota junto con los datos de su factura
interface NoteRow {
  idFactura: number;
  clientName: string;
  invoiceTotal: number;
  note: NotaModel;
}

@Component({
  imports: [FormsModule, DatePipe, DecimalPipe],
  selector: 'app-nota-credito-debito',
  styleUrls: ['../../shared/crud.css', './nota-credito-debito.css'],
  templateUrl: './nota-credito-debito.html',
})
export class NotaCreditoDebito implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly rows = signal<NoteRow[]>([]);
  readonly invoices = signal<Factura[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Control del cuadro (modal) para insertar o editar
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  // Datos del formulario
  form: NotaModel = this.emptyNote();
  formInvoiceId = 0;

  constructor(
    private facturasService: FacturasService,
    private notasService: NotasCreditoDebitoService,
  ) {}

  ngOnInit(): void {
    this.loadRows();
  }

  // El backend no devuelve la factura de cada nota, por eso se arma la lista desde las facturas
  loadRows(): void {
    this.loading.set(true);
    this.facturasService.findAll().subscribe({
      next: (data) => {
        const list: NoteRow[] = [];
        for (const invoice of data) {
          for (const note of invoice.notas ?? []) {
            list.push({
              idFactura: invoice.idFactura ?? 0,
              clientName: invoice.cliente.nombre ?? '',
              invoiceTotal: invoice.montoTotal,
              note,
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
      },
    });
  }

  openCreate(): void {
    this.form = this.emptyNote();
    this.formInvoiceId = 0;
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  openEdit(row: NoteRow): void {
    this.form = { ...row.note };
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
    if (!this.formInvoiceId) {
      this.formError.set('Debe seleccionar la factura.');
      return;
    }

    this.saving.set(true);
    const body: NotaModel = {
      idNota: this.form.idNota,
      factura: { idFactura: Number(this.formInvoiceId) },
      fecha: this.form.fecha,
      tipo: this.form.tipo,
      motivo: this.form.motivo,
      montoTotal: this.form.montoTotal,
    };

    if (this.isEditing() && this.form.idNota) {
      this.notasService.update(this.form.idNota, body).subscribe({
        next: () => this.afterSave('Nota actualizada correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    } else {
      // La nota nueva se crea con el SP CrearNota (valida que el crédito no supere la factura)
      this.notasService.insertarNota(body).subscribe({
        next: () => this.afterSave('Nota registrada correctamente.'),
        error: (err: ApiError) => this.showFormError(err),
      });
    }
  }

  // Eliminar es un borrado físico de la nota
  remove(row: NoteRow): void {
    if (!row.note.idNota) return;
    if (!confirm(`¿Desea eliminar la nota #${row.note.idNota} de la factura #${row.idFactura}?`)) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.notasService.delete(row.note.idNota).subscribe({
      next: () => {
        this.successMessage.set('Nota eliminada correctamente.');
        this.loadRows();
      },
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  private afterSave(message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.errorMessage.set('');
    this.successMessage.set(message);
    this.loadRows();
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  private emptyNote(): NotaModel {
    return { tipo: 'Credito', motivo: '', montoTotal: 0 };
  }
}
