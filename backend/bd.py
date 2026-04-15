
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

from .auth import get_password_hash

# Define o caminho do banco de dados. O arquivo sonorize.db será criado dentro da pasta 'backend'.
DATABASE_URL = "sqlite:///./backend/sonorize.db"

# Cria o motor do SQLAlchemy
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} # Necessário para o SQLite
)

# Cria uma sessão local para interagir com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para as classes de modelo declarativo
Base = declarative_base()

# --- Modelo da Tabela ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    language_preference = Column(String, default='portuguese')

    transcriptions = relationship("Transcription", back_populates="owner")

class Transcription(Base):
    """
    Modelo da tabela para armazenar as transcrições.
    """
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    transcription_text = Column(Text, nullable=False)
    original_audio_path = Column(String, nullable=True) # Caminho para o áudio original salvo no servidor
    language = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="transcriptions")

# --- Funções de Interação com o Banco ---

def create_db_and_tables():
    """
    Cria o arquivo do banco de dados e a tabela 'transcripts' se não existirem.
    """
    print("Criando banco de dados e tabelas...")
    Base.metadata.create_all(bind=engine)
    print("Concluído.")

def get_user_by_email(email: str):
    """Busca um usuário pelo e-mail."""
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()

def create_user(email: str, password: str):
    """Cria um novo usuário no banco de dados com senha hasheada."""
    db = SessionLocal()
    try:
        hashed_password = get_password_hash(password)
        new_user = User(email=email, hashed_password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    finally:
        db.close()

# --- Bloco de Execução Principal ---
if __name__ == "__main__":
    # Este bloco será executado quando você rodar o script diretamente.
    # Ex: python -m backend.bd
    
    # 1. Cria o banco de dados e a tabela
    create_db_and_tables()
    
    # 2. Adiciona um dado de exemplo (opcional, descomente para testar)
    # print("\nAdicionando um registro de exemplo...")
    # add_transcript(
    #     s3_url="s3://sonorizeaudios/exemplo.mp3",
    #     transcription_text="Este é um texto de transcrição de exemplo."
    # )
