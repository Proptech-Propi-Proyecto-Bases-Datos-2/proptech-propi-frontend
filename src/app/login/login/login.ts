import { Component } from '@angular/core';
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

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        // Éxito
        this.authService.guardarSesion(res.username, res.idBitacora);
        this.router.navigate(['/layout']);
      },
      error: (err) => {
        // Si viene un string simple en err.error o un mensaje estructurado
        if (typeof err.error === 'string') {
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
