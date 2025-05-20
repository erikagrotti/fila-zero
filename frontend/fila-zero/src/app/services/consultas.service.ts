import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Consulta {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  especialidade: number;
  especialidadeNome?: string;
  medico: number;
  medicoNome?: string;
  dataConsulta: string;
  horario: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  dataCriacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private consultasKey = 'filazero_consultas';
  private consultasSubject = new BehaviorSubject<Consulta[]>([]);
  consultas$ = this.consultasSubject.asObservable();

  constructor() {
    this.carregarConsultas();
  }

  private carregarConsultas(): void {
    const consultasStr = localStorage.getItem(this.consultasKey);
    const consultas = consultasStr ? JSON.parse(consultasStr) : [];
    this.consultasSubject.next(consultas);
  }

  private salvarConsultas(consultas: Consulta[]): void {
    localStorage.setItem(this.consultasKey, JSON.stringify(consultas));
    this.consultasSubject.next(consultas);
  }

  getConsultas(): Observable<Consulta[]> {
    return this.consultas$;
  }

  adicionarConsulta(consulta: Consulta): void {
    const consultas = [...this.consultasSubject.value];
    consulta.id = this.gerarId();
    consulta.dataCriacao = new Date().toISOString();
    consulta.status = 'agendada';
    consultas.push(consulta);
    this.salvarConsultas(consultas);
  }

  cancelarConsulta(id: string): void {
    const consultas = this.consultasSubject.value.map(c => 
      c.id === id ? { ...c, status: 'cancelada' as const } : c
    );
    this.salvarConsultas(consultas);
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}