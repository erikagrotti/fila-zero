from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time, datetime
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func

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
    hoje = datetime.now().date()
    query = db.query(models.Disponibilidade).filter(models.Disponibilidade.data >= hoje)
    
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
    
    # Verificar se a data é futura
    hoje = datetime.now().date()
    if disponibilidade.data < hoje:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível agendar para datas passadas"
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
    
    # Contar quantos agendamentos já existem para esta disponibilidade
    count_agendamentos = db.query(func.count(models.Agendamento.id)).filter(
        models.Agendamento.disponibilidade_id == disponibilidade.id,
        models.Agendamento.status != "cancelado"
    ).scalar()
    
    # Marcar a disponibilidade como indisponível apenas se atingir o limite (5 agendamentos)
    if count_agendamentos >= 4:  # Já vai ser o 5º agendamento
        disponibilidade.disponivel = False
    
    # Salvar as alterações no banco de dados
    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)
    
    return db_agendamento

@app.get("/api/agendamentos", response_model=List[schemas.Agendamento])
def listar_agendamentos(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    hoje = datetime.now().date()
    
    # Atualizar status de agendamentos passados
    agendamentos_passados = db.query(models.Agendamento).filter(
        models.Agendamento.data_consulta_data < hoje,
        models.Agendamento.status.in_(["confirmado", "aguardando"])
    ).all()
    
    for agendamento in agendamentos_passados:
        agendamento.status = "expirado"
    
    if agendamentos_passados:
        db.commit()
    
    # Retornar apenas agendamentos confirmados e cancelados
    agendamentos = db.query(models.Agendamento).filter(
        models.Agendamento.user_id == current_user.id,
        models.Agendamento.status.in_(["confirmado", "cancelado"])
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

@app.get("/api/agendamentos/hoje", response_model=List[schemas.AgendamentoComFila])
def listar_agendamentos_hoje(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    hoje = datetime.now().date()
    
    # Consulta com join para obter informações do médico e especialidade
    # Filtrando apenas agendamentos do usuário atual, para o dia atual e não cancelados
    agendamentos = db.query(models.Agendamento)\
        .join(models.Disponibilidade)\
        .join(models.Medico, models.Disponibilidade.medico_id == models.Medico.id)\
        .join(models.Especialidade, models.Medico.especialidade_id == models.Especialidade.id)\
        .filter(
            models.Agendamento.user_id == current_user.id,
            models.Agendamento.data_consulta_data == hoje,
            models.Agendamento.status != "cancelado"
        )\
        .all()
    
    # Adicionar informações do médico e especialidade aos agendamentos
    for agendamento in agendamentos:
        agendamento.nome_medico = agendamento.disponibilidade.medico.nome
        agendamento.nome_especialidade = agendamento.disponibilidade.medico.especialidade.nome
    
    return agendamentos

# Rotas para fila de atendimento
@app.post("/api/fila", response_model=schemas.FilaAtendimento)
def realizar_checking(
    fila_data: schemas.FilaAtendimentoCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verificar se o agendamento existe
    agendamento = db.query(models.Agendamento).filter(
        models.Agendamento.id == fila_data.agendamento_id
    ).first()
    
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar se o agendamento já está na fila
    fila_existente = db.query(models.FilaAtendimento).filter(
        models.FilaAtendimento.agendamento_id == fila_data.agendamento_id
    ).first()
    
    if fila_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agendamento já está na fila"
        )
    
    # Atualizar o status do agendamento para "aguardando"
    agendamento.status = "aguardando"
    
    # Obter a última posição na fila para o mesmo médico e data, considerando o tipo de fila
    medico_id = agendamento.disponibilidade.medico_id
    data_consulta = agendamento.data_consulta_data
    
    # Obter a última posição na fila preferencial
    ultima_posicao_preferencial = db.query(models.FilaAtendimento)\
        .join(models.Agendamento)\
        .join(models.Disponibilidade)\
        .filter(
            models.Disponibilidade.medico_id == medico_id,
            models.Agendamento.data_consulta_data == data_consulta,
            models.FilaAtendimento.tipo_fila == "preferencial"
        ).count()
    
    # Obter a última posição na fila comum
    ultima_posicao_comum = db.query(models.FilaAtendimento)\
        .join(models.Agendamento)\
        .join(models.Disponibilidade)\
        .filter(
            models.Disponibilidade.medico_id == medico_id,
            models.Agendamento.data_consulta_data == data_consulta,
            models.FilaAtendimento.tipo_fila == "comum"
        ).count()
    
    # Definir a posição baseada no tipo de fila
    if fila_data.tipo_fila == "preferencial":
        nova_posicao = ultima_posicao_preferencial + 1
    else:
        nova_posicao = ultima_posicao_comum + 1
    
    # Criar entrada na fila
    nova_fila = models.FilaAtendimento(
        agendamento_id=fila_data.agendamento_id,
        tipo_fila=fila_data.tipo_fila,
        posicao=nova_posicao
    )
    
    db.add(nova_fila)
    db.commit()
    db.refresh(nova_fila)
    
    return nova_fila

@app.delete("/api/fila/{agendamento_id}")
def abandonar_fila(
    agendamento_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verificar se o agendamento existe
    agendamento = db.query(models.Agendamento).filter(
        models.Agendamento.id == agendamento_id
    ).first()
    
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar se o agendamento está na fila
    fila = db.query(models.FilaAtendimento).filter(
        models.FilaAtendimento.agendamento_id == agendamento_id
    ).first()
    
    if not fila:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não está na fila"
        )
    
    # Obter informações para reajustar posições
    posicao_removida = fila.posicao
    medico_id = agendamento.disponibilidade.medico_id
    data_consulta = agendamento.data_consulta_data
    
    # Remover da fila
    db.delete(fila)
    
    # Atualizar o status do agendamento para "confirmado"
    agendamento.status = "confirmado"
    
    # Reajustar posições dos outros na fila
    filas_para_atualizar = db.query(models.FilaAtendimento)\
        .join(models.Agendamento)\
        .join(models.Disponibilidade)\
        .filter(
            models.Disponibilidade.medico_id == medico_id,
            models.Agendamento.data_consulta_data == data_consulta,
            models.FilaAtendimento.posicao > posicao_removida
        ).all()
    
    for fila_item in filas_para_atualizar:
        fila_item.posicao -= 1
    
    db.commit()
    
    return {"message": "Agendamento removido da fila com sucesso"}

@app.get("/api/fila", response_model=List[schemas.FilaAtendimento])
def listar_fila(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    hoje = datetime.now().date()
    
    fila = db.query(models.FilaAtendimento)\
        .join(models.Agendamento)\
        .filter(
            models.Agendamento.data_consulta_data == hoje,
            models.FilaAtendimento.status != "finalizado"
        )\
        .order_by(
            models.FilaAtendimento.tipo_fila.desc(),  # preferencial primeiro
            models.FilaAtendimento.posicao
        ).all()
    
    return fila

@app.put("/api/fila/{fila_id}", response_model=schemas.FilaAtendimento)
def atualizar_status_fila(
    fila_id: int,
    fila_update: schemas.FilaAtendimentoUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verificar se a entrada na fila existe
    fila = db.query(models.FilaAtendimento).filter(
        models.FilaAtendimento.id == fila_id
    ).first()
    
    if not fila:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrada na fila não encontrada"
        )
    
    # Atualizar o status
    fila.status = fila_update.status
    
    # Se o status for "finalizado", atualizar também o status do agendamento
    if fila_update.status == "finalizado":
        agendamento = db.query(models.Agendamento).filter(
            models.Agendamento.id == fila.agendamento_id
        ).first()
        
        if agendamento:
            agendamento.status = "finalizado"
    
    db.commit()
    db.refresh(fila)
    
    return fila

# Rota para verificar o status do servidor
@app.get("/api/health")
def health_check():
    return {"status": "ok"}