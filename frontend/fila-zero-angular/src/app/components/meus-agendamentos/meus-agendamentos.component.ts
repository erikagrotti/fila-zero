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
  successMessage = '';
  
  // Modal de confirmação
  showConfirmModal = false;
  agendamentoParaCancelar: Agendamento | null = null;
  
  // Modal de sucesso
  showSuccessModal = false;
  agendamentoCancelado: string = '';

  constructor(private agendamentoService: AgendamentoService) { }

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    this.loading = true;
    this.agendamentoService.listarAgendamentos().subscribe({
      next: (agendamentos: Agendamento[]) => {
        this.agendamentos = agendamentos;
        this.loading = false;
      },
      error: (error: any) => {
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
  
  // Abre o modal de confirmação para cancelar agendamento
  confirmarCancelamento(agendamento: Agendamento): void {
    this.agendamentoParaCancelar = agendamento;
    this.showConfirmModal = true;
  }
  
  // Fecha o modal de confirmação
  fecharModalConfirmacao(): void {
    this.showConfirmModal = false;
    this.agendamentoParaCancelar = null;
  }
  
  // Fecha o modal de sucesso
  fecharModalSucesso(): void {
    this.showSuccessModal = false;
  }
  
  // Executa o cancelamento do agendamento
  cancelarAgendamento(): void {
    if (!this.agendamentoParaCancelar) return;
    
    this.loading = true;
    const agendamentoId = this.agendamentoParaCancelar.id;
    const dataHoraConsulta = this.formatarDataHora(
      this.agendamentoParaCancelar.data_consulta_data, 
      this.agendamentoParaCancelar.data_consulta_hora
    );
    
    this.agendamentoService.cancelarAgendamento(agendamentoId).subscribe({
      next: () => {
        // Fechar modal de confirmação
        this.showConfirmModal = false;
        
        // Guardar informação do agendamento cancelado
        this.agendamentoCancelado = dataHoraConsulta;
        
        // Mostrar modal de sucesso
        this.showSuccessModal = true;
        
        // Recarregar a lista de agendamentos
        this.carregarAgendamentos();
        
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.error?.detail || 'Erro ao cancelar agendamento. Por favor, tente novamente.';
        this.showConfirmModal = false;
        this.loading = false;
      }
    });
  }
}