import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/authservice.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginCredentials } from '../../models/LoginCredentials';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  credentials: LoginCredentials = { username: '', password: '' };
  errorMessage: string = '';
  readonly loading = signal(false);
  readonly showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (this.loading() || !this.credentials.username || !this.credentials.password) return;
    this.errorMessage = '';
    this.loading.set(true);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        // Éxito
        this.loading.set(false);
        this.authService.guardarSesion(res.username, res.idBitacora);
        this.router.navigate(['/layout']);
      },
      error: (err) => {
        this.loading.set(false);
        // Si viene un string simple en err.error o un mensaje estructurado
        if (err.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que esté en ejecución.';
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.mensaje) {
          this.errorMessage = err.error.mensaje;
        } else {
          this.errorMessage = 'Ocurrió un error al intentar conectar con el servidor';
        }
      }
    });
  }
}
