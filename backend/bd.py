
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Define o caminho do banco de dados. O arquivo sonorize.db será criado na mesma pasta (backend).
DATABASE_URL = "sqlite:///./sonorize.db"

# Cria o motor do SQLAlchemy
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Cria uma sessão local para interagir com o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para as classes de modelo declarativo
Base = declarative_base()

# --- Modelo da Tabela ---
class Transcript(Base):
    """
    Modelo da tabela para armazenar as transcrições.
    """
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    s3_url = Column(String, nullable=False, unique=True)
    transcription_text = Column(String, nullable=True)
    status = Column(String, default='PENDING') # PENDING, PROCESSING, COMPLETED, FAILED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Transcript(id={self.id}, s3_url='{self.s3_url}')>"

# --- Funções de Interação com o Banco ---

def create_db_and_tables():
    """
    Cria o arquivo do banco de dados e a tabela 'transcripts' se não existirem.
    """
    print("Criando banco de dados e tabelas...")
    Base.metadata.create_all(bind=engine)
    print("Concluído.")

def add_transcript(s3_url: str, transcription_text: str):
    """
    Adiciona um novo registro de transcrição ao banco de dados.
    """
    db = SessionLocal()
    try:
        new_transcript = Transcript(
            s3_url=s3_url,
            transcription_text=transcription_text
        )
        db.add(new_transcript)
        db.commit()
        db.refresh(new_transcript)
        print(f"Transcrição adicionada com sucesso: {new_transcript}")
        return new_transcript
    finally:
        db.close()

def add_audio_url(s3_url: str):
    """
    Adiciona uma nova URL de áudio ao banco com o status PENDENTE.
    Verifica se a URL já existe para evitar duplicatas.
    """
    db = SessionLocal()
    try:
        existing_transcript = db.query(Transcript).filter(Transcript.s3_url == s3_url).first()
        if existing_transcript:
            print(f"URL já existe no banco de dados: {s3_url}")
            return existing_transcript

        new_transcript = Transcript(s3_url=s3_url, status='PENDING')
        db.add(new_transcript)
        db.commit()
        db.refresh(new_transcript)
        print(f"Nova URL de áudio adicionada: {new_transcript}")
        return new_transcript
    finally:
        db.close()

def get_untranscribed_audios():
    """
    Retorna todos os áudios com status 'PENDING'.
    """
    db = SessionLocal()
    try:
        return db.query(Transcript).filter(Transcript.status == 'PENDING').all()
    finally:
        db.close()

def update_transcript_status(transcript_id: int, status: str, transcription_text: str = None):
    """
    Atualiza o status e, opcionalmente, o texto da transcrição de um registro.
    """
    db = SessionLocal()
    try:
        transcript = db.query(Transcript).filter(Transcript.id == transcript_id).first()
        if transcript:
            transcript.status = status
            if transcription_text is not None:
                transcript.transcription_text = transcription_text
            db.commit()
            print(f"Registro {transcript_id} atualizado para status {status}")
            return transcript
        return None
    finally:
        db.close()

# --- Bloco de Execução Principal ---
if __name__ == "__main__":
    # Este bloco será executado quando você rodar o script diretamente.
    # Ex: python backend/BD.py
    
    # 1. Cria o banco de dados e a tabela
    create_db_and_tables()
    
    # 2. Adiciona um dado de exemplo (opcional, descomente para testar)
    # print("\nAdicionando um registro de exemplo...")
    # add_transcript(
    #     s3_url="s3://sonorizeaudios/exemplo.mp3",
    #     transcription_text="Este é um texto de transcrição de exemplo."
    # )

