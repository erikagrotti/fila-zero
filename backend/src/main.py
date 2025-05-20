from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.api.routers import auth_router
from src.api.routers import agendamento_router

# Importar todos os modelos para garantir que sejam carregados corretamente
import src.database.models
from src.database.seed import seed_database

app = FastAPI()

# Configuração do CORS
origins = [
    "http://localhost:4200",  # Frontend Angular
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Rota de teste para verificar CORS
@app.get("/test-cors")
def test_cors():
    return {"message": "CORS está funcionando!"}

# Rota para verificar se o servidor está funcionando
@app.get("/")
def read_root():
    return {"status": "API está funcionando!"}

# Inclui o router da autenticação
app.include_router(auth_router.router, prefix="/auth", tags=["auth"])

# Inclui o router de agendamento
app.include_router(agendamento_router.router)

# Tratamento de exceções global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"message": f"Erro interno do servidor: {str(exc)}"},
    )

# Evento de inicialização do aplicativo
@app.on_event("startup")
async def startup_event():
    # Popula o banco de dados com dados iniciais
    seed_database()