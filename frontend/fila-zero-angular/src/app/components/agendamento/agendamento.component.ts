import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { AgendamentoService } from '../../services/agendamento.service';
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
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private agendamentoService: AgendamentoService,
    private router: Router
  ) {
    this.agendamentoForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
      especialidade_id: ['', [Validators.required]],
      medico_id: ['', [Validators.required]],
      disponibilidade_id: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carregarEspecialidades();
    
    // Observar mudanças na seleção de especialidade
    this.agendamentoForm.get('especialidade_id')?.valueChanges.subscribe(especialidadeId => {
      if (especialidadeId) {
        this.carregarMedicos(especialidadeId);
        this.agendamentoForm.get('medico_id')?.setValue('');
        this.agendamentoForm.get('disponibilidade_id')?.setValue('');
      }
    });

    // Observar mudanças na seleção de médico
    this.agendamentoForm.get('medico_id')?.valueChanges.subscribe(medicoId => {
      if (medicoId) {
        this.carregarDisponibilidades(medicoId);
        this.agendamentoForm.get('disponibilidade_id')?.setValue('');
      }
    });
  }

  carregarEspecialidades(): void {
    this.loading = true;
    this.agendamentoService.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar especialidades. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  carregarMedicos(especialidadeId: number): void {
    this.loading = true;
    this.agendamentoService.getMedicosPorEspecialidade(especialidadeId).subscribe({
      next: (medicos) => {
        this.medicos = medicos;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar médicos. Por favor, tente novamente.';
        this.loading = false;
      }
    });
  }

  carregarDisponibilidades(medicoId: number): void {
    this.loading = true;
    this.agendamentoService.getDisponibilidadesPorMedico(medicoId).subscribe({
      next: (disponibilidades) => {
        this.disponibilidades = disponibilidades;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar disponibilidades. Por favor, tente novamente.';
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

  onSubmit(): void {
    if (this.agendamentoForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const formValues = this.agendamentoForm.value;
    
    const agendamentoData = {
      disponibilidade_id: formValues.disponibilidade_id,
      nome_paciente: formValues.nome,
      email_paciente: formValues.email,
      telefone_paciente: formValues.telefone
    };
    
    this.agendamentoService.criarAgendamento(agendamentoData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('Agendamento realizado com sucesso!');
        // Limpar o formulário
        this.agendamentoForm.reset();
        // Redirecionar para a página de meus agendamentos
        this.router.navigate(['/meus-agendamentos']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.detail || 'Erro ao realizar agendamento. Por favor, tente novamente.';
      }
    });
  }
}