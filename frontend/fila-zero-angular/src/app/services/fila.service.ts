import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FilaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAgendamentosHoje(): Observable<Agendamento[]> {
    // Implementação real que usaria o backend
    return this.http.get<Agendamento[]>(`${this.apiUrl}/agendamentos/hoje`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
    
    // Dados de exemplo para desenvolvimento
    /*
    const hoje = new Date().toISOString().split('T')[0];
    const horaAtual = new Date().toTimeString().split(' ')[0];
    
    const dadosExemplo: Agendamento[] = [
      {
        id: 1,
        user_id: 1,
        disponibilidade_id: 1,
        nome_paciente: 'João Silva',
        email_paciente: 'joao@example.com',
        telefone_paciente: '(11) 98765-4321',
        status: 'confirmado',
        data_agendamento_data: hoje,
        data_agendamento_hora: horaAtual,
        data_consulta_data: hoje,
        data_consulta_hora: '09:00:00'
      },
      {
        id: 2,
        user_id: 2,
        disponibilidade_id: 2,
        nome_paciente: 'Maria Oliveira',
        email_paciente: 'maria@example.com',
        telefone_paciente: '(11) 91234-5678',
        status: 'confirmado',
        data_agendamento_data: hoje,
        data_agendamento_hora: horaAtual,
        data_consulta_data: hoje,
        data_consulta_hora: '10:30:00'
      }
    ];
    
    return of(dadosExemplo);
    */
  }
}