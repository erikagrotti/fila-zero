import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Especialidade, Medico, Disponibilidade } from './agendamento.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Dados simulados para especialidades
  private especialidades: Especialidade[] = [
    { id: 1, nome: 'Cardiologia' },
    { id: 2, nome: 'Dermatologia' },
    { id: 3, nome: 'Ortopedia' },
    { id: 4, nome: 'Pediatria' },
    { id: 5, nome: 'Clínica Geral' }
  ];
  
  // Dados simulados para médicos
  private medicos: { [key: number]: Medico[] } = {
    1: [ // Cardiologia
      { id: 101, nome: 'Dr. Carlos Silva' },
      { id: 102, nome: 'Dra. Ana Oliveira' }
    ],
    2: [ // Dermatologia
      { id: 201, nome: 'Dra. Mariana Costa' },
      { id: 202, nome: 'Dr. Roberto Santos' }
    ],
    3: [ // Ortopedia
      { id: 301, nome: 'Dr. Paulo Mendes' },
      { id: 302, nome: 'Dra. Juliana Alves' }
    ],
    4: [ // Pediatria
      { id: 401, nome: 'Dra. Fernanda Lima' },
      { id: 402, nome: 'Dr. Ricardo Gomes' }
    ],
    5: [ // Clínica Geral
      { id: 501, nome: 'Dr. Marcos Pereira' },
      { id: 502, nome: 'Dra. Luciana Ferreira' }
    ]
  };
  
  // Gerar datas disponíveis para os próximos 30 dias
  private gerarDatasDisponiveis(medicoId: number): Disponibilidade[] {
    const disponibilidades: Disponibilidade[] = [];
    const hoje = new Date();
    
    // Para cada médico, gerar disponibilidades para os próximos 30 dias
    for (let i = 1; i <= 30; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);
      
      // Pular finais de semana
      if (data.getDay() === 0 || data.getDay() === 6) continue;
      
      // Formatar a data como YYYY-MM-DD
      const dataFormatada = this.formatarData(data);
      
      // Horários disponíveis (8h às 17h, de hora em hora)
      for (let hora = 8; hora <= 17; hora++) {
        // Alguns horários aleatórios não estarão disponíveis
        if (Math.random() > 0.7) continue;
        
        const horaFormatada = `${hora.toString().padStart(2, '0')}:00`;
        
        disponibilidades.push({
          id: disponibilidades.length + 1,
          medico_id: medicoId,
          data: dataFormatada,
          hora_inicio: horaFormatada,
          disponivel: true
        });
      }
    }
    
    return disponibilidades;
  }
  
  // Formatar data como YYYY-MM-DD
  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
  }
  
  // Métodos para simular as chamadas de API
  getEspecialidades(): Observable<Especialidade[]> {
    return of(this.especialidades);
  }
  
  getMedicosPorEspecialidade(especialidadeId: number): Observable<Medico[]> {
    return of(this.medicos[especialidadeId] || []);
  }
  
  getDisponibilidadesPorMedico(medicoId: number): Observable<Disponibilidade[]> {
    return of(this.gerarDatasDisponiveis(medicoId));
  }
}