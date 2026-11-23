import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authservice.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavigationItem {
  path: string;
  label: string;
  title: string;
  icon: string[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  imports: [RouterLink, RouterLinkActive],
})

export class NavbarComponent {
  readonly menuOpen = signal(false);
  readonly loggingOut = signal(false);
  readonly items: NavigationItem[] = [
    {
      path: '/layout',
      label: 'Inicio',
      title: 'Inicio',
      icon: ['M3 11.5 12 4l9 7.5', 'M5.5 10v9h13v-9', 'M9.5 19v-5h5v5'],
    },
    {
      path: '/layout/facturas',
      label: 'Facturas',
      title: 'Facturas',
      icon: ['M6 3h12v18H6z', 'M9 8h6M9 12h6M9 16h4'],
    },
    {
      path: '/layout/factura-detalle',
      label: 'Factura detalle',
      title: 'Factura detalle',
      icon: ['M5 4h14v16H5z', 'M8 8h8M8 12h8M8 16h5'],
    },
    {
      path: '/layout/productos-servicios',
      label: 'Productos y servicios',
      title: 'Productos y servicios',
      icon: ['M4 7h16v13H4z', 'M8 7V5h8v2', 'M8 12h8'],
    },
    {
      path: '/layout/tipos-impuestos',
      label: 'Tipos de impuestos',
      title: 'Tipos de impuestos',
      icon: ['M5 4h14v16H5z', 'M8 9h8M8 13h8M8 17h5'],
    },
    {
      path: '/layout/notas-credito-debito',
      label: 'Notas crédito/débito',
      title: 'Notas crédito y débito',
      icon: ['M4 5h16v14H4z', 'M8 10h8M8 14h5'],
    },
    {
      path: '/layout/clientes',
      label: 'Clientes',
      title: 'Clientes',
      icon: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M4 21a8 8 0 0 1 16 0'],
    },
    {
      path: '/layout/reportes',
      label: 'Reportes',
      title: 'Reportes',
      icon: ['M4 20h16', 'M7 16V10', 'M12 16V5', 'M17 16v-8'],
    },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  get username(): string {
    return this.authService.obtenerUsuario() ?? '';
  }

  get initials(): string {
    return this.username
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onLogout(): void {
    if (this.loggingOut()) return;

    this.loggingOut.set(true);
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