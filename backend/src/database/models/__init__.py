# Importações para garantir que todos os modelos sejam carregados na ordem correta
from src.database.models.user import User
from src.database.models.especialidade import Especialidade
from src.database.models.medico import Medico
from src.database.models.disponibilidade import Disponibilidade
from src.database.models.agendamento import Agendamento

# Garantir que todas as relações sejam configuradas corretamente
__all__ = ['User', 'Especialidade', 'Medico', 'Disponibilidade', 'Agendamento']