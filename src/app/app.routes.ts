import { Routes } from '@angular/router';
import { Login } from './login/login/login';
import { Inicio } from './layout/inicio/inicio';
import { Cliente } from './layout/cliente/cliente';
import { Factura } from './layout/factura/factura';
import { FacturaDetalle } from './layout/factura-detalle/factura-detalle';
import { NotaCreditoDebito } from './layout/nota-credito-debito/nota-credito-debito';
import { ProductoServicio } from './layout/producto-servicio/producto-servicio';
import { TipoImpuesto } from './layout/tipo-impuesto/tipo-impuesto';
import { Reporte } from './layout/reporte/reporte';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'layout',
    component: Inicio,
    children: [
      { path: 'facturas', component: Factura },
      { path: 'factura-detalle', component: FacturaDetalle },
      { path: 'productos-servicios', component: ProductoServicio },
      { path: 'tipos-impuestos', component: TipoImpuesto },
      { path: 'notas-credito-debito', component: NotaCreditoDebito },
      { path: 'clientes', component: Cliente },
      { path: 'reportes', component: Reporte },
    ],
  },
  { path: 'facturas', redirectTo: 'layout/facturas', pathMatch: 'full' },
  { path: 'factura-detalle', redirectTo: 'layout/factura-detalle', pathMatch: 'full' },
  { path: 'productos-servicios', redirectTo: 'layout/productos-servicios', pathMatch: 'full' },
  { path: 'tipos-impuestos', redirectTo: 'layout/tipos-impuestos', pathMatch: 'full' },
  { path: 'notas-credito-debito', redirectTo: 'layout/notas-credito-debito', pathMatch: 'full' },
  { path: 'clientes', redirectTo: 'layout/clientes', pathMatch: 'full' },
  { path: 'reportes', redirectTo: 'layout/reportes', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
