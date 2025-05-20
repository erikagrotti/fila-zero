import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName: string = 'Usuário';
  
  // Cards de funcionalidades
  cards = [
    {
      title: 'Agendar Consulta',
      description: 'Agende sua consulta com nossos especialistas',
      icon: 'calendar_today',
      route: '/agendar-consulta'
    },
    {
      title: 'Minhas Consultas',
      description: 'Visualize suas consultas agendadas',
      icon: 'list_alt',
      route: '/minhas-consultas'
    },
    {
      title: 'Histórico Médico',
      description: 'Acesse seu histórico de atendimentos',
      icon: 'history',
      route: '/historico'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Aqui você pode buscar informações do usuário logado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userName = user.username || 'Usuário';
      } catch (e) {
        console.error('Erro ao processar dados do usuário:', e);
      }
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}