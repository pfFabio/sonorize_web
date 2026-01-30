import React, { useState, useEffect, useRef } from "react";
// import { View, Text, ... } from "react-native"; // Removido
// import Voice from "@react-native-voice/voice"; // Removido
import { handleSave as saveTranscript } from "./fileSaver";

// A prop 'route' é simulada passando as props diretamente
export default function TranscriptScreen({ route }) {
  const [recognizedText, setRecognizedText] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);

  // Verifica se uma transcrição foi passada via navegação
  const staticTranscription = route.params?.transcription;

  useEffect(() => {
    // Se recebemos uma transcrição estática, apenas a exibimos.
    if (staticTranscription) {
      setRecognizedText(staticTranscription);
      return; // Não inicializa o Voice
    }

    // Verifica se o navegador suporta a Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Este navegador não suporta a Web Speech API.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true; // Resultados parciais
    recognition.continuous = true; // Continua escutando
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Atualiza o texto com o resultado final e o parcial
      setRecognizedText(prev => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Erro de reconhecimento de voz:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      // Reinicia automaticamente se ainda estiver no modo de escuta
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [staticTranscription, isListening]); // Adicionado isListening para reiniciar a escuta

  // Auto-scroll para o final do textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [recognizedText]);

  const startListening = async () => {
    if (!recognitionRef.current) return;
    try {
      // Solicita permissão ao iniciar
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecognizedText("");
      setIsListening(true);
      recognitionRef.current.start();
    } catch (e) {
      console.error("Erro ao iniciar:", e);
      window.alert("Permissão para microfone negada ou erro ao iniciar.");
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  // Manipulador para salvar a transcrição
  const handleSave = (format) => {
    saveTranscript(recognizedText, format);
    setShowSaveOptions(false); // Fecha o modal após o download
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {staticTranscription ? "📄 Transcrição do Áudio" : "🎙️ Transcrição em Tempo Real"}
      </h2>

      <textarea
        ref={textAreaRef}
        style={styles.textBox}
        value={recognizedText}
        readOnly={!staticTranscription} // Permite edição se for transcrição estática
        onChange={(e) => staticTranscription && setRecognizedText(e.target.value)}
      />

      {!staticTranscription && (
        <button
          style={isListening ? styles.stopButton : styles.startButton}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? "Parar" : "Iniciar"}
        </button>
      )}

      {staticTranscription && (
        <button
          style={{ ...styles.startButton, backgroundColor: "#007bff" }}
          onClick={() => setShowSaveOptions(true)}
        >
          💾 Salvar Transcrição
        </button>
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

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '80vh', padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  textBox: {
    flex: 1, // Ocupa o espaço disponível
    border: "1px solid #ccc",
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    fontSize: 18,
    fontFamily: 'sans-serif',
  },
  startButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    cursor: 'pointer',
    border: 'none',
  },
  stopButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    cursor: 'pointer',
    border: 'none',
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
  }
};
