
import os
import logging
from dotenv import load_dotenv
from supabase import create_client, Client
from backend.auth import get_password_hash

# Configuração básica de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
load_dotenv()

# Pega a URL e a Chave da API REST do Supabase
url: str = os.getenv("REACT_APP_SUPABASE_URL")
key: str = os.getenv("REACT_APP_SUPABASE_ANON_KEY")

if not url or not key:
    raise ValueError(
        "As variáveis REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY não foram encontradas.\n"
        "Verifique seu arquivo .env."
    )

try:
    # Cria o cliente do Supabase que conversa com a API REST
    supabase: Client = create_client(url, key)
    logger.info("Cliente Supabase inicializado com sucesso.")
except Exception as e:
    logger.error(f"Erro ao inicializar o cliente Supabase: {e}", exc_info=True)
    raise
# --- Funções de Interação com o Banco ---

def get_user_by_email(email: str):
    """Busca um usuário pelo e-mail."""
    try:
        resposta = supabase.table("usuarios").select("*").eq("email", email).execute()
        if len(resposta.data) > 0:
            return resposta.data[0]
        return None
    except Exception as e:
        logger.error(f"Erro ao buscar usuário pelo email '{email}': {e}", exc_info=True)
        return None

def create_user(login: str, email: str, senha: str):
    """Cria um novo usuário no banco de dados com senha hasheada."""
    try:
        hashed_password = get_password_hash(senha)
        novo_usuario = {
            "login": login,
            "email": email,
            "senha": hashed_password
        }
        resposta = supabase.table("usuarios").insert(novo_usuario).execute()
        if len(resposta.data) > 0:
            return resposta.data[0]
        return None
    except Exception as e:
        logger.error(f"Erro ao criar usuário '{login}' ('{email}'): {e}", exc_info=True)
        return None

def get_all_users():
    """Busca todos os usuários no banco de dados."""
    try:
        resposta = supabase.table("usuarios").select("*").execute()
        return resposta.data
    except Exception as e:
        logger.error(f"Erro ao buscar todos os usuários: {e}", exc_info=True)
        return []
