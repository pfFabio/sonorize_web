import React, { useState } from "react";
import { transcribeAudio } from "../audioUtils";
import SaveModal from "../components/SaveModal";
import TranslationPanel from "../components/TranslationPanel";
import * as shared from "../styles/sharedStyles";
import logoImage from "./logo.jpg";

export default function HomeScreen({ navigateTo }) {
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
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
    setStatus("loading");
    setProgress(0);
    setTranscription("");

    try {
      const text = await transcribeAudio(audioFile, {
        onProgress: (p) => {
          setProgress(p);
          setStatus("loading");
        },
        onChunk: (chunkText) => {
          setStatus("transcribing");
          setTranscription(chunkText);
        },
      });
      setTranscription(text);
      setStatus("done");
    } catch (err) {
      console.error(err);
      window.alert("Erro na transcrição: " + (err.message || "Falha ao decodificar áudio."));
      setStatus(null);
    }
  };

  const isProcessing = status === "loading" || status === "transcribing";

  return (
    <div style={shared.card}>
      <img src={logoImage} alt="Logo" style={{ width: 100, height: 100 }} />

      <button style={shared.button} onClick={() => navigateTo("Gravação")}>
        🎙️ Gravar Áudio
      </button>

      <button style={shared.button} onClick={handleFileSelect}>
        📤 Enviar Arquivo de Áudio
      </button>

      {audioFile && (
        <div style={{ marginTop: 20 }}>
          <audio src={audioFile} controls style={{ width: "100%", marginBottom: 10 }} />

          <button
            style={isProcessing ? shared.disabledButton : shared.startButton}
            onClick={handleTranscribe}
            disabled={isProcessing}
          >
            {status === "loading"
              ? `Baixando Modelo (${Math.round(progress)}%)...`
              : status === "transcribing"
              ? "⏳ Transcrevendo... (Lendo Áudio)"
              : "⚡ Transcrever com IA (Whisper)"}
          </button>

          <p style={{ fontSize: 12, color: "#666" }}>
            Nota: O processamento é feito localmente no seu navegador usando Transformers.js.
          </p>

          <textarea
            style={shared.textInput}
            rows={10}
            value={transcription}
            readOnly
            placeholder={
              status === "transcribing"
                ? "Processando áudio..."
                : "A transcrição aparecerá aqui..."
            }
          />

          {transcription && (
            <button style={shared.button} onClick={() => setShowSaveOptions(true)}>
              💾 Salvar Transcrição
            </button>
          )}

          {transcription && <TranslationPanel sourceText={transcription} />}
        </div>
      )}

      <SaveModal
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        text={transcription}
      />
    </div>
  );
}
