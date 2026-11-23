import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../services/clientes.service';
import { Cliente as ClienteModel } from '../../models/Cliente';
import { ApiError } from '../../models/ApiError';

@Component({
  imports: [FormsModule, DatePipe],
  selector: 'app-cliente',
  styleUrls: ['../../shared/crud.css', './cliente.css'],
  templateUrl: './cliente.html',
})
export class Cliente implements OnInit {
  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly clients = signal<ClienteModel[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  // Control del cuadro (modal) para insertar o editar
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  // Datos del formulario (se llenan con lo que escribe el usuario)
  form: ClienteModel = this.emptyClient();
  // Filtro por estado: '' = todos, 'A' = activos, 'I' = inactivos
  stateFilter = '';

  constructor(private clientesService: ClientesService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  // Trae los clientes del backend (ya vienen descifrados por el SP ConsultarClientes)
  loadClients(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.clientesService.listarClientes(this.stateFilter).subscribe({
      next: (data) => {
        this.clients.set(data);
        this.loading.set(false);
      },
      error: (err: ApiError) => {
        this.errorMessage.set(err.mensaje);
        this.loading.set(false);
      },
    });
  }

  // Abre el cuadro vacío para insertar un cliente nuevo
  openCreate(): void {
    this.form = this.emptyClient();
    this.isEditing.set(false);
    this.formError.set('');
    this.showForm.set(true);
  }

  // Abre el cuadro con los datos de la fila para editarla
  openEdit(client: ClienteModel): void {
    this.form = { ...client };
    this.isEditing.set(true);
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  // Guarda: si estamos editando usa el SP ActualizarCliente, si no el SP InsertarCliente
  save(): void {
    this.saving.set(true);
    this.formError.set('');

    if (this.isEditing() && this.form.idCliente) {
      this.clientesService.updateCliente(this.form.idCliente, this.form).subscribe({
        next: (res) => this.afterSave(res.mensaje),
        error: (err: ApiError) => this.showFormError(err),
      });
    } else {
      this.clientesService.insertarCliente(this.form).subscribe({
        next: (res) => this.afterSave(res.mensaje),
        error: (err: ApiError) => this.showFormError(err),
      });
    }
  }

  // Borrado lógico: el SP DesactivarCliente cambia el estado a 'I'
  deactivate(client: ClienteModel): void {
    if (!client.idCliente) return;
    if (!confirm(`¿Desea inactivar al cliente "${client.nombre}"?`)) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.clientesService.desactivarCliente(client.idCliente).subscribe({
      next: (res) => {
        this.successMessage.set(res.mensaje);
        this.loadClients();
      },
      error: (err: ApiError) => this.errorMessage.set(err.mensaje),
    });
  }

  private afterSave(message: string): void {
    this.saving.set(false);
    this.showForm.set(false);
    this.successMessage.set(message);
    this.loadClients();
  }

  private showFormError(err: ApiError): void {
    this.saving.set(false);
    this.formError.set(err.mensaje);
  }

  private emptyClient(): ClienteModel {
    return {
      nombre: '',
      numIdentificacion: '',
      tipoIdentificacion: 'Física',
      provincia: '',
      canton: '',
      distrito: '',
      barrio: '',
      direccionExacta: '',
      profesion: '',
      actividadEconomica: '',
      correoElectronico: '',
      telefono: '',
      estado: 'A',
    };
  }
}
