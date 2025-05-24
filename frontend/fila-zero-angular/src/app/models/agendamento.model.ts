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
  disponivel: boolean;
  data: string; // formato YYYY-MM-DD
  hora: string; // formato HH:MM:SS
}

export interface AgendamentoCreate {
  disponibilidade_id: number;
  nome_paciente: string;
  email_paciente: string;
  telefone_paciente: string;
}

export interface Agendamento {
  id: number;
  user_id?: number;
  disponibilidade_id: number;
  nome_paciente: string;
  email_paciente: string;
  telefone_paciente: string;
  status: string;
  data_agendamento_data: string; // formato YYYY-MM-DD
  data_agendamento_hora: string; // formato HH:MM:SS
  data_consulta_data: string; // formato YYYY-MM-DD
  data_consulta_hora: string; // formato HH:MM:SS
}