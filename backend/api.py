from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importações dos nossos novos módulos
from backend.routers import auth, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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