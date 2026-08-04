import React, { useState, useEffect, useRef } from "react";
import { handleSave as saveTranscript } from "./fileSaver";
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from "../constants";
import SaveModal from "../components/SaveModal";
import * as shared from "../styles/sharedStyles";

export default function TranscriptScreen({ route }) {
  const [recognizedText, setRecognizedText] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);

  const staticTranscription = route.params?.transcription;

  useEffect(() => {
    if (staticTranscription) {
      setRecognizedText(staticTranscription);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Este navegador não suporta a Web Speech API.");
      return;
    }

    const recognition = new SpeechRecognition();
    const appLang = localStorage.getItem("appLanguage") || DEFAULT_LANGUAGE;
    recognition.lang = LANGUAGE_MAP[appLang] || "pt-BR";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setRecognizedText((prev) => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Erro de reconhecimento de voz:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [staticTranscription, isListening]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [recognizedText]);

  const startListening = async () => {
    if (!recognitionRef.current) return;
    try {
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        {staticTranscription ? "📄 Transcrição do Áudio" : "🎙️ Transcrição em Tempo Real"}
      </h2>

      <textarea
        ref={textAreaRef}
        style={styles.textBox}
        value={recognizedText}
        readOnly={!staticTranscription}
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

      <SaveModal
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        text={recognizedText}
      />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "70vh",
    width: "100%",
    maxWidth: 600,
    margin: "10px auto",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  textBox: {
    flex: 1,
    border: "1px solid #ccc",
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    fontSize: 18,
    fontFamily: "sans-serif",
    boxSizing: "border-box",
    width: "100%",
  },
  startButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
  },
  stopButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
  },
};
