from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Especialidade(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    
    # Relacionamento com médicos
    medicos = relationship("Medico", back_populates="especialidade")

class Medico(Base):
    __tablename__ = "medicos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    especialidade_id = Column(Integer, ForeignKey("especialidades.id"), nullable=False)
    
    # Relacionamentos
    especialidade = relationship("Especialidade", back_populates="medicos")
    disponibilidades = relationship("Disponibilidade", back_populates="medico")

class Disponibilidade(Base):
    __tablename__ = "disponibilidades"

    id = Column(Integer, primary_key=True, index=True)
    medico_id = Column(Integer, ForeignKey("medicos.id"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    disponivel = Column(Boolean, default=True)
    
    # Relacionamento com médico
    medico = relationship("Medico", back_populates="disponibilidades")
    # Relacionamento com agendamentos
    agendamentos = relationship("Agendamento", back_populates="disponibilidade")

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    disponibilidade_id = Column(Integer, ForeignKey("disponibilidades.id"), nullable=False)
    nome_paciente = Column(String, nullable=False)
    email_paciente = Column(String, nullable=False)
    telefone_paciente = Column(String, nullable=False)
    data_agendamento = Column(DateTime, default=func.now())
    status = Column(String, default="confirmado")
    
    # Relacionamento com disponibilidade
    disponibilidade = relationship("Disponibilidade", back_populates="agendamentos")