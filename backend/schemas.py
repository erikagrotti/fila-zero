from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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
        # Não esperar o campo is_active que foi removido do modelo

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

class Disponibilidade(BaseModel):
    id: int
    medico_id: int
    data_hora: datetime
    disponivel: bool
    
    class Config:
        from_attributes = True

class AgendamentoCreate(BaseModel):
    disponibilidade_id: int
    nome_paciente: str
    email_paciente: EmailStr
    telefone_paciente: str

class Agendamento(BaseModel):
    id: int
    user_id: Optional[int] = None
    disponibilidade_id: int
    nome_paciente: str
    email_paciente: EmailStr
    telefone_paciente: str
    data_agendamento: datetime
    status: str
    
    class Config:
        from_attributes = True