from sqlalchemy import Table, Column, Integer, ForeignKey
from src.database.connection import Base

medico_especialidade_table = Table(
    "medico_especialidade",
    Base.metadata,
    Column("medico_id", Integer, ForeignKey("medicos.id", ondelete="CASCADE"), primary_key=True),
    Column("especialidade_id", Integer, ForeignKey("especialidades.id", ondelete="CASCADE"), primary_key=True)
)
