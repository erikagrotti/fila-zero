import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Agendamento } from '../../models/agendamento.model';
import { FilaService } from '../../services/fila.service';

@Component({
  selector: 'app-fila',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './fila.component.html',
  styleUrls: ['./fila.component.scss']
})
export class FilaComponent implements OnInit {
  agendamentosHoje: Agendamento[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private filaService: FilaService) {}

  ngOnInit(): void {
    this.carregarAgendamentosHoje();
  }

  carregarAgendamentosHoje(): void {
    this.loading = true;
    this.filaService.getAgendamentosHoje().subscribe({
      next: (agendamentos: Agendamento[]) => {
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
}