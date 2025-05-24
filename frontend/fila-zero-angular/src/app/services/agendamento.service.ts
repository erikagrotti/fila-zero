import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agendamento, AgendamentoCreate, Disponibilidade, Especialidade, Medico } from '../models/agendamento.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getEspecialidades(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(`${this.apiUrl}/especialidades`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  getMedicos(especialidadeId?: number): Observable<Medico[]> {
    let url = `${this.apiUrl}/medicos`;
    if (especialidadeId) {
      url += `?especialidade_id=${especialidadeId}`;
    }
    return this.http.get<Medico[]>(url, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para compatibilidade com o componente existente
  getMedicosPorEspecialidade(especialidadeId: number): Observable<Medico[]> {
    return this.getMedicos(especialidadeId);
  }

  getDisponibilidades(medicoId?: number, disponivel?: boolean): Observable<Disponibilidade[]> {
    let url = `${this.apiUrl}/disponibilidades`;
    const params: string[] = [];
    
    if (medicoId !== undefined) {
      params.push(`medico_id=${medicoId}`);
    }
    
    if (disponivel !== undefined) {
      params.push(`disponivel=${disponivel}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<Disponibilidade[]>(url, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para compatibilidade com o componente existente
  getDisponibilidadesPorMedico(medicoId: number): Observable<Disponibilidade[]> {
    return this.getDisponibilidades(medicoId, true);
  }

  criarAgendamento(agendamento: AgendamentoCreate): Observable<Agendamento> {
    return this.http.post<Agendamento>(`${this.apiUrl}/agendamentos`, agendamento, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }

  // Método para compatibilidade com o componente existente
  listarAgendamentos(): Observable<Agendamento[]> {
    return this.getAgendamentos();
  }

  getAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/agendamentos`, {
      headers: this.authService.getAuthHeaders(),
      withCredentials: true
    });
  }
}