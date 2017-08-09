import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { Login } from './core/login/login.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  //{ path: '**', redirectTo: 'pages/location' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });
