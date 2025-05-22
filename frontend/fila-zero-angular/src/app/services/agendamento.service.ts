import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidade, Medico, Disponibilidade, AgendamentoForm } from '../models/agendamento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEspecialidades(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(`${this.apiUrl}/especialidades`);
  }

  getMedicosPorEspecialidade(especialidadeId: number): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/medicos?especialidade_id=${especialidadeId}`);
  }

  getDisponibilidadesPorMedico(medicoId: number): Observable<Disponibilidade[]> {
    return this.http.get<Disponibilidade[]>(`${this.apiUrl}/disponibilidades?medico_id=${medicoId}&disponivel=true`);
  }

  criarAgendamento(agendamento: {
    disponibilidade_id: number;
    nome_paciente: string;
    email_paciente: string;
    telefone_paciente: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/agendamentos`, agendamento);
  }

  listarAgendamentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/agendamentos`);
  }
}