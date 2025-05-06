from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.api.services import auth_service
from src.database.connection import get_db
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True

# Rota de cadastro
@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = auth_service.create_user(db, user.username, user.email, user.password)
    if db_user is None:
        raise HTTPException(status_code=400, detail="Email já registrado.")
    return db_user

# Rota de login
class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = auth_service.authenticate_user(db, user.email, user.password)
    if db_user is None:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    return {"message": "Login bem-sucedido!", "user": db_user.username}
