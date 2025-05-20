# fila-zero
 
# Ativar vent:
source venv/bin/activate

# Baixar todas as dependências do requirements:
    pip install -r requirements.txt

# Atualizar as dependências do requirements:
pip freeze > requirements.txt

# Rodar aplicação:
uvicorn src.main:app --reload