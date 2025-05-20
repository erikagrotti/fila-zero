import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { AgendamentoConsultaComponent } from './pages/agendamento-consulta/agendamento-consulta.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'home', component: HomeComponent },
    { path: 'agendar-consulta', component: AgendamentoConsultaComponent },
    { path: 'minhas-consultas', loadComponent: () => import('./pages/minhas-consultas/minhas-consultas.component').then(m => m.MinhasConsultasComponent) },
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' }
];
