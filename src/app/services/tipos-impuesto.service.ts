import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoImpuesto } from '../models/TipoImpuesto';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class TiposImpuestoService {
  private apiUrl = `${environment.API_URL}tipos-impuestos`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<TipoImpuesto[]> {
    return this.http
      .get<TipoImpuesto[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  findById(id: number): Observable<TipoImpuesto> {
    return this.http
      .get<TipoImpuesto>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  save(value: TipoImpuesto): Observable<TipoImpuesto> {
    return this.http
      .post<TipoImpuesto>(this.apiUrl, value)
      .pipe(catchError(this.manejarError));
  }

  // Inserta usando el procedimiento almacenado del backend.
  insertarTipo(value: TipoImpuesto): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/insertarTipo`, value)
      .pipe(catchError(this.manejarError));
  }

  update(id: number, value: TipoImpuesto): Observable<TipoImpuesto> {
    return this.http
      .put<TipoImpuesto>(`${this.apiUrl}/${id}`, value)
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
      mensaje = 'Tipo de impuesto no encontrado.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
