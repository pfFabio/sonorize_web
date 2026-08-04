import React, { useState } from "react";
import { translate } from "../services/translationService";
import { TRANSLATION_TARGETS, TRANSLATION_LANG_CODES, DEFAULT_LANGUAGE } from "../constants";
import SaveModal from "./SaveModal";
import * as shared from "../styles/sharedStyles";

export default function TranslationPanel({ sourceText }) {
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  if (!sourceText) return null;

  const appLang = localStorage.getItem("appLanguage") || DEFAULT_LANGUAGE;
  const sourceLangCode = TRANSLATION_LANG_CODES[appLang] || "pt";
  const engine = localStorage.getItem("translationEngine") || "local";
  const isLocal = engine === "local" || !localStorage.getItem("deepseekApiKey");

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setError("");
    setTranslatedText("");
    setProgress(0);

    try {
      const result = await translate(sourceText, sourceLangCode, targetLang, (p) => {
        setProgress(p);
      });
      setTranslatedText(result);
    } catch (err) {
      console.error("Erro na tradução:", err);
      setError(err.message || "Erro desconhecido na tradução.");
    } finally {
      setIsTranslating(false);
    }
  };

  const availableTargets = TRANSLATION_TARGETS.filter((t) => t.code !== sourceLangCode);

  return (
    <div style={styles.panel}>
      <p style={styles.panelTitle}>🌐 Tradução</p>

      <div style={styles.controlsRow}>
        <select
          style={styles.select}
          value={targetLang}
          onChange={(e) => {
            setTargetLang(e.target.value);
            setTranslatedText("");
            setError("");
          }}
        >
          {availableTargets.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <button
          style={isTranslating ? shared.disabledButton : styles.translateButton}
          onClick={handleTranslate}
          disabled={isTranslating}
        >
          {isTranslating
            ? isLocal
              ? `Baixando modelo (${Math.round(progress)}%)...`
              : "Traduzindo..."
            : "Traduzir"}
        </button>
      </div>

      <p style={styles.engineHint}>
        {isLocal ? "⚡ Motor local (OPUS-MT)" : "☁️ DeepSeek API"}
      </p>

      {error && <p style={styles.errorText}>{error}</p>}

      {translatedText && (
        <div>
          <textarea
            style={shared.textInput}
            rows={6}
            value={translatedText}
            readOnly
          />
          <div style={styles.actionRow}>
            <button
              style={{ ...shared.button, marginTop: 10 }}
              onClick={() => navigator.clipboard.writeText(translatedText)}
            >
              📋 Copiar Tradução
            </button>
            <button
              style={{ ...shared.button, marginTop: 10 }}
              onClick={() => setShowSaveOptions(true)}
            >
              💾 Salvar Tradução
            </button>
          </div>
        </div>
      )}

      <SaveModal
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        text={translatedText}
      />
    </div>
  );
}

const styles = {
  panel: {
    marginTop: 20,
    padding: 15,
    border: "1px solid #dee2e6",
    borderRadius: 10,
    backgroundColor: "#f0f4ff",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  controlsRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  select: {
    flex: 1,
    padding: "10px 15px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    cursor: "pointer",
  },
  translateButton: {
    flex: 1,
    backgroundColor: "#6f42c1",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  engineHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
    marginBottom: 0,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  actionRow: {
    display: "flex",
    gap: 10,
  },
};
