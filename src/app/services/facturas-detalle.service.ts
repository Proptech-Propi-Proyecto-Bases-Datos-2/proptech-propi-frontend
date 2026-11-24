import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { FacturaDetalle } from '../models/FacturaDetalle';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class FacturasDetalleService {
  private apiUrl = `${environment.API_URL}facturas-detalle`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<FacturaDetalle[]> {
    return this.http
      .get<FacturaDetalle[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  findById(id: number): Observable<FacturaDetalle> {
    return this.http
      .get<FacturaDetalle>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  save(value: FacturaDetalle): Observable<FacturaDetalle> {
    return this.http
      .post<FacturaDetalle>(this.apiUrl, value)
      .pipe(catchError(this.manejarError));
  }

  // Inserta una línea con el SP InsertarFacturaDetalle.
  insertarDetalle(value: FacturaDetalle): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/insertarDetalle`, value)
      .pipe(catchError(this.manejarError));
  }

  update(id: number, value: FacturaDetalle): Observable<FacturaDetalle> {
    return this.http
      .put<FacturaDetalle>(`${this.apiUrl}/${id}`, value)
      .pipe(catchError(this.manejarError));
  }

  // Convierte la respuesta de error del backend ({ "error": "..." }) en un ApiError.
  private manejarError = (error: HttpErrorResponse): Observable<never> => {
    let mensaje: string;
    if (error.status === 0) {
      mensaje = 'No se pudo conectar con el servidor.';
    } else if (error.error?.error) {
      mensaje = error.error.error;
    } else if (error.status === 404) {
      mensaje = 'Detalle de factura no encontrado.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
