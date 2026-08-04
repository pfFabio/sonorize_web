import { pipeline } from "@xenova/transformers";
import { OPUS_MT_MODELS, DEEPSEEK_LANG_NAMES } from "../constants";

const pipelineCache = {};

async function getTranslationPipeline(modelName, onProgress) {
  if (pipelineCache[modelName]) return pipelineCache[modelName];

  const translator = await pipeline("translation", modelName, {
    progress_callback: (data) => {
      if (data.status === "progress" && onProgress) {
        onProgress(data.progress);
      }
    },
  });

  pipelineCache[modelName] = translator;
  return translator;
}

async function translateDirect(text, modelName, onProgress) {
  const translator = await getTranslationPipeline(modelName, onProgress);
  const result = await translator(text, { max_length: 512 });
  return result[0].translation_text;
}

/**
 * Traduz texto localmente usando modelos OPUS-MT via Transformers.js.
 * Para pares sem modelo direto, faz pivot via inglês.
 */
export async function translateLocal(text, sourceLang, targetLang, onProgress) {
  if (sourceLang === targetLang) return text;

  const directKey = `${sourceLang}-${targetLang}`;
  const directModel = OPUS_MT_MODELS[directKey];

  if (directModel) {
    return translateDirect(text, directModel, onProgress);
  }

  const toEnKey = `${sourceLang}-en`;
  const fromEnKey = `en-${targetLang}`;
  const toEnModel = OPUS_MT_MODELS[toEnKey];
  const fromEnModel = OPUS_MT_MODELS[fromEnKey];

  if (toEnModel && fromEnModel) {
    const englishText = await translateDirect(text, toEnModel, onProgress);
    return translateDirect(englishText, fromEnModel, onProgress);
  }

  throw new Error(`Par de idiomas não suportado para tradução local: ${directKey}`);
}

/**
 * Traduz texto usando a API do DeepSeek (compatível com OpenAI).
 */
export async function translateWithApi(text, targetLang, apiKey) {
  const langName = DEEPSEEK_LANG_NAMES[targetLang] || targetLang;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${langName}. Output ONLY the translated text, nothing else.`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "Erro na API de tradução.");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Traduz usando o motor configurado pelo usuário (local ou API).
 */
export async function translate(text, sourceLang, targetLang, onProgress) {
  const engine = localStorage.getItem("translationEngine") || "local";
  const apiKey = localStorage.getItem("deepseekApiKey") || "";

  if (engine === "deepseek" && apiKey) {
    return translateWithApi(text, targetLang, apiKey);
  }

  return translateLocal(text, sourceLang, targetLang, onProgress);
}
