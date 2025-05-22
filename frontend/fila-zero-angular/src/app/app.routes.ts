import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { AgendamentoComponent } from './components/agendamento/agendamento.component';
import { MeusAgendamentosComponent } from './components/meus-agendamentos/meus-agendamentos.component';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [loginGuard]
  },
  { 
    path: 'home', 
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'agendamento',
    component: AgendamentoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'meus-agendamentos',
    component: MeusAgendamentosComponent,
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];