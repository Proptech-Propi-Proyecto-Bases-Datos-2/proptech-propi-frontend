import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura } from '../models/Factura';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class FacturasService {
  private apiUrl = `${environment.API_URL}facturas`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Factura[]> {
    return this.http
      .get<Factura[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  findById(id: number): Observable<Factura> {
    return this.http
      .get<Factura>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  save(value: Factura): Observable<Factura> {
    return this.http
      .post<Factura>(this.apiUrl, value)
      .pipe(catchError(this.manejarError));
  }

  update(id: number, value: Factura): Observable<Factura> {
    return this.http
      .put<Factura>(`${this.apiUrl}/${id}`, value)
      .pipe(catchError(this.manejarError));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
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
      mensaje = 'Factura no encontrada.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
