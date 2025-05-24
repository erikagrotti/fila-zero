from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time, datetime
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
from database import engine, get_db
from auth import router as auth_router, get_current_user

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL do frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
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
        telefone_paciente=agendamento.telefone_paciente,
        data_consulta_data=disponibilidade.data,
        data_consulta_hora=disponibilidade.hora
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

@app.delete("/api/agendamentos/{agendamento_id}")
def cancelar_agendamento(
    agendamento_id: int, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    # Buscar o agendamento
    agendamento = db.query(models.Agendamento).filter(
        models.Agendamento.id == agendamento_id,
        models.Agendamento.user_id == current_user.id
    ).first()
    
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Buscar a disponibilidade associada
    disponibilidade = db.query(models.Disponibilidade).filter(
        models.Disponibilidade.id == agendamento.disponibilidade_id
    ).first()
    
    if disponibilidade:
        # Marcar a disponibilidade como disponível novamente
        disponibilidade.disponivel = True
    
    # Atualizar o status do agendamento para cancelado
    agendamento.status = "cancelado"
    
    # Salvar as alterações
    db.commit()
    
    return {"message": "Agendamento cancelado com sucesso"}

@app.get("/api/agendamentos/hoje", response_model=List[schemas.Agendamento])
def listar_agendamentos_hoje(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    hoje = datetime.now().date()
    agendamentos = db.query(models.Agendamento).filter(
        models.Agendamento.data_consulta_data == hoje
    ).all()
    return agendamentos

# Rota para verificar o status do servidor
@app.get("/api/health")
def health_check():
    return {"status": "ok"}