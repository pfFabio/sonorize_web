import React, { useState } from "react";
// Componentes web equivalentes
// import { useNavigation } from "@react-navigation/native"; // Removido
// import * as DocumentPicker from "expo-document-picker"; // Removido
import { handleSave } from "./fileSaver";
import { pipeline, env } from "@xenova/transformers";
// import styles from "../styles"; // Usaremos estilos inline ou CSS

// Configuração para rodar no navegador buscando do Hugging Face Hub
env.allowLocalModels = false;

// O componente agora recebe props para controlar a navegação
export default function HomeScreen({ navigateTo }) {
  // const navigation = useNavigation(); // Removido
  const [status, setStatus] = useState(null); // null | 'loading' | 'transcribing' | 'done'
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Função para lidar com o envio de áudio usando a API da Web
  const handleFileSelect = () => {
    // Cria um input de arquivo dinamicamente para abrir o seletor de arquivos
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("PASSO 1: Arquivo de áudio selecionado:", file.name);
        const url = URL.createObjectURL(file);
        setAudioFile(url);
        setTranscription("");
        setStatus(null);
        setProgress(0);
      }
    };
    input.click();
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setStatus('loading');
    setProgress(0);

    try {
      // Carrega o modelo Whisper Tiny (leve para navegador)
      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        progress_callback: (data) => {
          if (data.status === 'progress') {
            setProgress(data.progress);
          }
        }
      });

      setStatus('transcribing');
      const result = await transcriber(audioFile, {
        chunk_length_s: 30,
        stride_length_s: 5,
      });
      setTranscription(result.text);
      setStatus('done');
    } catch (err) {
      console.error(err);
      window.alert("Erro na transcrição: " + err.message);
      setStatus(null);
    }
  };

  const handleSaveFile = (format) => {
      handleSave(transcription, format);
      setShowSaveOptions(false);
  };

  return (
    // Substituindo View por div e aplicando estilos
    <div style={styles.card}>
      <img src="src/screens/logo.jpg" alt="Logo" style={{ width: 100, height: 100 }} />

      <button style={styles.button} onClick={() => navigateTo("Gravação")}>
        🎙️ Gravar Áudio
      </button>

      <button style={styles.button} onClick={handleFileSelect}>
        📤 Enviar Arquivo de Áudio
      </button>

      {audioFile && (
        <div style={{ marginTop: 20 }}>
          <audio src={audioFile} controls style={{ width: '100%', marginBottom: 10 }} />
          
          <button 
            style={status === 'loading' || status === 'transcribing' ? styles.disabledButton : styles.startButton} 
            onClick={handleTranscribe}
            disabled={status === 'loading' || status === 'transcribing'}
          >
            {status === 'loading' ? `Carregando Modelo (${Math.round(progress)}%)...` : 
             status === 'transcribing' ? "Transcrevendo..." : 
             "⚡ Transcrever com Whisper (Local)"}
          </button>
          
          <p style={{fontSize: 12, color: '#666'}}>
            Nota: O processamento é feito localmente no seu navegador usando Transformers.js.
          </p>

          <textarea
            style={styles.textInput}
            rows={10}
            value={transcription}
            readOnly
            placeholder={
              status === 'transcribing' ? "Processando áudio..." : 
              "A transcrição aparecerá aqui..."
            }
          />

          {transcription && (
            <button style={styles.button} onClick={() => setShowSaveOptions(true)}>
              💾 Salvar Transcrição
            </button>
          )}
        </div>
      )}

      {/* Modal de Opções de Salvamento */}
      {showSaveOptions && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <p style={styles.modalTitle}>Escolha o formato para salvar</p>
            <button style={styles.modalButton} onClick={() => handleSaveFile('txt')}>.txt</button>
            <button style={styles.modalButton} onClick={() => handleSaveFile('pdf')}>.pdf</button>
            <button style={styles.modalButton} onClick={() => handleSaveFile('csv')}>.csv</button>
            <button 
              style={{...styles.modalButton, backgroundColor: '#6c757d', marginTop: 20}} 
              onClick={() => setShowSaveOptions(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
   </div>
  );
}

// Exemplo de estilos que podem ser usados.
// Idealmente, isso viria de um arquivo CSS ou de uma biblioteca CSS-in-JS.
const styles = {
  card: {
    padding: 20,
    margin: 20,
    marginLeft: 250,
    marginRight: 250,
    borderRadius: 40,
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 20px',
    border: 'none',
    borderRadius: 5,
    fontSize: 16,
    cursor: 'pointer',
    margin: '10px 0',
    width: '100%',
  },
  subtitle: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  textMuted: {
    color: '#6c757d',
  },
  startButton: {
    backgroundColor: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '10px 0', width: '100%'
  },
  disabledButton: {
    backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'not-allowed', margin: '10px 0', width: '100%'
  },
  textInput: {
    width: 'calc(100% - 22px)', border: '1px solid #ccc', padding: 10, marginTop: 10, minHeight: 100, textAlign: 'left', fontFamily: 'sans-serif', fontSize: 16,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px 40px',
    borderRadius: 10,
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '5px 0', width: '100%'
  },
};
