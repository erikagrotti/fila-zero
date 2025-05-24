import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Agendamento } from '../../models/agendamento.model';
import { AgendamentoComFila, FilaService } from '../../services/fila.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fila',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './fila.component.html',
  styleUrls: ['./fila.component.scss']
})
export class FilaComponent implements OnInit {
  agendamentosHoje: AgendamentoComFila[] = [];
  loading: boolean = true;
  error: string = '';
  showCheckingModal: boolean = false;
  selectedAgendamento: AgendamentoComFila | null = null;
  tipoFilaSelecionado: string = 'comum';
  processandoChecking: boolean = false;
  successMessage: string = '';

  constructor(private filaService: FilaService) {}

  ngOnInit(): void {
    this.carregarAgendamentosHoje();
  }

  carregarAgendamentosHoje(): void {
    this.loading = true;
    this.filaService.getAgendamentosHoje().subscribe({
      next: (agendamentos: AgendamentoComFila[]) => {
        this.agendamentosHoje = agendamentos;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = 'Erro ao carregar agendamentos. Por favor, tente novamente.';
        this.loading = false;
        console.error('Erro ao carregar agendamentos:', error);
      }
    });
  }

  formatarHora(hora: string): string {
    if (!hora) return '';
    
    try {
      // Retorna apenas HH:MM
      return hora.substring(0, 5);
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return '';
    }
  }

  abrirModalChecking(agendamento: AgendamentoComFila): void {
    this.selectedAgendamento = agendamento;
    this.tipoFilaSelecionado = 'comum';
    this.showCheckingModal = true;
  }

  fecharModalChecking(): void {
    this.showCheckingModal = false;
    this.selectedAgendamento = null;
    this.tipoFilaSelecionado = 'comum';
  }

  realizarChecking(): void {
    if (!this.selectedAgendamento) return;
    
    this.processandoChecking = true;
    this.error = '';
    
    this.filaService.realizarChecking(this.selectedAgendamento.id, this.tipoFilaSelecionado).subscribe({
      next: (fila) => {
        this.processandoChecking = false;
        
        // Atualizar o status do agendamento na lista
        if (this.selectedAgendamento) {
          this.selectedAgendamento.status = 'aguardando';
          this.selectedAgendamento.fila = fila;
        }
        
        // Fechar o modal de checking
        this.fecharModalChecking();
        
        // Mostrar alerta de sucesso
        this.mostrarAlerta(
          'Check-in Realizado!', 
          'Você entrou na fila com sucesso!', 
          'success'
        );
      },
      error: (error) => {
        this.processandoChecking = false;
        this.mostrarAlerta(
          'Erro', 
          error.error?.detail || 'Erro ao realizar check-in. Por favor, tente novamente.', 
          'error'
        );
        console.error('Erro ao realizar check-in:', error);
      }
    });
  }

  showConfirmModal: boolean = false;
  agendamentoParaAbandonar: AgendamentoComFila | null = null;
  showAlertModal: boolean = false;
  alertTitle: string = '';
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'info' = 'info';

  abrirModalAbandonarFila(agendamento: AgendamentoComFila): void {
    this.agendamentoParaAbandonar = agendamento;
    this.showConfirmModal = true;
  }

  fecharModalAbandonarFila(): void {
    this.showConfirmModal = false;
    this.agendamentoParaAbandonar = null;
  }

  mostrarAlerta(titulo: string, mensagem: string, tipo: 'success' | 'error' | 'info'): void {
    this.alertTitle = titulo;
    this.alertMessage = mensagem;
    this.alertType = tipo;
    this.showAlertModal = true;
    
    // Fechar o alerta automaticamente após alguns segundos se for sucesso
    if (tipo === 'success') {
      setTimeout(() => {
        this.showAlertModal = false;
      }, 3000);
    }
  }

  fecharAlerta(): void {
    this.showAlertModal = false;
  }

  abandonarFila(): void {
    if (!this.agendamentoParaAbandonar || !this.agendamentoParaAbandonar.fila) return;
    
    this.filaService.abandonarFila(this.agendamentoParaAbandonar.id).subscribe({
      next: () => {
        // Atualizar o status do agendamento na lista
        if (this.agendamentoParaAbandonar) {
          this.agendamentoParaAbandonar.status = 'confirmado';
          this.agendamentoParaAbandonar.fila = undefined;
        }
        
        // Fechar o modal de confirmação
        this.fecharModalAbandonarFila();
        
        // Mostrar alerta de sucesso
        this.mostrarAlerta(
          'Sucesso!', 
          'Você saiu da fila com sucesso!', 
          'success'
        );
      },
      error: (error) => {
        this.fecharModalAbandonarFila();
        this.mostrarAlerta(
          'Erro', 
          error.error?.detail || 'Erro ao abandonar a fila. Por favor, tente novamente.', 
          'error'
        );
        console.error('Erro ao abandonar a fila:', error);
      }
    });
  }

  podeRealizarChecking(agendamento: AgendamentoComFila): boolean {
    return agendamento.status === 'confirmado' && !agendamento.fila;
  }

  podeAbandonarFila(agendamento: AgendamentoComFila): boolean {
    return agendamento.status === 'aguardando' && !!agendamento.fila;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmado': return 'status-confirmado';
      case 'aguardando': return 'status-aguardando';
      case 'em_atendimento': return 'status-em-atendimento';
      case 'finalizado': return 'status-finalizado';
      case 'cancelado': return 'status-cancelado';
      case 'expirado': return 'status-expirado';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'aguardando': return 'Aguardando';
      case 'em_atendimento': return 'Em Atendimento';
      case 'finalizado': return 'Finalizado';
      case 'cancelado': return 'Cancelado';
      case 'expirado': return 'Expirado';
      default: return status;
    }
  }

  getPosicaoFila(agendamento: AgendamentoComFila): string {
    if (!agendamento.fila) return 'Não está na fila';
    return `${agendamento.fila.posicao}º (${agendamento.fila.tipo_fila === 'preferencial' ? 'Preferencial' : 'Comum'})`;
  }

  getConsultaInfo(agendamento: AgendamentoComFila): string {
    if (!agendamento.nome_medico || !agendamento.nome_especialidade) {
      return 'Informações não disponíveis';
    }
    return `Dr(a). ${agendamento.nome_medico} - ${agendamento.nome_especialidade}`;
  }
}