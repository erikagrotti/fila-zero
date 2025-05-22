import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { AgendamentoService } from '../../services/agendamento.service';
import { Agendamento } from '../../models/agendamento.model';

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
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

  formatarDataHora(dataHora: string): string {
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}