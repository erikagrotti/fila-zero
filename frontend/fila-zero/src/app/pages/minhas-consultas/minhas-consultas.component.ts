import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Consulta, ConsultasService } from '../../services/consultas.service';

@Component({
  selector: 'app-minhas-consultas',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './minhas-consultas.component.html',
  styleUrls: ['./minhas-consultas.component.scss']
})
export class MinhasConsultasComponent implements OnInit {
  consultas: Consulta[] = [];
  displayedColumns: string[] = ['especialidade', 'medico', 'data', 'horario', 'status', 'acoes'];

  constructor(
    private consultasService: ConsultasService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.carregarConsultas();
  }

  carregarConsultas(): void {
    this.consultasService.getConsultas().subscribe(consultas => {
      this.consultas = consultas;
    });
  }

  voltar(): void {
    this.router.navigate(['/home']);
  }
  
  navegarParaAgendamento(): void {
    this.router.navigate(['/agendar-consulta']);
  }

  cancelarConsulta(consulta: Consulta): void {
    if (confirm(`Tem certeza que deseja cancelar a consulta de ${consulta.especialidadeNome} com ${consulta.medicoNome}?`)) {
      this.consultasService.cancelarConsulta(consulta.id);
      this.snackBar.open('Consulta cancelada com sucesso!', 'Fechar', {
        duration: 3000
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'agendada': return 'status-agendada';
      case 'realizada': return 'status-realizada';
      case 'cancelada': return 'status-cancelada';
      default: return '';
    }
  }

  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }
}