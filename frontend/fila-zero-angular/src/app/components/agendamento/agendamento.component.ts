import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { Especialidade, Medico, Disponibilidade } from '../../models/agendamento.model';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './agendamento.component.html',
  styleUrls: ['./agendamento.component.scss']
})
export class AgendamentoComponent implements OnInit {
  agendamentoForm: FormGroup;
  especialidades: Especialidade[] = [];
  medicos: Medico[] = [];
  disponibilidades: Disponibilidade[] = [];
  datasDisponiveis: string[] = [];
  horariosDisponiveis: Disponibilidade[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private agendamentoService: AgendamentoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.agendamentoForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      especialidade_id: ['', [Validators.required]],
      medico_id: ['', [Validators.required]],
      data_selecionada: ['', [Validators.required]],
      disponibilidade_id: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Verificar se o usuário está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/agendamento' } });
      return;
    }
    
    this.carregarEspecialidades();
    
    // Observar mudanças na seleção de especialidade
    this.agendamentoForm.get('especialidade_id')?.valueChanges.subscribe(especialidadeId => {
      if (especialidadeId) {
        this.carregarMedicos(especialidadeId);
        this.agendamentoForm.get('medico_id')?.setValue('');
        this.agendamentoForm.get('data_selecionada')?.setValue('');
        this.agendamentoForm.get('disponibilidade_id')?.setValue('');
      }
    });

    // Observar mudanças na seleção de médico
    this.agendamentoForm.get('medico_id')?.valueChanges.subscribe(medicoId => {
      if (medicoId) {
        this.carregarDisponibilidades(medicoId);
        this.agendamentoForm.get('data_selecionada')?.setValue('');
        this.agendamentoForm.get('disponibilidade_id')?.setValue('');
      }
    });
    
    // Observar mudanças na seleção de data
    this.agendamentoForm.get('data_selecionada')?.valueChanges.subscribe(data => {
      if (data) {
        this.filtrarHorariosPorData(data);
        this.agendamentoForm.get('disponibilidade_id')?.setValue('');
      }
    });
  }

  carregarEspecialidades(): void {
    this.loading = true;
    this.agendamentoService.getEspecialidades().subscribe({
      next: (especialidades: Especialidade[]) => {
        this.especialidades = especialidades;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar especialidades. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  carregarMedicos(especialidadeId: number): void {
    this.loading = true;
    this.agendamentoService.getMedicosPorEspecialidade(especialidadeId).subscribe({
      next: (medicos: Medico[]) => {
        this.medicos = medicos;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar médicos. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  carregarDisponibilidades(medicoId: number): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Dados de exemplo para fallback em caso de erro
    const disponibilidadesTeste = [
      { id: 1, medico_id: medicoId, data: '2024-05-20', hora: '08:00:00', disponivel: true },
      { id: 2, medico_id: medicoId, data: '2024-05-20', hora: '10:00:00', disponivel: true },
      { id: 3, medico_id: medicoId, data: '2024-05-21', hora: '14:00:00', disponivel: true },
      { id: 4, medico_id: medicoId, data: '2024-05-22', hora: '09:00:00', disponivel: true }
    ];
    
    this.agendamentoService.getDisponibilidadesPorMedico(medicoId).subscribe({
      next: (disponibilidades: Disponibilidade[]) => {
        // Ordenar disponibilidades por data e hora
        this.disponibilidades = disponibilidades.sort((a: Disponibilidade, b: Disponibilidade) => {
          // Primeiro comparar por data
          const comparaData = a.data.localeCompare(b.data);
          if (comparaData !== 0) return comparaData;
          
          // Se a data for igual, comparar por hora
          return a.hora.localeCompare(b.hora);
        });
        
        // Extrair datas únicas disponíveis
        this.datasDisponiveis = [...new Set(this.disponibilidades.map(d => d.data))];
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar disponibilidades:', error);
        this.errorMessage = 'Erro ao carregar disponibilidades. Por favor, tente novamente.';
        this.loading = false;
        
        // Fallback para dados de exemplo se houver erro
        this.disponibilidades = disponibilidadesTeste;
        this.datasDisponiveis = [...new Set(this.disponibilidades.map(d => d.data))];
      }
    });
  }
  
  filtrarHorariosPorData(dataSelecionada: string): void {
    if (!dataSelecionada) {
      this.horariosDisponiveis = [];
      return;
    }
    
    this.horariosDisponiveis = this.disponibilidades
      .filter(d => d.data === dataSelecionada)
      .sort((a, b) => a.hora.localeCompare(b.hora));
    
    console.log('Horários disponíveis para', dataSelecionada, ':', this.horariosDisponiveis);
  }

  formatarData(data: string): string {
    if (!data) return '';
    
    try {
      // Converter a data para o formato brasileiro
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return data; // Retorna a data original em caso de erro
    }
  }
  
  formatarHora(hora: string): string {
    if (!hora) return '';
    
    try {
      // Pegar apenas HH:MM
      return hora.substring(0, 5);
    } catch (error) {
      console.error('Erro ao formatar hora:', error);
      return hora; // Retorna a hora original em caso de erro
    }
  }
  
  formatarDataHora(disponibilidade: Disponibilidade): string {
    if (!disponibilidade || !disponibilidade.data || !disponibilidade.hora) return '';
    
    try {
      // Converter a data para o formato brasileiro
      const [ano, mes, dia] = disponibilidade.data.split('-');
      const hora = disponibilidade.hora.substring(0, 5); // Pegar apenas HH:MM
      
      return `${dia}/${mes}/${ano} às ${hora}`;
    } catch (error) {
      console.error('Erro ao formatar data e hora:', error);
      return '';
    }
  }

  onSubmit(): void {
    if (this.agendamentoForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    
    const formValues = this.agendamentoForm.value;
    
    // Verificar se o usuário está autenticado
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Você precisa estar logado para agendar uma consulta.';
      this.loading = false;
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/agendamento' } });
      return;
    }
    
    // Usar ID de disponibilidade dos dados de exemplo para teste
    const disponibilidadeId = formValues.disponibilidade_id;
    
    const agendamentoData = {
      disponibilidade_id: disponibilidadeId,
      nome_paciente: formValues.nome,
      email_paciente: formValues.email,
      telefone_paciente: formValues.telefone
    };
    
    console.log('Enviando agendamento:', agendamentoData);
    
    // Verificar se a disponibilidade_id é um número válido
    if (typeof agendamentoData.disponibilidade_id === 'string') {
      agendamentoData.disponibilidade_id = parseInt(agendamentoData.disponibilidade_id);
    }
    
    this.agendamentoService.criarAgendamento(agendamentoData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Agendamento realizado com sucesso!');
        // Limpar o formulário
        this.agendamentoForm.reset();
        // Redirecionar para a página de meus agendamentos
        this.router.navigate(['/meus-agendamentos']);
      },
      error: (error: any) => {
        console.error('Erro ao agendar:', error);
        this.loading = false;
        this.errorMessage = error.error?.detail || 'Erro ao realizar agendamento. Por favor, tente novamente.';
      }
    });
  }
}