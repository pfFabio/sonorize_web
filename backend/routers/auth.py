from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from backend import bd, auth
from backend.schemas import Token

router = APIRouter(tags=["auth"])

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint de login. Recebe 'username' (login) e 'password' de um formulário."""
    user = bd.get_user_by_login(login=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.get("senha")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.get("email")})
    return {"access_token": access_token, "token_type": "bearer"}
