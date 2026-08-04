import React, { useState, useEffect, useRef } from "react";
import { handleSave as saveTranscript } from "./fileSaver";
import { LANGUAGE_MAP, DEFAULT_LANGUAGE } from "../constants";
import SaveModal from "../components/SaveModal";
import TranslationPanel from "../components/TranslationPanel";
import SummaryPanel from "../components/SummaryPanel";
import * as shared from "../styles/sharedStyles";

export default function TranscriptScreen({ route }) {
  const [recognizedText, setRecognizedText] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textAreaRef = useRef(null);
  const accumulatedTextRef = useRef("");
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef(null);

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
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedTextRef.current += (accumulatedTextRef.current ? " " : "") + piece.trim();
        } else {
          interimTranscript += piece;
        }
      }
      const combined = (accumulatedTextRef.current + (interimTranscript ? " " + interimTranscript : "")).trim();
      setRecognizedText(combined);
    };

    recognition.onerror = (event) => {
      console.warn("Aviso de reconhecimento de voz:", event.error);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn("Reinício ignorado em TranscriptScreen:", e);
            }
          }
        }, 200);
      }
    };

    return () => {
      clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [staticTranscription]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [recognizedText]);

  const startListening = async () => {
    if (!recognitionRef.current) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      accumulatedTextRef.current = "";
      setRecognizedText("");
      setIsListening(true);
      isListeningRef.current = true;
      recognitionRef.current.start();
    } catch (e) {
      console.error("Erro ao iniciar:", e);
      window.alert("Permissão para microfone negada ou erro ao iniciar.");
    }
  };

  const stopListening = async () => {
    isListeningRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
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

      {recognizedText && !isListening && (
        <>
          <TranslationPanel sourceText={recognizedText} />
          <SummaryPanel sourceText={recognizedText} />
        </>
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
