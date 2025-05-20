from sqlalchemy import Column, Integer, Date, String, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from src.database.connection import Base

class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    disponibilidade_id = Column(Integer, ForeignKey("disponibilidades.id", ondelete="CASCADE"), nullable=False)
    data_nascimento = Column(Date)
    especialidade_id = Column(Integer, ForeignKey("especialidades.id"), nullable=True)
    data_criacao = Column(TIMESTAMP, nullable=False, server_default="CURRENT_TIMESTAMP")
    status = Column(String(20), default="aguardando")
    ordem_na_fila = Column(Integer)

    usuario = relationship("User", back_populates="agendamentos")
    disponibilidade = relationship("Disponibilidade", back_populates="agendamentos")
    
    # Usando string literal para evitar dependência circular
    # Definindo a relação com lazy="joined" para carregamento eficiente
    especialidade = relationship(
        "Especialidade", 
        back_populates="agendamentos", 
        lazy="joined",
        foreign_keys=[especialidade_id],
        overlaps="agendamentos"
    )

    def __repr__(self):
        return f"<Agendamento id={self.id} user_id={self.user_id} disponibilidade_id={self.disponibilidade_id} status={self.status}>"
