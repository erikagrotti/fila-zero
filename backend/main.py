from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
from database import engine, get_db
from auth import router as auth_router, get_current_user

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração do CORS - permitindo todas as origens
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Incluir rotas de autenticação
app.include_router(auth_router, prefix="/api")

# Rotas para especialidades
@app.get("/api/especialidades", response_model=List[schemas.Especialidade])
def get_especialidades(db: Session = Depends(get_db)):
    especialidades = db.query(models.Especialidade).all()
    return especialidades

# Rotas para médicos
@app.get("/api/medicos", response_model=List[schemas.Medico])
def get_medicos(especialidade_id: int = None, db: Session = Depends(get_db)):
    if especialidade_id:
        medicos = db.query(models.Medico).filter(models.Medico.especialidade_id == especialidade_id).all()
    else:
        medicos = db.query(models.Medico).all()
    return medicos

# Rotas para disponibilidades
@app.get("/api/disponibilidades", response_model=List[schemas.Disponibilidade])
def get_disponibilidades(medico_id: int = None, disponivel: bool = None, db: Session = Depends(get_db)):
    query = db.query(models.Disponibilidade)
    
    if medico_id:
        query = query.filter(models.Disponibilidade.medico_id == medico_id)
    
    if disponivel is not None:
        query = query.filter(models.Disponibilidade.disponivel == disponivel)
    
    disponibilidades = query.all()
    return disponibilidades

# Rotas para agendamentos
@app.post("/api/agendamentos", response_model=schemas.Agendamento)
def criar_agendamento(
    agendamento: schemas.AgendamentoCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verificar se a disponibilidade existe e está disponível
    disponibilidade = db.query(models.Disponibilidade).filter(
        models.Disponibilidade.id == agendamento.disponibilidade_id,
        models.Disponibilidade.disponivel == True
    ).first()
    
    if not disponibilidade:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Horário não disponível ou não encontrado"
        )
    
    # Criar o agendamento
    db_agendamento = models.Agendamento(
        user_id=current_user.id,
        disponibilidade_id=agendamento.disponibilidade_id,
        nome_paciente=agendamento.nome_paciente,
        email_paciente=agendamento.email_paciente,
        telefone_paciente=agendamento.telefone_paciente
    )
    
    # Marcar a disponibilidade como indisponível
    disponibilidade.disponivel = False
    
    # Salvar as alterações no banco de dados
    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)
    
    return db_agendamento

@app.get("/api/agendamentos", response_model=List[schemas.Agendamento])
def listar_agendamentos(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    agendamentos = db.query(models.Agendamento).filter(
        models.Agendamento.user_id == current_user.id
    ).all()
    return agendamentos