from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.database.connection import Base
from src.database.models.medico_especialidade import medico_especialidade_table

class Especialidade(Base):
    __tablename__ = "especialidades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), unique=True, nullable=False)

    medicos = relationship(
        "Medico",
        secondary=medico_especialidade_table,
        back_populates="especialidades"
    )
    
    # Usando string literal para evitar dependência circular
    # Definindo a relação com lazy="noload" para evitar carregamento automático
    agendamentos = relationship(
        "Agendamento", 
        back_populates="especialidade", 
        lazy="noload",
        overlaps="especialidade"
    )

    def __repr__(self):
        return f"<Especialidade id={self.id} nome={self.nome}>"
