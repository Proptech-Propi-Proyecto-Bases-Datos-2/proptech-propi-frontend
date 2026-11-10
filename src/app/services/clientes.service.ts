import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, ClienteResponse, MensajeResponse } from '../models/Cliente';
import { ClienteCifrado } from '../models/ClienteCifrado';
import { ApiError } from '../models/ApiError';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = `${environment.API_URL}clientes`;

  constructor(private http: HttpClient) {}

  insertarCliente(cliente: Cliente): Observable<ClienteResponse> {
    return this.http
      .post<ClienteResponse>(`${this.apiUrl}/insertarCliente`, cliente)
      .pipe(catchError(this.manejarError));
  }

  listarClientes(estado?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http
      .get<Cliente[]>(this.apiUrl, { params })
      .pipe(catchError(this.manejarError));
  }

  listarClientesCifrados(): Observable<ClienteCifrado[]> {
    return this.http
      .get<ClienteCifrado[]>(`${this.apiUrl}/cifrados`)
      .pipe(catchError(this.manejarError));
  }

  getClienteById(id: number): Observable<Cliente> {
    return this.http
      .get<Cliente>(`${this.apiUrl}/id/${id}`)
      .pipe(catchError(this.manejarError));
  }

  updateCliente(id: number, cliente: Cliente): Observable<ClienteResponse> {
    return this.http
      .put<ClienteResponse>(`${this.apiUrl}/id/${id}`, cliente)
      .pipe(catchError(this.manejarError));
  }

  desactivarCliente(id: number): Observable<MensajeResponse> {
    return this.http
      .delete<MensajeResponse>(`${this.apiUrl}/id/${id}`)
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
      mensaje = 'Cliente no encontrado.';
    } else {
      mensaje = `Error inesperado del servidor (${error.status}).`;
    }
    const apiError: ApiError = { status: error.status, mensaje };
    return throwError(() => apiError);
  };
}
