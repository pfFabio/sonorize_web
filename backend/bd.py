import os
import logging
from typing import Optional

from supabase import create_client, Client
from backend.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

url: str = os.getenv("VITE_SUPABASE_URL")
key: str = os.getenv("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError(
        "As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não foram encontradas.\n"
        "Verifique seu arquivo .env."
    )

try:
    supabase: Client = create_client(url, key)
    logger.info("Cliente Supabase inicializado com sucesso.")
except Exception as e:
    logger.error(f"Erro ao inicializar o cliente Supabase: {e}", exc_info=True)
    raise


def get_user_by_email(email: str) -> Optional[dict]:
    """Busca um usuário pelo e-mail."""
    try:
        resposta = supabase.table("usuarios").select("*").eq("email", email).execute()
        return resposta.data[0] if resposta.data else None
    except Exception as e:
        logger.error(f"Erro ao buscar usuário pelo email '{email}': {e}", exc_info=True)
        return None


def get_user_by_login(login: str) -> Optional[dict]:
    """Busca um usuário pelo login."""
    try:
        resposta = supabase.table("usuarios").select("*").eq("login", login).execute()
        return resposta.data[0] if resposta.data else None
    except Exception as e:
        logger.error(f"Erro ao buscar usuário pelo login '{login}': {e}", exc_info=True)
        return None


def create_user(login: str, email: str, senha: str, lingua: Optional[str] = None) -> Optional[dict]:
    """Cria um novo usuário no banco de dados com senha hasheada."""
    try:
        novo_usuario = {
            "login": login,
            "email": email,
            "senha": get_password_hash(senha),
        }
        if lingua:
            novo_usuario["lingua"] = lingua

        resposta = supabase.table("usuarios").insert(novo_usuario).execute()
        return resposta.data[0] if resposta.data else None
    except Exception as e:
        logger.error(f"Erro ao criar usuário '{login}' ('{email}'): {e}", exc_info=True)
        return None


def get_all_users() -> list:
    """Busca todos os usuários no banco de dados."""
    try:
        resposta = supabase.table("usuarios").select("*").execute()
        return resposta.data
    except Exception as e:
        logger.error(f"Erro ao buscar todos os usuários: {e}", exc_info=True)
        return []
