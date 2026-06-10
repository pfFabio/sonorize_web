from fastapi import Depends, HTTPException, status
from backend import auth, bd

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
