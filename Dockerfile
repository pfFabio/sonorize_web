# Usar uma imagem oficial do Python como base
FROM python:3.11-slim

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar o arquivo de dependências primeiro para aproveitar o cache do Docker
COPY backend/requirements.txt .

# Instalar as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código do backend para o diretório de trabalho
COPY backend/ ./backend/

# Expor a porta 8000 para que possamos nos conectar à API de fora do contêiner
EXPOSE 8000

# O comando para iniciar a aplicação quando o contêiner rodar
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]