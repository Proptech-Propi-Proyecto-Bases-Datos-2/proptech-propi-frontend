import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotaCreditoDebito } from '../models/NotaCreditoDebito';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class NotasCreditoDebitoService {
  private apiUrl = `${environment.API_URL}notas-credito-debito`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<NotaCreditoDebito[]> {
    return this.http
      .get<NotaCreditoDebito[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  findById(id: number): Observable<NotaCreditoDebito> {
    return this.http
      .get<NotaCreditoDebito>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  save(value: NotaCreditoDebito): Observable<NotaCreditoDebito> {
    return this.http
      .post<NotaCreditoDebito>(this.apiUrl, value)
      .pipe(catchError(this.manejarError));
  }

  // Inserta usando el procedimiento almacenado del backend.
  insertarNota(value: NotaCreditoDebito): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/insertarNota`, value)
      .pipe(catchError(this.manejarError));
  }

  update(id: number, value: NotaCreditoDebito): Observable<NotaCreditoDebito> {
    return this.http
      .put<NotaCreditoDebito>(`${this.apiUrl}/${id}`, value)
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
      mensaje = 'Nota de crédito/débito no encontrada.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
