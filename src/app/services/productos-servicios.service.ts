import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductoServicio } from '../models/ProductoServicio';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class ProductosServiciosService {
  private apiUrl = `${environment.API_URL}productos-servicios`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<ProductoServicio[]> {
    return this.http
      .get<ProductoServicio[]>(this.apiUrl)
      .pipe(catchError(this.manejarError));
  }

  findById(id: number): Observable<ProductoServicio> {
    return this.http
      .get<ProductoServicio>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.manejarError));
  }

  save(value: ProductoServicio): Observable<ProductoServicio> {
    return this.http
      .post<ProductoServicio>(this.apiUrl, value)
      .pipe(catchError(this.manejarError));
  }

  // Inserta usando el procedimiento almacenado del backend.
  insertarProducto(value: ProductoServicio): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/insertarProducto`, value)
      .pipe(catchError(this.manejarError));
  }

  update(id: number, value: ProductoServicio): Observable<ProductoServicio> {
    return this.http
      .put<ProductoServicio>(`${this.apiUrl}/${id}`, value)
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
      mensaje = 'Producto o servicio no encontrado.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
