from sqlalchemy.orm import Session
from passlib.context import CryptContext
from src.database import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Função de hash para senhas
def get_password(password: str):
    return pwd_context.hash(password)

# Função para verificar a senha
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Função de cadastro de novo usuário
def create_user(db: Session, username: str, email: str, password: str):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if db_user:
        return None
    hashed_password = get_password(password)
    db_user = models.User(username=username, email=email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Função de autenticação de usuário (login)
def authenticate_user(db: Session, email: str, password: str):
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        return None
    if not verify_password(password, db_user.password):
        return None
    return db_user
