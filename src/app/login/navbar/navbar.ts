import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice.service';
import { NgIf } from '../../../../node_modules/@angular/common/types/_common_module-chunk';
@Component({
  selector: 'app-navbar',
  template: `
    <nav *ngIf="authService.isLoggedIn()">
      <button (click)="onLogout()">Cerrar Sesión</button>
    </nav>
  `,
  imports: [NgIf]
})

export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        alert('Cierre de sesión registrado en la bitácora.');
        this.router.navigate(['/login']);
      },
      error: () => {
        // En caso de fallo de red, se limpia la sesión localmente
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}