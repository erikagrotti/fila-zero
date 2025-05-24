from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, time

# Schemas para autenticação
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Schemas para agendamento
class Especialidade(BaseModel):
    id: int
    nome: str
    
    class Config:
        from_attributes = True

class Medico(BaseModel):
    id: int
    nome: str
    especialidade_id: int
    
    class Config:
        from_attributes = True

class DisponibilidadeBase(BaseModel):
    medico_id: int
    disponivel: bool
    data: date
    hora: time

class DisponibilidadeCreate(DisponibilidadeBase):
    pass

class Disponibilidade(DisponibilidadeBase):
    id: int
    
    class Config:
        from_attributes = True

class AgendamentoBase(BaseModel):
    nome_paciente: str
    email_paciente: EmailStr
    telefone_paciente: str

class AgendamentoCreate(AgendamentoBase):
    disponibilidade_id: int

class Agendamento(AgendamentoBase):
    id: int
    user_id: Optional[int] = None
    disponibilidade_id: int
    status: str
    data_agendamento_data: date
    data_agendamento_hora: time
    data_consulta_data: date
    data_consulta_hora: time
    
    class Config:
        from_attributes = True

# Schemas para fila de atendimento
class FilaAtendimentoBase(BaseModel):
    agendamento_id: int
    tipo_fila: str  # 'comum' ou 'preferencial'

class FilaAtendimentoCreate(FilaAtendimentoBase):
    pass

class FilaAtendimentoUpdate(BaseModel):
    status: str

class FilaAtendimento(FilaAtendimentoBase):
    id: int
    posicao: int
    data_entrada: date
    hora_entrada: time
    status: str
    
    class Config:
        from_attributes = True

class AgendamentoComFila(Agendamento):
    fila: Optional[FilaAtendimento] = None
    nome_medico: Optional[str] = None
    nome_especialidade: Optional[str] = None
    
    class Config:
        from_attributes = True