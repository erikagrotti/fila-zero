import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Agendamento } from '../models/agendamento.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAgendamentosHoje(): Observable<Agendamento[]> {
    // Obtém a data atual no formato ISO (YYYY-MM-DD)
    const hoje = new Date();
    const dataHoje = hoje.toISOString().split('T')[0];
    
    // Busca todos os agendamentos e filtra pelo dia da consulta
    return this.http.get<Agendamento[]>(`${this.apiUrl}/agendamentos`).pipe(
      map(agendamentos => {
        // Filtrar agendamentos para o dia atual
        const agendamentosHoje = agendamentos.filter(agendamento => {
          if (!agendamento.data_consulta_data) return false;
          return agendamento.data_consulta_data === dataHoje;
        });
        
        // Ordenar por horário da consulta
        return agendamentosHoje.sort((a, b) => {
          return a.data_consulta_hora.localeCompare(b.data_consulta_hora);
        });
      })
    );
  }
}