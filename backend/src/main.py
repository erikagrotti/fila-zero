from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routers import auth_router

app = FastAPI()

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Libera apenas para o Angular local
    allow_credentials=True,
    allow_methods=["*"],  # Libera todos os métodos: GET, POST, PUT, DELETE...
    allow_headers=["*"],  # Libera todos os headers (incluindo Authorization)
)

# Inclui o router da autenticação
app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
