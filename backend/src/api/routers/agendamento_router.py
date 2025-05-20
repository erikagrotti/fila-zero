from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import traceback

# Importar todos os modelos através do __init__.py para garantir a ordem correta
from src.database.models import Medico, Especialidade, Disponibilidade
from src.database.connection import get_db
from src.api.schemas.agendamento_schemas import MedicoResponse, EspecialidadeResponse, DisponibilidadeResponse

router = APIRouter(prefix="/api/agendamento", tags=["agendamento"])

@router.get("/especialidades", response_model=List[EspecialidadeResponse])
def get_especialidades(response: Response, db: Session = Depends(get_db)):
    # Adiciona cabeçalhos CORS manualmente
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    try:
        especialidades = db.query(Especialidade).all()
        return especialidades
    except Exception as e:
        print(f"Erro ao buscar especialidades: {str(e)}")
        traceback.print_exc()  # Imprime o stack trace completo
        raise HTTPException(status_code=500, detail=f"Erro ao buscar especialidades: {str(e)}")

@router.options("/especialidades")
def options_especialidades(response: Response):
    # Responde a requisições OPTIONS para o endpoint de especialidades
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return {}

@router.get("/medicos/especialidade/{especialidade_id}", response_model=List[MedicoResponse])
def get_medicos_por_especialidade(especialidade_id: int, response: Response, db: Session = Depends(get_db)):
    # Adiciona cabeçalhos CORS manualmente
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    try:
        especialidade = db.query(Especialidade).filter(Especialidade.id == especialidade_id).first()
        if not especialidade:
            raise HTTPException(status_code=404, detail="Especialidade não encontrada")
        
        return especialidade.medicos
    except Exception as e:
        print(f"Erro ao buscar médicos: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar médicos: {str(e)}")

@router.get("/disponibilidades/medico/{medico_id}", response_model=List[DisponibilidadeResponse])
def get_disponibilidades_por_medico(medico_id: int, response: Response, db: Session = Depends(get_db)):
    # Adiciona cabeçalhos CORS manualmente
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:4200"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    try:
        medico = db.query(Medico).filter(Medico.id == medico_id).first()
        if not medico:
            raise HTTPException(status_code=404, detail="Médico não encontrado")
        
        disponibilidades = db.query(Disponibilidade).filter(
            Disponibilidade.medico_id == medico_id,
            Disponibilidade.disponivel == True
        ).all()
        
        # Converter para o formato esperado pelo schema
        result = []
        for disp in disponibilidades:
            result.append({
                "id": disp.id,
                "medico_id": disp.medico_id,
                "data": disp.data,
                "hora_inicio": disp.horario,
                "hora_fim": None,
                "disponivel": disp.disponivel
            })
        
        return result
    except Exception as e:
        print(f"Erro ao buscar disponibilidades: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar disponibilidades: {str(e)}")