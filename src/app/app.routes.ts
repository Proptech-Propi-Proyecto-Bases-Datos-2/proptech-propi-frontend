import { Routes } from '@angular/router';
import { Login } from './login/login/login';
import { Layout } from './layout/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'layout', component: Layout },
  { path: '**', redirectTo: 'login' },
];
