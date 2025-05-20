import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

// Angular Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { AgendamentoService, Especialidade, Medico, Disponibilidade } from '../../services/agendamento.service';
import { ConsultasService } from '../../services/consultas.service';

@Component({
  selector: 'app-agendamento-consulta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatOptionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  providers: [AgendamentoService],
  templateUrl: './agendamento-consulta.component.html',
  styleUrls: ['./agendamento-consulta.component.scss']
})
export class AgendamentoConsultaComponent implements OnInit {
  form: FormGroup;
  loading = false;
  loadingData = false;
  hide = true;

  especialidades: Especialidade[] = [];
  medicos: Medico[] = [];
  disponibilidades: Disponibilidade[] = [];
  
  datasDisponiveis: Date[] = [];
  horariosDisponiveis: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
    private agendamentoService: AgendamentoService,
    private consultasService: ConsultasService
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      dataNascimento: ['', Validators.required],
      especialidade: ['', Validators.required],
      medico: ['', Validators.required],
      dataConsulta: ['', Validators.required],
      horario: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carregarEspecialidades();
    
    // Adicionar listener para mudanças na data da consulta
    this.form.get('dataConsulta')?.valueChanges.subscribe(data => {
      if (data) {
        this.onDataConsultaChange(data);
      }
    });
  }

  carregarEspecialidades(): void {
    this.loadingData = true;
    this.agendamentoService.getEspecialidades()
      .pipe(finalize(() => this.loadingData = false))
      .subscribe({
        next: (especialidades) => {
          this.especialidades = especialidades;
        },
        error: (error) => {
          console.error('Erro ao carregar especialidades:', error);
          this.snackBar.open('Erro ao carregar especialidades. Tente novamente.', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  onEspecialidadeChange(especialidadeId: number): void {
    this.form.patchValue({ medico: '', dataConsulta: '', horario: '' });
    this.medicos = [];
    this.disponibilidades = [];
    this.datasDisponiveis = [];
    this.horariosDisponiveis = [];
    
    if (!especialidadeId) return;
    
    this.loadingData = true;
    this.agendamentoService.getMedicosPorEspecialidade(especialidadeId)
      .pipe(finalize(() => this.loadingData = false))
      .subscribe({
        next: (medicos) => {
          this.medicos = medicos;
        },
        error: (error) => {
          console.error('Erro ao carregar médicos:', error);
          this.snackBar.open('Erro ao carregar médicos. Tente novamente.', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  onMedicoChange(medicoId: number): void {
    this.form.patchValue({ dataConsulta: '', horario: '' });
    this.disponibilidades = [];
    this.datasDisponiveis = [];
    this.horariosDisponiveis = [];
    
    if (!medicoId) return;
    
    this.loadingData = true;
    this.agendamentoService.getDisponibilidadesPorMedico(medicoId)
      .pipe(finalize(() => this.loadingData = false))
      .subscribe({
        next: (disponibilidades) => {
          this.disponibilidades = disponibilidades;
          
          // Extrair datas únicas das disponibilidades
          const datasUnicas = new Set<string>();
          disponibilidades.forEach(d => {
            datasUnicas.add(d.data);
          });
          
          this.datasDisponiveis = Array.from(datasUnicas).map(data => new Date(data));
          
          if (this.datasDisponiveis.length > 0) {
            console.log('Datas disponíveis:', this.datasDisponiveis);
          } else {
            this.snackBar.open('Não há datas disponíveis para este médico', 'Fechar', {
              duration: 3000
            });
          }
        },
        error: (error) => {
          console.error('Erro ao carregar disponibilidades:', error);
          this.snackBar.open('Erro ao carregar disponibilidades. Tente novamente.', 'Fechar', {
            duration: 3000
          });
        }
      });
  }

  onDataConsultaChange(data: Date): void {
    this.form.patchValue({ horario: '' });
    this.horariosDisponiveis = [];
    
    if (!data) return;
    
    // Formatar a data para comparação
    const dataFormatada = data.toISOString().split('T')[0];
    console.log('Data selecionada formatada:', dataFormatada);
    
    // Filtrar disponibilidades pela data selecionada
    const disponibilidadesDaData = this.disponibilidades.filter(
      d => d.data === dataFormatada
    );
    
    console.log('Disponibilidades para esta data:', disponibilidadesDaData);
    
    // Extrair horários disponíveis
    this.horariosDisponiveis = disponibilidadesDaData.map(d => d.hora_inicio);
    
    if (this.horariosDisponiveis.length === 0) {
      this.snackBar.open('Não há horários disponíveis para esta data', 'Fechar', {
        duration: 3000
      });
    } else {
      console.log('Horários disponíveis:', this.horariosDisponiveis);
    }
  }

  // Filtro para mostrar apenas as datas disponíveis no datepicker
  filtrarDatasDisponiveis = (d: Date | null): boolean => {
    if (!d) return false;
    
    // Não permitir datas no passado
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (d < hoje) return false;
    
    // Verificar se a data está na lista de datas disponíveis
    return this.datasDisponiveis.some(dataDisp => 
      dataDisp.getDate() === d.getDate() && 
      dataDisp.getMonth() === d.getMonth() && 
      dataDisp.getFullYear() === d.getFullYear()
    );
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }

  agendarConsulta(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    // Encontrar os nomes da especialidade e médico selecionados
    const especialidadeSelecionada = this.especialidades.find(e => e.id === this.form.value.especialidade);
    const medicoSelecionado = this.medicos.find(m => m.id === this.form.value.medico);
    
    // Preparar os dados da consulta
    const consulta = {
      ...this.form.value,
      dataConsulta: this.formatarData(this.form.value.dataConsulta),
      especialidadeNome: especialidadeSelecionada?.nome || '',
      medicoNome: medicoSelecionado?.nome || ''
    };
    
    console.log('Dados da consulta a ser agendada:', consulta);
    
    // Salvar a consulta no serviço
    setTimeout(() => {
      this.consultasService.adicionarConsulta(consulta);
      
      this.snackBar.open('Consulta agendada com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      
      this.loading = false;
      this.router.navigate(['/minhas-consultas']);
    }, 1000);
  }
  
  // Método auxiliar para formatar a data no formato YYYY-MM-DD
  private formatarData(data: Date): string {
    if (!data) return '';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
  }
}
