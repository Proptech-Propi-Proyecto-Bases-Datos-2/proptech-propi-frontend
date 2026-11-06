import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/AuthResponse';
import { LoginCredentials } from '../models/LoginCredentials';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}auth`;
    
  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Guardar identificadores de la sesión en LocalStorage
        localStorage.setItem('username', response.username);
        localStorage.setItem('password', credentials.password);
        localStorage.setItem('id_bitacora', response.idBitacora.toString());
      })
    );
  }

  guardarSesion(username: string, idBitacora: number): void {
    localStorage.setItem('username', username);
    localStorage.setItem('id_bitacora', idBitacora.toString());
  }

  // Método complementario para obtener el usuario activo
  obtenerUsuario(): string | null {
    return localStorage.getItem('username');
  }

  logout(): Observable<any> {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    const idBitacora = Number(localStorage.getItem('id_bitacora'));

    const payload = {
      idBitacora: idBitacora,
      username: username,
      password: password
    };

    return this.http.post(`${this.apiUrl}/logout`, payload).pipe(
      tap(() => {
        // Limpiar la sesión en el navegador tras registrar la salida
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('id_bitacora');
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('id_bitacora');
  }
}