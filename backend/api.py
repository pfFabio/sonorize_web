from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime
from typing import List

# Importações dos nossos módulos
from backend import bd
from backend import auth

app = FastAPI()

# Configuração do CORS para permitir que o frontend (React) acesse a API
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelos de Dados (Pydantic) ---
class UserCreate(BaseModel):
    login: str
    email: str
    senha: str

class UserResponse(BaseModel):
    id: int
    created_at: datetime
    login: str
    email: str
    lingua: str | None = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Endpoints da API ---

api_router = APIRouter(prefix="/api")

@app.get("/")
def read_root():
    return {"message": "API da Sonorize com autenticação está no ar!"}

@api_router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    """Endpoint para registrar um novo usuário."""
    db_user = bd.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já registrado")
    
    new_user = bd.create_user(login=user.login, email=user.email, senha=user.senha)
    return new_user

@api_router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint de login. Recebe 'username' (e-mail) e 'password' de um formulário."""
    user = bd.get_user_by_email(email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.get("senha")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.get("email")})
    return {"access_token": access_token, "token_type": "bearer"}


# --- Função para obter o usuário atual a partir do token ---

async def get_current_user(token: str = Depends(auth.oauth2_scheme)):
    """Dependência que valida o token e retorna os dados do usuário."""
    payload = auth.decode_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = bd.get_user_by_email(email=email)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

# --- Endpoints Protegidos ---

@api_router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Retorna os dados do usuário que está logado."""
    return current_user

@api_router.get("/users/all", response_model=List[UserResponse])
def list_all_users():
    """Endpoint de teste para listar todos os usuários no banco de dados."""
    users = bd.get_all_users()
    return users


app.include_router(api_router)

# Futuros endpoints para salvar e listar transcrições irão aqui.
# Ex: @app.post("/transcriptions/")
# Ex: @app.get("/transcriptions/", response_model=List[TranscriptionResponse])