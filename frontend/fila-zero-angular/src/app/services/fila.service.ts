import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { AuthService } from './auth.service';

export interface FilaAtendimento {
  id: number;
  agendamento_id: number;
  tipo_fila: string;
  posicao: number;
  data_entrada: string;
  hora_entrada: string;
  status: string;
}

export interface AgendamentoComFila extends Agendamento {
  fila?: FilaAtendimento;
  nome_medico?: string;
  nome_especialidade?: string;
}

export interface FilaAtendimentoCreate {
  agendamento_id: number;
  tipo_fila: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilaService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAgendamentosHoje(): Observable<AgendamentoComFila[]> {
    return this.http.get<AgendamentoComFila[]>(`${this.apiUrl}/agendamentos/hoje`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  realizarChecking(agendamentoId: number, tipoFila: string): Observable<FilaAtendimento> {
    const filaData: FilaAtendimentoCreate = {
      agendamento_id: agendamentoId,
      tipo_fila: tipoFila
    };

    return this.http.post<FilaAtendimento>(`${this.apiUrl}/fila`, filaData, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  abandonarFila(agendamentoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/fila/${agendamentoId}`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  listarFila(): Observable<FilaAtendimento[]> {
    return this.http.get<FilaAtendimento[]>(`${this.apiUrl}/fila`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  atualizarStatusFila(filaId: number, status: string): Observable<FilaAtendimento> {
    return this.http.put<FilaAtendimento>(`${this.apiUrl}/fila/${filaId}`, { status }, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }
}