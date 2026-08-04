import React, { useState, useRef } from "react";
import { handleSave as saveTranscript } from "./fileSaver";
import { transcribeAudio } from "../audioUtils";
import { LANGUAGE_MAP, SUPPORTED_MIME_TYPES, DEFAULT_LANGUAGE } from "../constants";
import SaveModal from "../components/SaveModal";
import TranslationPanel from "../components/TranslationPanel";
import SummaryPanel from "../components/SummaryPanel";
import * as shared from "../styles/sharedStyles";

function detectSupportedMimeType() {
  if (typeof MediaRecorder.isTypeSupported !== "function") {
    return { options: {}, mimeType: "audio/webm" };
  }
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      const baseMime = type.split(";")[0];
      return { options: { mimeType: type }, mimeType: baseMime };
    }
  }
  return { options: {}, mimeType: "audio/webm" };
}

export default function RecordScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [isTranscribingWithAi, setIsTranscribingWithAi] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const audioChunksRef = useRef([]);
  const selectedMimeTypeRef = useRef("audio/webm");
  const isRecordingRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const restartTimeoutRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechRecognitionSupported = !!SpeechRecognition;

  const handleTranscribeAudioWithAi = async (audioUrlParam) => {
    const targetUri = audioUrlParam || lastRecordingUri;
    if (!targetUri) return;

    setIsTranscribingWithAi(true);
    setAiProgress(0);

    try {
      const text = await transcribeAudio(targetUri, {
        onProgress: (p) => setAiProgress(p),
        onChunk: (chunkText) => setTranscript(chunkText),
      });
      setTranscript(text);
    } catch (err) {
      console.error("Erro na transcrição por IA:", err);
      window.alert("Não foi possível transcrever o áudio com IA: " + (err.message || "Erro de decodificação."));
    } finally {
      setIsTranscribingWithAi(false);
    }
  };

  async function startRecording() {
    setLiveTranscript("");
    setTranscript("");
    setLastRecordingUri(null);
    accumulatedTranscriptRef.current = "";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      window.alert("O acesso ao microfone não está disponível neste navegador ou exige conexão segura (HTTPS).");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { options, mimeType } = detectSupportedMimeType();
      selectedMimeTypeRef.current = mimeType;

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeTypeRef.current });
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastRecordingUri(audioUrl);

        stream.getTracks().forEach((track) => track.stop());

        const currentLive = accumulatedTranscriptRef.current.trim();
        if (!currentLive) {
          handleTranscribeAudioWithAi(audioUrl);
        }
      };

      if (isSpeechRecognitionSupported) {
        startLiveTranscription();
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      window.alert("Não foi possível iniciar a gravação. Verifique a permissão do microfone.");
    }
  }

  function startLiveTranscription() {
    if (!isSpeechRecognitionSupported) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const appLang = localStorage.getItem("appLanguage") || DEFAULT_LANGUAGE;
      recognition.lang = LANGUAGE_MAP[appLang] || "pt-BR";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? " " : "") + piece.trim();
          } else {
            interimTranscript += piece;
          }
        }
        const combined = (accumulatedTranscriptRef.current + (interimTranscript ? " " + interimTranscript : "")).trim();
        setLiveTranscript(combined);
      };

      recognition.onerror = (event) => {
        console.warn("Aviso de reconhecimento de voz:", event.error);
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecordingRef.current && speechRecognitionRef.current) {
              try {
                speechRecognitionRef.current.start();
              } catch (e) {
                console.warn("Reinício de voz ignorado:", e);
              }
            }
          }, 200);
        }
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Erro no reconhecimento de voz:", e);
    }
  }

  function stopLiveTranscription() {
    clearTimeout(restartTimeoutRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
  }

  React.useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      clearTimeout(restartTimeoutRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  async function stopRecording() {
    isRecordingRef.current = false;
    stopLiveTranscription();
    if (mediaRecorderRef.current && isRecording) {
      const finalLiveText = accumulatedTranscriptRef.current.trim() || liveTranscript.trim();
      if (finalLiveText) {
        setTranscript(finalLiveText);
      }
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  const handleSave = (format) => {
    const textToSave = transcript || liveTranscript;
    saveTranscript(textToSave, format);
    setShowSaveOptions(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div style={shared.card}>
      <p style={styles.title}>
        {isRecording ? "Gravando..." : "Pressione o botão para gravar"}
      </p>

      <button
        style={isRecording ? shared.stopButton : shared.button}
        onClick={toggleRecording}
      >
        {isRecording ? "⏹️ Parar" : "🎙️ Iniciar"}
      </button>

      {!isSpeechRecognitionSupported && (
        <p style={styles.warningText}>
          Nota: Transcrição ao vivo indisponível neste navegador. O áudio será processado por IA assim que você parar a gravação.
        </p>
      )}

      {isRecording && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, fontWeight: "bold" }}>Transcrição ao vivo</p>
          <textarea
            style={shared.textInput}
            rows={6}
            value={liveTranscript}
            readOnly
          />
        </div>
      )}

      {lastRecordingUri && !isRecording && (
        <div style={{ marginTop: 20 }}>
          <p style={styles.subtitle}>Última gravação</p>
          <audio src={lastRecordingUri} controls style={{ width: "100%", marginBottom: 10 }} />

          <button
            style={isTranscribingWithAi ? shared.disabledButton : shared.aiButton}
            onClick={() => handleTranscribeAudioWithAi()}
            disabled={isTranscribingWithAi}
          >
            {isTranscribingWithAi
              ? `⏳ Processando com IA (${Math.round(aiProgress)}%)...`
              : "⚡ Re-transcrever Gravação com IA (Whisper)"}
          </button>
        </div>
      )}

      {(transcript || isTranscribingWithAi) && !isRecording && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, fontWeight: "bold" }}>Resultado da Transcrição:</p>
          <textarea
            style={shared.textInput}
            rows={6}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isTranscribingWithAi ? "Lendo áudio e gerando texto com IA..." : "Sua transcrição aparecerá aqui..."}
          />
          <button
            style={{ ...shared.button, marginTop: 10 }}
            onClick={() => setShowSaveOptions(true)}
          >
            💾 Salvar
          </button>
          <button
            style={{ ...shared.button, marginTop: 10 }}
            onClick={() => navigator.clipboard.writeText(transcript)}
          >
            📋 Copiar
          </button>
          <button
            style={{ ...shared.button, marginTop: 10, backgroundColor: "#dc3545" }}
            onClick={() => {
              setTranscript("");
              setLiveTranscript("");
            }}
          >
            🗑️ Limpar
          </button>

          <TranslationPanel sourceText={transcript} />
          <SummaryPanel sourceText={transcript} />
        </div>
      )}

      <SaveModal
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        text={transcript || liveTranscript}
      />
    </div>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  warningText: {
    color: "#856404",
    backgroundColor: "#fff3cd",
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    fontSize: 14,
  },
};
