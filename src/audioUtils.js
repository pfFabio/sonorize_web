import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

/**
 * Decodifica qualquer arquivo ou Blob de áudio para um Float32Array de 16000Hz mono.
 * Garante que todas as engines (Chrome Android, Safari iOS, etc)
 * entreguem os dados no formato exato esperado pelo Whisper.
 */
export async function decodeAudioTo16kHz(audioUrlOrBlob) {
  const response = await fetch(audioUrlOrBlob);
  const arrayBuffer = await response.arrayBuffer();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Seu navegador não suporta a Web Audio API.");
  }
  const audioCtx = new AudioContextClass();

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const targetSampleRate = 16000;

  const offlineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offlineCtx = new offlineCtxClass(
    1,
    Math.ceil(audioBuffer.duration * targetSampleRate),
    targetSampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const channelData = renderedBuffer.getChannelData(0);

  audioCtx.close();
  return channelData;
}

/**
 * Transcreve um arquivo/blob de áudio usando o Whisper via Transformers.js.
 */
export async function transcribeAudio(audioUrlOrBlob, options = {}) {
  const { onProgress, onChunk } = options;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const appQualidade = localStorage.getItem("appQualidade") || (isMobile ? "Médio" : "Alto");
  const modelToUse = appQualidade === "Alto" ? "Xenova/whisper-small" : "Xenova/whisper-tiny";
  const appLang = localStorage.getItem("appLanguage") || "portuguese";

  const audioData = await decodeAudioTo16kHz(audioUrlOrBlob);

  const transcriber = await pipeline("automatic-speech-recognition", modelToUse, {
    progress_callback: (data) => {
      if (data.status === "progress" && onProgress) {
        onProgress(data.progress);
      }
    },
  });

  let streamedText = "";
  const result = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    language: appLang,
    task: "transcribe",
    chunk_callback: (chunk) => {
      if (chunk && chunk.text) {
        streamedText += chunk.text + " ";
        if (onChunk) {
          onChunk(streamedText);
        }
      }
    },
  });

  return result.text || streamedText.trim();
}
