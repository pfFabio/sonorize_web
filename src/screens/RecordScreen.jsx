import React, { useState, useRef } from "react";
import { handleSave as saveTranscript } from "./fileSaver";

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Refs para a API de gravação do navegador
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Checa se o navegador suporta a Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechRecognitionSupported = !!SpeechRecognition;

  // Iniciar gravação
  async function startRecording() {
    setLiveTranscript("");
    setTranscript("");
    try {
      // Solicita permissão para usar o microfone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastRecordingUri(audioUrl);

        // Para a stream do microfone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      if (isSpeechRecognitionSupported) {
        startLiveTranscription();
      }

    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      window.alert("Não foi possível iniciar a gravação. Verifique a permissão do microfone.");
    }
  }

  // Iniciar transcrição ao vivo
  function startLiveTranscription() {
    if (!isSpeechRecognitionSupported) return;

    speechRecognitionRef.current = new SpeechRecognition();
    speechRecognitionRef.current.continuous = true;
    speechRecognitionRef.current.interimResults = true;
    
    const appLang = localStorage.getItem('appLanguage') || 'portuguese';
    const langMap = {
      portuguese: 'pt-BR', english: 'en-US', spanish: 'es-ES', french: 'fr-FR',
      german: 'de-DE', japanese: 'ja-JP', chinese: 'zh-CN', russian: 'ru-RU'
    };
    speechRecognitionRef.current.lang = langMap[appLang] || 'pt-BR';

    speechRecognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }
      setLiveTranscript(finalTranscript + interimTranscript);
    };



    speechRecognitionRef.current.start();
  }

  // Parar transcrição ao vivo
  function stopLiveTranscription() {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
  }

  // Limpa o intervalo se o componente for desmontado
  React.useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Parar gravação
  async function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      if (isSpeechRecognitionSupported) {
        setTranscript(liveTranscript);
        stopLiveTranscription();
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  // Manipulador principal de salvamento que decide o que fazer com base no formato
  const handleSave = (format) => {
    const textToSave = transcript || liveTranscript;
    saveTranscript(textToSave, format);
    setShowSaveOptions(false); // Fecha o modal após o download
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    else {
      startRecording();
    }
  };

  return (
    <div style={styles.card}>
      <p style={styles.title}>
        {isRecording ? "Gravando..." : "Pressione o botão para gravar"}

      </p>

      <button
        style={isRecording ? styles.stopButton : styles.button}
        onClick={toggleRecording}
        disabled={!isSpeechRecognitionSupported}
      >
        {isRecording ? "⏹️ Parar" : "🎙️ Iniciar"}
      </button>

      {!isSpeechRecognitionSupported && (
        <p style={{ color: 'red', marginTop: 10 }}>
          Seu navegador não suporta a transcrição em tempo real.
        </p>
      )}

      {isRecording && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, fontWeight: "bold" }}>Transcrição ao vivo</p>
          <textarea
            style={styles.textInput}
            rows={6}
            value={liveTranscript}
            readOnly
          />
        </div>
      )}

      {lastRecordingUri && (
        <div style={{ marginTop: 20 }}>
          <p style={styles.subtitle}>Última gravação</p>{" "}
          {/* Adicionado espaço para consistência visual */}
          <audio src={lastRecordingUri} controls />
        </div>
      )}

      {transcript && !isRecording && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, fontWeight: "bold" }}>Transcrição:</p>
          <textarea
            style={styles.textInput}
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          {/* O botão de salvar agora abre o modal */}
          <button
            style={{ ...styles.button, marginTop: 10 }}
            onClick={() => setShowSaveOptions(true)}
          >
            💾 Salvar
          </button>
          <button
            style={{ ...styles.button, marginTop: 10 }}
            onClick={() => navigator.clipboard.writeText(transcript)}
          >
            📋 Copiar
          </button>
          <button
            style={{ ...styles.button, marginTop: 10, backgroundColor: '#dc3545' }}
            onClick={() => {
              setTranscript("");
              setLiveTranscript("");
            }}
          >
            🗑️ Limpar
          </button>
        </div>
      )}

      {/* Modal de Opções de Salvamento */}
      {showSaveOptions && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <p style={styles.modalTitle}>Escolha o formato para salvar</p>
            <button style={styles.modalButton} onClick={() => handleSave('txt')}>
              Salvar como .txt
            </button>
            <button style={styles.modalButton} onClick={() => handleSave('pdf')}>
              Salvar como .pdf
            </button>
            <button style={styles.modalButton} onClick={() => handleSave('csv')}>
              Salvar como .csv
            </button>
            <button style={{...styles.modalButton, backgroundColor: '#6c757d', marginTop: 20}} onClick={() => setShowSaveOptions(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos de exemplo
const styles = {
  card: {
    padding: 20,
    margin: '10px auto',
    width: '100%',
    maxWidth: 600,
    borderRadius: 15,
    backgroundColor: '#f9f9f9', 
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  button: { backgroundColor: '#007bff', color: 'white', padding: '15px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '10px 0', width: '100%' },
  stopButton: { backgroundColor: '#dc3545', color: 'white', padding: '15px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '10px 0', width: '100%' },
  textInput: {
    width: '100%',
    border: '1px solid #ccc',
    padding: 10,
    marginTop: 10,
    minHeight: 100,
    textAlign: 'left',
    fontFamily: 'sans-serif',
    fontSize: 16,
    boxSizing: 'border-box',
    borderRadius: 8,
  },
  // Estilos para o Modal
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
