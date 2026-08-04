from fastapi import APIRouter, Depends, HTTPException
from typing import List

from backend import bd
from backend.schemas import UserCreate, UserResponse
from backend.deps import get_current_user

router = APIRouter(tags=["users"])


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    """Endpoint para registrar um novo usuário."""
    db_user = bd.get_user_by_email(email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já registrado")

    new_user = bd.create_user(
        login=user.login,
        email=user.email,
        senha=user.senha,
        lingua=user.lingua,
    )
    if not new_user:
        raise HTTPException(status_code=500, detail="Erro interno ao criar o usuário.")
    return new_user


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Retorna os dados do usuário que está logado."""
    return current_user


@router.get("/users/all", response_model=List[UserResponse])
def list_all_users(current_user: dict = Depends(get_current_user)):
    """Lista todos os usuários (requer autenticação)."""
    return bd.get_all_users()
