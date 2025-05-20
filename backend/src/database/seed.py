from sqlalchemy.orm import Session
from datetime import date, time
from src.database.connection import SessionLocal
from src.database.models import Especialidade, Medico, Disponibilidade

def seed_database():
    """
    Popula o banco de dados com dados iniciais para testes.
    """
    db = SessionLocal()
    
    try:
        # Verificar se já existem dados
        if db.query(Especialidade).count() > 0:
            print("Banco de dados já possui dados. Pulando seed.")
            return
        
        # Criar especialidades
        especialidades = [
            Especialidade(nome="Cardiologia"),
            Especialidade(nome="Dermatologia"),
            Especialidade(nome="Pediatria")
        ]
        db.add_all(especialidades)
        db.commit()
        
        # Recarregar especialidades para obter IDs
        especialidades = db.query(Especialidade).all()
        
        # Criar médicos
        medicos = [
            Medico(nome="Dr. João Silva"),
            Medico(nome="Dra. Ana Costa"),
            Medico(nome="Dr. Pedro Ramos"),
            Medico(nome="Dra. Camila Oliveira"),
            Medico(nome="Dra. Letícia Moura")
        ]
        db.add_all(medicos)
        db.commit()
        
        # Recarregar médicos para obter IDs
        medicos = db.query(Medico).all()
        
        # Associar médicos a especialidades
        medicos[0].especialidades.append(especialidades[0])  # Dr. João Silva - Cardiologia
        medicos[1].especialidades.append(especialidades[0])  # Dra. Ana Costa - Cardiologia
        medicos[2].especialidades.append(especialidades[1])  # Dr. Pedro Ramos - Dermatologia
        medicos[3].especialidades.append(especialidades[1])  # Dra. Camila Oliveira - Dermatologia
        medicos[4].especialidades.append(especialidades[2])  # Dra. Letícia Moura - Pediatria
        db.commit()
        
        # Criar disponibilidades
        disponibilidades = [
            # Dr. João Silva (Cardiologia)
            Disponibilidade(medico_id=medicos[0].id, data=date(2025, 5, 20), horario=time(8, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[0].id, data=date(2025, 5, 20), horario=time(10, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[0].id, data=date(2025, 5, 21), horario=time(14, 0), disponivel=True),
            
            # Dra. Ana Costa (Cardiologia)
            Disponibilidade(medico_id=medicos[1].id, data=date(2025, 5, 20), horario=time(9, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[1].id, data=date(2025, 5, 21), horario=time(11, 0), disponivel=True),
            
            # Dr. Pedro Ramos (Dermatologia)
            Disponibilidade(medico_id=medicos[2].id, data=date(2025, 5, 22), horario=time(8, 30), disponivel=True),
            Disponibilidade(medico_id=medicos[2].id, data=date(2025, 5, 22), horario=time(10, 30), disponivel=True),
            
            # Dra. Camila Oliveira (Dermatologia)
            Disponibilidade(medico_id=medicos[3].id, data=date(2025, 5, 23), horario=time(13, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[3].id, data=date(2025, 5, 23), horario=time(15, 0), disponivel=True),
            
            # Dra. Letícia Moura (Pediatria)
            Disponibilidade(medico_id=medicos[4].id, data=date(2025, 5, 24), horario=time(9, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[4].id, data=date(2025, 5, 24), horario=time(11, 0), disponivel=True),
            Disponibilidade(medico_id=medicos[4].id, data=date(2025, 5, 25), horario=time(14, 0), disponivel=True),
        ]
        db.add_all(disponibilidades)
        db.commit()
        
        print("Dados iniciais inseridos com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"Erro ao inserir dados iniciais: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()