import React, { useState, useRef } from "react";
// import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native"; // Removido
// import { Audio } from "expo-av"; // Removido
// import * as FileSystem from "expo-file-system"; // Removido
// import { uploadAndTranscribeAudio, getTranscriptionStatus } from "../api"; // Caminho atualizado
// import styles from "../styles"; // Usaremos estilos inline ou CSS

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");

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
        setTranscript(liveTranscript); // Salva a transcrição ao vivo final

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
    speechRecognitionRef.current.lang = "pt-BR";

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
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (isSpeechRecognitionSupported) {
        stopLiveTranscription();
      }
    }
  }

  // Salvar transcrição como arquivo .txt
  async function saveTranscript() {
    const textToSave = transcript || liveTranscript;
    if (!textToSave) {
      window.alert("Nada para salvar", "Grave algo primeiro.");
      return;
    }

    try {
      const blob = new Blob([textToSave], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcricao.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      window.alert("Salvo!", `O download de 'transcricao.txt' deve ter começado.`);
    } catch (err) {
      console.error("Erro ao salvar arquivo:", err);
      window.alert("Erro", "Não foi possível salvar o arquivo.");
    }
  }

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
          <p style={styles.subtitle}>Última gravação</p>
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
          <button
            style={{ ...styles.button, marginTop: 10 }}
            onClick={saveTranscript}
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
    </div>
  );
}

// Estilos de exemplo
const styles = {
  card: { padding: 20,
      margin: 20,
      marginLeft: 200,
      marginRight: 200,
      borderRadius: 10,
      backgroundColor: '#f9f9f9', 
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  button: { backgroundColor: '#007bff', color: 'white', padding: '15px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '10px 0', width: '100%' },
  stopButton: { backgroundColor: '#dc3545', color: 'white', padding: '15px 20px', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer', margin: '10px 0', width: '100%' },
  textInput: {
    width: 'calc(100% - 22px)', // Ajuste para padding e borda
    border: '1px solid #ccc',
    padding: 10,
    marginTop: 10,
    minHeight: 100,
    textAlign: 'left',
    fontFamily: 'sans-serif',
    fontSize: 16,
  }
};
