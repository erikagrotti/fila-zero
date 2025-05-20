from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime, time

class EspecialidadeResponse(BaseModel):
    id: int
    nome: str
    
    class Config:
        from_attributes = True

class MedicoResponse(BaseModel):
    id: int
    nome: str
    
    class Config:
        from_attributes = True

class DisponibilidadeResponse(BaseModel):
    id: int
    medico_id: int
    data: date
    hora_inicio: time = Field(alias="horario")  # Usando o campo horario como hora_inicio
    hora_fim: time = Field(default=None)  # Campo opcional
    disponivel: bool
    
    class Config:
        from_attributes = True
        populate_by_name = True