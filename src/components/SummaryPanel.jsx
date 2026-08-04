import React, { useState } from "react";
import { summarizeText } from "../services/summaryService";
import SummaryWarningModal from "./SummaryWarningModal";
import SaveModal from "./SaveModal";
import * as shared from "../styles/sharedStyles";

export default function SummaryPanel({ sourceText }) {
  const [summaryStyle, setSummaryStyle] = useState("concise");
  const [summaryText, setSummaryText] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  if (!sourceText) return null;

  const handleConfirmSummarize = async () => {
    if (!sourceText.trim()) return;

    setIsSummarizing(true);
    setError("");
    setSummaryText("");

    try {
      const result = await summarizeText(sourceText, summaryStyle);
      setSummaryText(result);
    } catch (err) {
      console.error("Erro ao gerar resumo:", err);
      setError(err.message || "Erro desconhecido ao gerar resumo.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div style={styles.panel}>
      <p style={styles.panelTitle}>📝 Resumo de Texto (IA)</p>

      <div style={styles.controlsRow}>
        <select
          style={styles.select}
          value={summaryStyle}
          onChange={(e) => {
            setSummaryStyle(e.target.value);
            setSummaryText("");
            setError("");
          }}
        >
          <option value="concise">Curto (Conciso)</option>
          <option value="bullets">Tópicos Chave (Bullet Points)</option>
          <option value="detailed">Detalhado (Parágrafos)</option>
        </select>

        <button
          style={isSummarizing ? shared.disabledButton : styles.summaryButton}
          onClick={() => setShowWarningModal(true)}
          disabled={isSummarizing}
        >
          {isSummarizing ? "Gerando Resumo..." : "Gerar Resumo"}
        </button>
      </div>

      <p style={styles.engineHint}>☁️ Requer API externa (Processamento em nuvem)</p>

      {error && <p style={styles.errorText}>{error}</p>}

      {summaryText && (
        <div style={{ marginTop: 15 }}>
          <p style={styles.resultLabel}>Resumo Gerado:</p>
          <textarea
            style={shared.textInput}
            rows={6}
            value={summaryText}
            readOnly
          />
          <div style={styles.actionRow}>
            <button
              style={{ ...shared.button, marginTop: 10 }}
              onClick={() => navigator.clipboard.writeText(summaryText)}
            >
              📋 Copiar Resumo
            </button>
            <button
              style={{ ...shared.button, marginTop: 10 }}
              onClick={() => setShowSaveOptions(true)}
            >
              💾 Salvar Resumo
            </button>
          </div>
        </div>
      )}

      <SummaryWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        onConfirm={handleConfirmSummarize}
      />

      <SaveModal
        isOpen={showSaveOptions}
        onClose={() => setShowSaveOptions(false)}
        text={summaryText}
      />
    </div>
  );
}

const styles = {
  panel: {
    marginTop: 20,
    padding: 15,
    border: "1px solid #c3e6cb",
    borderRadius: 10,
    backgroundColor: "#f4fdf5",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#2b542c",
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
  summaryButton: {
    flex: 1,
    backgroundColor: "#198754",
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
    color: "#657666",
    marginTop: 6,
    marginBottom: 0,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "left",
    color: "#2b542c",
  },
  actionRow: {
    display: "flex",
    gap: 10,
  },
};
