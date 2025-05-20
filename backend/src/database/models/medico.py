from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from src.database.connection import Base
from src.database.models.medico_especialidade import medico_especialidade_table

class Medico(Base):
    __tablename__ = "medicos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)

    especialidades = relationship(
        "Especialidade",
        secondary=medico_especialidade_table,
        back_populates="medicos"
    )
    disponibilidades = relationship("Disponibilidade", back_populates="medico")

    def __repr__(self):
        return f"<Medico id={self.id} nome={self.nome}>"
