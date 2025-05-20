from sqlalchemy import Column, Integer, Date, Time, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from src.database.connection import Base

class Disponibilidade(Base):
    __tablename__ = "disponibilidades"

    id = Column(Integer, primary_key=True, index=True)
    medico_id = Column(Integer, ForeignKey("medicos.id", ondelete="CASCADE"), nullable=False)
    data = Column(Date, nullable=False)
    horario = Column(Time, nullable=False)
    disponivel = Column(Boolean, default=True)

    medico = relationship("Medico", back_populates="disponibilidades")
    agendamentos = relationship("Agendamento", back_populates="disponibilidade")

    def __repr__(self):
        return f"<Disponibilidade id={self.id} medico_id={self.medico_id} data={self.data} horario={self.horario} disponivel={self.disponivel}>"
