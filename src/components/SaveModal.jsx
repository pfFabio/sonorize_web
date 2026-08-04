import React from "react";
import { handleSave } from "../screens/fileSaver";
import * as shared from "../styles/sharedStyles";

export default function SaveModal({ isOpen, onClose, text }) {
  if (!isOpen) return null;

  const onSave = (format) => {
    handleSave(text, format);
    onClose();
  };

  return (
    <div style={shared.modalOverlay}>
      <div style={shared.modalContent}>
        <p style={shared.modalTitle}>Escolha o formato para salvar</p>
        <button style={shared.modalButton} onClick={() => onSave("txt")}>
          Salvar como .txt
        </button>
        <button style={shared.modalButton} onClick={() => onSave("pdf")}>
          Salvar como .pdf
        </button>
        <button style={shared.modalButton} onClick={() => onSave("csv")}>
          Salvar como .csv
        </button>
        <button
          style={{ ...shared.modalButton, backgroundColor: "#6c757d", marginTop: 20 }}
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
