from fastapi import FastAPI, File, UploadFile, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
import tempfile
import os
import torch
import uuid

# Importações dos nossos módulos
from . import bd
from . import s3Bucket

# Verifique se a GPU está disponível e defina o dispositivo
device = "cuda" if torch.cuda.is_available() else "cpu"

# Cria o banco de dados e as tabelas se não existirem
bd.create_db_and_tables()

app = FastAPI()

# Configuração do CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carrega o modelo Whisper
print("Carregando o modelo Whisper...")
model = whisper.load_model("base", device=device)
print("Modelo Whisper carregado.")

# --- Modelos de Dados (Pydantic) ---
class PresignedUrlRequest(BaseModel):
    file_name: str

class AudioRequest(BaseModel):
    s3_url: str

# --- Lógica do Worker de Transcrição ---

def process_single_transcription(transcript_id: int, s3_url: str):
    """
    Função que processa uma única transcrição.
    É executada em segundo plano.
    """
    bucket_name = os.environ.get("S3_BUCKET_NAME", "sonorizeaudios")
    object_name = s3_url.split(f"s3://{bucket_name}/")[-1]
    
    local_file_path = None
    try:
        # 1. Atualiza o status para "PROCESSANDO"
        bd.update_transcript_status(transcript_id, status='PROCESSING')

        # 2. Baixa o arquivo do S3
        print(f"Baixando {object_name} do S3...")
        with tempfile.TemporaryDirectory() as tmpdir:
            local_file_path = os.path.join(tmpdir, os.path.basename(object_name))
            downloaded_path = s3Bucket.download_file_from_s3(bucket_name, object_name, local_file_path)

            if not downloaded_path:
                raise Exception("Falha no download do S3")

            # 3. Realiza a transcrição
            print(f"Transcrevendo {local_file_path}...")
            result = model.transcribe(downloaded_path, fp16=torch.cuda.is_available())
            transcription = result["text"]

            # 4. Atualiza o status para "CONCLUÍDO" com o texto
            print(f"Transcrição concluída para {transcript_id}. Atualizando banco de dados.")
            bd.update_transcript_status(transcript_id, status='COMPLETED', transcription_text=transcription)

    except Exception as e:
        print(f"Erro ao processar a transcrição {transcript_id}: {e}")
        bd.update_transcript_status(transcript_id, status='FAILED')
    

# --- Endpoints da API ---

@app.get("/")
def read_root():
    return {"message": "API da Sonorize está no ar!"}

@app.post("/generate-presigned-url")
async def generate_presigned_url_endpoint(request: PresignedUrlRequest):
    """
    Gera uma URL pré-assinada para o cliente fazer o upload do áudio para o S3.
    """
    bucket_name = os.environ.get("S3_BUCKET_NAME", "sonorizeaudios")
    # Gera um nome de arquivo único para evitar sobreposições
    file_extension = os.path.splitext(request.file_name)[1]
    unique_object_name = f"uploads/{uuid.uuid4()}{file_extension}"

    presigned_data = s3Bucket.generate_presigned_url(bucket_name, unique_object_name)
    if not presigned_data:
        raise HTTPException(status_code=500, detail="Não foi possível gerar a URL de upload.")
    
    # A URL final do objeto será construída no cliente, mas podemos retorná-la para referência
    final_url = f"s3://{bucket_name}/{unique_object_name}"
    print("presigned_data", presigned_data)
    print("s3_object_url", final_url)

    return {"presigned_data": presigned_data, "s3_object_url": final_url}

@app.post("/audio")
async def add_audio_endpoint(request: AudioRequest, background_tasks: BackgroundTasks):
    """
    Recebe a URL de um áudio no S3, salva no banco e inicia a transcrição em background.
    """
    new_audio = bd.add_audio_url(s3_url=request.s3_url)
    if not new_audio:
        raise HTTPException(status_code=500, detail="Não foi possível salvar a URL do áudio.")

    # Adiciona a tarefa de transcrição para ser executada em segundo plano
    background_tasks.add_task(process_single_transcription, new_audio.id, new_audio.s3_url)

    return {"message": "Áudio recebido e agendado para transcrição.", "transcript_id": new_audio.id}

@app.get("/transcripts")
async def get_transcripts_endpoint():
    """
    Retorna todas as transcrições do banco de dados.
    """
    db = bd.SessionLocal()
    try:
        transcripts = db.query(bd.Transcript).order_by(bd.Transcript.created_at.desc()).all()
        return transcripts
    finally:
        db.close()

@app.get("/transcripts/{transcript_id}")
async def get_transcript_by_id(transcript_id: int):
    """
    Retorna uma transcrição específica pelo seu ID.
    """
    db = bd.SessionLocal()
    try:
        transcript = db.query(bd.Transcript).filter(bd.Transcript.id == transcript_id).first()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcrição não encontrada.")
        return transcript
    finally:
        db.close()

# Endpoint de "health check" ou para iniciar o processamento manualmente se necessário
@app.post("/process-pending")
async def process_pending_transcripts(background_tasks: BackgroundTasks):
    """
    Busca por áudios pendentes e os enfileira para transcrição.
    """
    pending_audios = bd.get_untranscribed_audios()
    count = 0
    for audio in pending_audios:
        # Apenas enfileirar se não estiver sendo processado
        if audio.status == 'PENDING':
            background_tasks.add_task(process_single_transcription, audio.id, audio.s3_url)
            count += 1
    
    return {"message": f"{count} transcrições pendentes foram enfileiradas para processamento."}

# O endpoint /transcribe original foi removido, pois o fluxo agora é assíncrono.