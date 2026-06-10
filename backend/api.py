from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importações dos nossos novos módulos
from backend.routers import auth, users

app = FastAPI()

# Configuração do CORS para permitir que o frontend (React) acesse a API
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API da Sonorize com autenticação está no ar!"}

# Inclui os roteadores separados
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")

# Futuros endpoints para salvar e listar transcrições irão aqui.