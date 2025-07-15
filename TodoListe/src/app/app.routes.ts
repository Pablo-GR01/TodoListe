import { Routes } from '@angular/router';
import { Login } from '../login/login';
import { Dashboard } from '../dashboard/dashboard';
import { Register } from '../register/register';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ou 'inscription'
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'register', component: Register },
  
];
