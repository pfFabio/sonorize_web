# Use uma imagem oficial do Python como imagem pai
FROM python:3.9-slim

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia o arquivo de requisitos para o contêiner em /app
COPY backend/requirements.txt .

# Instala os pacotes necessários especificados em requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia o diretório do backend para o contêiner
COPY backend/ ./backend

# Disponibiliza a porta 8000 para o mundo fora deste contêiner
EXPOSE 8000

# Executa o uvicorn. O --host 0.0.0.0 é importante para aceitar conexões de fora do contêiner.
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]