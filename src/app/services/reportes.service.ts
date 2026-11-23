import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReporteAuditoria, ReporteCliente, ReporteFactura, ReporteSeguridad } from '../models/Reportes';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = `${environment.API_URL}reportes`;

  constructor(private http: HttpClient) {}

  // Las fechas se envían como texto yyyy-MM-dd
  reporteClientes(desde: string, hasta: string, estado: string): Observable<ReporteCliente[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta).set('estado', estado);
    return this.http
      .get<ReporteCliente[]>(`${this.apiUrl}/clientes`, { params })
      .pipe(catchError(this.manejarError));
  }

  reporteFacturas(desde: string, hasta: string): Observable<ReporteFactura[]> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return this.http
      .get<ReporteFactura[]>(`${this.apiUrl}/facturas`, { params })
      .pipe(catchError(this.manejarError));
  }

  // usuario vacío = todos los usuarios
  reporteAuditoria(desde: string, hasta: string, usuario: string): Observable<ReporteAuditoria[]> {
    let params = new HttpParams().set('desde', desde).set('hasta', hasta);
    if (usuario) {
      params = params.set('usuario', usuario);
    }
    return this.http
      .get<ReporteAuditoria[]>(`${this.apiUrl}/auditoria`, { params })
      .pipe(catchError(this.manejarError));
  }

  // usuario vacío = todos los usuarios
  reporteSeguridad(usuario: string): Observable<ReporteSeguridad[]> {
    let params = new HttpParams();
    if (usuario) {
      params = params.set('usuario', usuario);
    }
    return this.http
      .get<ReporteSeguridad[]>(`${this.apiUrl}/seguridad`, { params })
      .pipe(catchError(this.manejarError));
  }

  // Convierte la respuesta de error del backend ({ "error": "..." }) en un ApiError.
  private manejarError = (error: HttpErrorResponse): Observable<never> => {
    let mensaje: string;
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.error?.error) {
      mensaje = error.error.error;
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
