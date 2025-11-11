import boto3
from botocore.exceptions import ClientError
import logging
import os
from dotenv import load_dotenv

load_dotenv()

def upload_file_to_s3(file_name, bucket, object_name=None):
    """
    Carrega um arquivo para um bucket S3

    :param file_name: Nome do arquivo local a ser carregado.
    :param bucket: Nome do bucket S3.
    :param object_name: Nome do objeto S3 (caminho no bucket). 
                        Se não for especificado, o file_name será usado.
    :return: True se o arquivo foi carregado, False caso contrário.
    """
    # Se o nome do objeto S3 não foi especificado, use o nome do arquivo local
    if object_name is None:
        object_name = os.path.basename(file_name)

    # Crie um cliente S3
    s3_client = boto3.client('s3')
    
    try:
        s3_client.upload_file(file_name, bucket, object_name)
        logging.info(f"Arquivo '{file_name}' carregado com sucesso para '{bucket}/{object_name}'")
        return True
    except ClientError as e:
        logging.error(e)
        return False

def generate_presigned_url(bucket_name, object_name, expiration=3600):
    """
    Gera uma URL pré-assinada para o upload de um arquivo para o S3.

    :param bucket_name: Nome do bucket.
    :param object_name: Nome do objeto S3 (caminho no bucket).
    :param expiration: Tempo em segundos para a URL expirar (padrão: 1 hora).
    :return: A URL pré-assinada ou None em caso de erro.
    """
    s3_client = boto3.client('s3', region_name=os.environ.get("AWS_REGION"))
    try:
        response = s3_client.generate_presigned_post(
            bucket_name,
            object_name,
            Fields={"acl": "public-read"}, # Opcional: define o objeto como público
            Conditions=[{"acl": "public-read"}], # Opcional
            ExpiresIn=expiration
        )
        return response
    except ClientError as e:
        logging.error(e)
        return None

def download_file_from_s3(bucket_name, object_name, file_name=None):
    """
    Baixa um arquivo de um bucket S3.

    :param bucket_name: Nome do bucket.
    :param object_name: Nome do objeto S3 a ser baixado.
    :param file_name: Caminho local para salvar o arquivo. Se não for fornecido, o nome do objeto S3 será usado.
    :return: Caminho do arquivo local se o download for bem-sucedido, None caso contrário.
    """
    if file_name is None:
        file_name = os.path.basename(object_name)

    s3_client = boto3.client('s3')
    try:
        s3_client.download_file(bucket_name, object_name, file_name)
        logging.info(f"Arquivo '{object_name}' baixado de '{bucket_name}' para '{file_name}'")
        return file_name
    except ClientError as e:
        logging.error(e)
        return None

# --- Exemplo de Uso ---
if __name__ == '__main__':
    # Substitua pelos seus valores
    NOME_DO_ARQUIVO_LOCAL = "30 de set. 07.58_.mp3"
    NOME_DO_BUCKET = "sonorizeaudios"  # Ex: "meu-bucket-exemplo-2025"
    NOME_DO_OBJETO_S3 = "audiosteste" # Opcional: Define o caminho no S3
    
    # Se NOME_DO_OBJETO_S3 for None, será usado o nome do arquivo local
    upload_success = upload_file_to_s3(NOME_DO_ARQUIVO_LOCAL, NOME_DO_BUCKET, NOME_DO_OBJETO_S3)
    
    if upload_success:
        print("Upload concluído com sucesso!")
    else:
        print("Falha no upload.")