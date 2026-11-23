import { Component, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../services/reportes.service';
import { ReporteAuditoria, ReporteCliente, ReporteFactura, ReporteSeguridad } from '../../models/Reportes';
import { ApiError } from '../../models/ApiError';

// Los 4 reportes del REQ 007
type ReportType = 'clientes' | 'facturas' | 'auditoria' | 'seguridad';

@Component({
  imports: [FormsModule, DatePipe, DecimalPipe],
  selector: 'app-reporte',
  styleUrls: ['../../shared/crud.css', './reporte.css'],
  templateUrl: './reporte.html',
})
export class Reporte {
  // Botones de arriba para escoger el reporte
  readonly reportTabs: { id: ReportType; label: string }[] = [
    { id: 'clientes', label: 'Clientes resumido' },
    { id: 'facturas', label: 'Facturas' },
    { id: 'auditoria', label: 'Pistas de auditoría' },
    { id: 'seguridad', label: 'Configuración de seguridad' },
  ];

  // Opciones de los filtros de usuario.
  // La auditoría guarda el LOGIN (SUSER_SNAME) y el reporte de seguridad usa el USUARIO de la base de datos.
  readonly auditUsers = ['login_admin', 'login_digitador', 'login_consulta'];
  readonly securityUsers = ['user_admin', 'user_digitador', 'user_consulta'];

  // Angular 22 usa OnPush por defecto: lo que cambia con las respuestas del backend va en signals
  readonly activeReport = signal<ReportType>('clientes');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  // Indica si ya se generó el reporte actual (para mostrar "sin resultados")
  readonly generated = signal(false);

  readonly clients = signal<ReporteCliente[]>([]);
  readonly invoices = signal<ReporteFactura[]>([]);
  readonly audits = signal<ReporteAuditoria[]>([]);
  readonly permissions = signal<ReporteSeguridad[]>([]);

  // Sumas que se muestran al final del reporte de facturas
  readonly invoiceTotals = computed(() => {
    let subtotal = 0;
    let taxes = 0;
    let total = 0;
    for (const f of this.invoices()) {
      subtotal += f.subtotal;
      taxes += f.totalImpuestos;
      total += f.montoTotal;
    }
    return { subtotal, taxes, total };
  });

  // Filtros (se llenan con lo que escoge el usuario)
  dateFrom = this.firstDayOfYear();
  dateTo = this.today();
  clientState = 'T';
  auditUser = '';
  securityUser = '';

  constructor(private reportesService: ReportesService) {}

  selectReport(report: ReportType): void {
    this.activeReport.set(report);
    this.errorMessage.set('');
    this.generated.set(false);
  }

  // Llama al endpoint del reporte escogido con sus filtros
  generate(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.generated.set(false);

    switch (this.activeReport()) {
      case 'clientes':
        this.reportesService.reporteClientes(this.dateFrom, this.dateTo, this.clientState).subscribe({
          next: (data) => this.showResult(() => this.clients.set(data)),
          error: (err: ApiError) => this.showError(err),
        });
        break;
      case 'facturas':
        this.reportesService.reporteFacturas(this.dateFrom, this.dateTo).subscribe({
          next: (data) => this.showResult(() => this.invoices.set(data)),
          error: (err: ApiError) => this.showError(err),
        });
        break;
      case 'auditoria':
        this.reportesService.reporteAuditoria(this.dateFrom, this.dateTo, this.auditUser).subscribe({
          next: (data) => this.showResult(() => this.audits.set(data)),
          error: (err: ApiError) => this.showError(err),
        });
        break;
      case 'seguridad':
        this.reportesService.reporteSeguridad(this.securityUser).subscribe({
          next: (data) => this.showResult(() => this.permissions.set(data)),
          error: (err: ApiError) => this.showError(err),
        });
        break;
    }
  }

  // Cantidad de filas del reporte que se está viendo
  get rowCount(): number {
    switch (this.activeReport()) {
      case 'clientes':
        return this.clients().length;
      case 'facturas':
        return this.invoices().length;
      case 'auditoria':
        return this.audits().length;
      default:
        return this.permissions().length;
    }
  }

  // Descarga el reporte actual en un archivo CSV que se abre en Excel
  exportCsv(): void {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    switch (this.activeReport()) {
      case 'clientes':
        headers = ['Nombre', 'Identificación', 'Actividad económica', 'Correo', 'Teléfono'];
        rows = this.clients().map((c) => [
          c.nombre, c.numIdentificacion, c.actividadEconomica, c.correoElectronico, c.telefono,
        ]);
        break;
      case 'facturas':
        headers = ['Cliente', 'Identificación', 'Actividad económica', 'N.º factura', 'Fecha', 'Subtotal', 'Impuestos', 'Total'];
        rows = this.invoices().map((f) => [
          f.nombreCliente, f.numIdentificacion, f.actividadEconomica, f.numeroFactura,
          f.fechaFactura, f.subtotal, f.totalImpuestos, f.montoTotal,
        ]);
        break;
      case 'auditoria':
        headers = ['Fecha', 'Acción', 'Usuario', 'Tabla', 'Llave', 'Datos afectados'];
        rows = this.audits().map((a) => [
          a.fecRegistro, a.accion, a.nombreUsuario, a.tablaAfectada, a.llaveRegistro, a.datosAfectados,
        ]);
        break;
      case 'seguridad':
        headers = ['Usuario', 'Rol', 'Objeto', 'Tipo de objeto', 'Permiso', 'Estado'];
        rows = this.permissions().map((p) => [
          p.nombreUsuario, p.rol, p.nombreObjeto, p.tipoObjeto, p.tipoPermiso, p.estadoPermiso,
        ]);
        break;
    }

    // Cada valor va entre comillas y separado con ; para que Excel en español lo abra bien
    const lines = [headers, ...rows].map((row) =>
      row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';'),
    );
    // El ﻿ al inicio hace que Excel lea bien las tildes
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-${this.activeReport()}-${this.today()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private showResult(saveData: () => void): void {
    saveData();
    this.loading.set(false);
    this.generated.set(true);
  }

  private showError(err: ApiError): void {
    this.errorMessage.set(err.mensaje);
    this.loading.set(false);
  }

  // Fecha de hoy en formato yyyy-MM-dd (el que usa el input de tipo date)
  private today(): string {
    return this.formatDate(new Date());
  }

  private firstDayOfYear(): string {
    return `${new Date().getFullYear()}-01-01`;
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
