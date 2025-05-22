import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AgendamentoService } from '../../services/agendamento.service';
import { Agendamento } from '../../models/agendamento.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './meus-agendamentos.component.html',
  styleUrls: ['./meus-agendamentos.component.scss']
})
export class MeusAgendamentosComponent implements OnInit {
  agendamentos: Agendamento[] = [];
  loading = false;
  errorMessage = '';

  constructor(private agendamentoService: AgendamentoService) { }

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    this.loading = true;
    this.agendamentoService.listarAgendamentos().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar agendamentos. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  formatarDataHora(data: string, hora: string): string {
    if (!data || !hora) return '';
    
    try {
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano} às ${hora.substring(0, 5)}`; // Formata como DD/MM/YYYY às HH:MM
    } catch (error) {
      console.error('Erro ao formatar data e hora:', error);
      return '';
    }
  }
}