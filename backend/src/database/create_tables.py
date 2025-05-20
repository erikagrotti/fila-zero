from src.database.connection import Base, engine
import src.database.models

def create_tables():
    """
    Cria todas as tabelas definidas nos modelos SQLAlchemy.
    """
    print("Criando tabelas no banco de dados...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso!")

if __name__ == "__main__":
    create_tables()