import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, Rol } from '../models/AuthResponse';
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
        // Guardar la sesión en LocalStorage (nunca la contraseña)
        localStorage.setItem('username', response.username);
        localStorage.setItem('rol', response.rol);
        localStorage.setItem('token', response.token);
        localStorage.setItem('id_bitacora', response.idBitacora.toString());
      })
    );
  }

  // Método complementario para obtener el usuario activo
  obtenerUsuario(): string | null {
    return localStorage.getItem('username');
  }

  obtenerRol(): Rol | null {
    return localStorage.getItem('rol') as Rol | null;
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // El token viaja en el encabezado Authorization (lo agrega authInterceptor)
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      // Limpiar la sesión en el navegador aunque falle el registro de salida
      finalize(() => this.limpiarSesion())
    );
  }

  limpiarSesion(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    localStorage.removeItem('id_bitacora');
    localStorage.removeItem('password'); // por si quedó de una versión anterior
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !!localStorage.getItem('rol');
  }
}
