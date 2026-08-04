import React from "react";
import * as shared from "../styles/sharedStyles";

export default function SummaryWarningModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={shared.modalOverlay}>
      <div style={{ ...shared.modalContent, maxWidth: 450, padding: 30 }}>
        <p style={{ ...shared.modalTitle, color: "#d9534f", marginBottom: 15 }}>
          ⚠️ Aviso de Privacidade
        </p>

        <p style={{ fontSize: 15, color: "#444", lineHeight: 1.5, marginBottom: 20, textAlign: "left" }}>
          Para gerar o resumo, seu texto será enviado para processamento em uma <strong>API externa de Inteligência Artificial</strong> fora do nosso ambiente local.
        </p>

        <p style={{ fontSize: 13, color: "#666", marginBottom: 25, textAlign: "left", backgroundColor: "#fff3cd", padding: 10, borderRadius: 6, border: "1px solid #ffeeba" }}>
          🔒 Seus dados não são armazenados permanentemente, mas saem da execução local do seu navegador.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button
            style={{ ...shared.modalButton, backgroundColor: "#6c757d", margin: 0, flex: 1 }}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            style={{ ...shared.modalButton, backgroundColor: "#28a745", margin: 0, flex: 1, fontWeight: "bold" }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Concordar e Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
