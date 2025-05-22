export interface Especialidade {
  id: number;
  nome: string;
}

export interface Medico {
  id: number;
  nome: string;
  especialidade_id: number;
}

export interface Disponibilidade {
  id: number;
  medico_id: number;
  data: string;
  hora: string;
  disponivel: boolean;
}

export interface DataDisponivel {
  data: string;
  disponibilidades: Disponibilidade[];
}

export interface AgendamentoForm {
  nome: string;
  email: string;
  telefone: string;
  especialidade_id: number;
  medico_id: number;
  disponibilidade_id: number;
}

export interface Agendamento {
  id: number;
  user_id?: number;
  disponibilidade_id: number;
  nome_paciente: string;
  email_paciente: string;
  telefone_paciente: string;
  data_agendamento_data: string;
  data_agendamento_hora: string;
  data_consulta_data: string;
  data_consulta_hora: string;
  status: string;
}