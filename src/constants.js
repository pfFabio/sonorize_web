export const LANGUAGE_MAP = {
  portuguese: "pt-BR",
  english: "en-US",
  spanish: "es-ES",
  french: "fr-FR",
  german: "de-DE",
  japanese: "ja-JP",
  chinese: "zh-CN",
  russian: "ru-RU",
};

export const DEFAULT_LANGUAGE = "portuguese";

export const SUPPORTED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
];

export const SAVE_FORMATS = ["txt", "pdf", "csv"];

export const TRANSLATION_LANG_CODES = {
  portuguese: "pt",
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  japanese: "ja",
  chinese: "zh",
  russian: "ru",
};

export const TRANSLATION_TARGETS = [
  { code: "pt", label: "Português" },
  { code: "en", label: "Inglês" },
  { code: "es", label: "Espanhol" },
  { code: "fr", label: "Francês" },
  { code: "de", label: "Alemão" },
  { code: "ja", label: "Japonês" },
  { code: "zh", label: "Chinês" },
  { code: "ru", label: "Russo" },
];

export const OPUS_MT_MODELS = {
  "en-pt": "Xenova/opus-mt-en-pt",
  "pt-en": "Xenova/opus-mt-pt-en",
  "en-es": "Xenova/opus-mt-en-es",
  "es-en": "Xenova/opus-mt-es-en",
  "en-fr": "Xenova/opus-mt-en-fr",
  "fr-en": "Xenova/opus-mt-fr-en",
  "en-de": "Xenova/opus-mt-en-de",
  "de-en": "Xenova/opus-mt-de-en",
  "en-ru": "Xenova/opus-mt-en-ru",
  "ru-en": "Xenova/opus-mt-ru-en",
  "en-zh": "Xenova/opus-mt-en-zh",
  "zh-en": "Xenova/opus-mt-zh-en",
  "en-ja": "Xenova/opus-mt-en-jap",
  "ja-en": "Xenova/opus-mt-ja-en",
};

export const DEEPSEEK_LANG_NAMES = {
  pt: "Brazilian Portuguese",
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
  zh: "Chinese",
  ru: "Russian",
};
