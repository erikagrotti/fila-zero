import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { MockDataService } from './mock-data.service';

export interface Especialidade {
  id: number;
  nome: string;
}

export interface Medico {
  id: number;
  nome: string;
}

export interface Disponibilidade {
  id: number;
  medico_id: number;
  data: string;
  hora_inicio: string;
  hora_fim?: string;  // Opcional
  disponivel: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  
  // Flag para usar dados simulados em vez de API
  private usarDadosSimulados = true;

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) { }

  getEspecialidades(): Observable<Especialidade[]> {
    if (this.usarDadosSimulados) {
      console.log('Usando dados simulados para especialidades');
      return this.mockDataService.getEspecialidades();
    }
    
    return this.http.get<Especialidade[]>(`${this.apiUrl}/api/agendamento/especialidades`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Erro detalhado:', error);
          return throwError(() => error);
        })
      );
  }

  getMedicosPorEspecialidade(especialidadeId: number): Observable<Medico[]> {
    if (this.usarDadosSimulados) {
      console.log(`Usando dados simulados para médicos da especialidade ${especialidadeId}`);
      return this.mockDataService.getMedicosPorEspecialidade(especialidadeId);
    }
    
    return this.http.get<Medico[]>(`${this.apiUrl}/api/agendamento/medicos/especialidade/${especialidadeId}`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Erro detalhado:', error);
          return throwError(() => error);
        })
      );
  }

  getDisponibilidadesPorMedico(medicoId: number): Observable<Disponibilidade[]> {
    if (this.usarDadosSimulados) {
      console.log(`Usando dados simulados para disponibilidades do médico ${medicoId}`);
      return this.mockDataService.getDisponibilidadesPorMedico(medicoId);
    }
    
    return this.http.get<Disponibilidade[]>(`${this.apiUrl}/api/agendamento/disponibilidades/medico/${medicoId}`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.error('Erro detalhado:', error);
          return throwError(() => error);
        })
      );
  }
}