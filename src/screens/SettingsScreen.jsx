import React, { useState, useEffect } from "react";

export default function SettingsScreen() {
  const [idioma, setIdioma] = useState("portuguese");
  const [qualidade, setQualidade] = useState("Alto");

  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage");
    if (savedLang) setIdioma(savedLang);

    const savedQualidade = localStorage.getItem("appQualidade");
    if (savedQualidade) setQualidade(savedQualidade);
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setIdioma(newLang);
    localStorage.setItem("appLanguage", newLang);
  };

  const toggleQualidade = () => {
    const novaQualidade = qualidade === "Alto" ? "Médio" : "Alto";
    setQualidade(novaQualidade);
    localStorage.setItem("appQualidade", novaQualidade);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Configurações</h2>

      <div style={{ marginBottom: 30, textAlign: "left" }}>
        <label htmlFor="language-select" style={{ fontWeight: "bold" }}>
          Idioma Padrão para Transcrição:
        </label>
        <p style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
          Escolha o idioma do áudio para que a Inteligência Artificial seja mais precisa.
        </p>
        <select
          id="language-select"
          value={idioma}
          onChange={handleLanguageChange}
          style={{ ...styles.select, width: "100%", marginTop: 10 }}
        >
          <option value="portuguese">Português</option>
          <option value="english">Inglês</option>
          <option value="spanish">Espanhol</option>
          <option value="french">Francês</option>
          <option value="german">Alemão</option>
          <option value="japanese">Japonês</option>
          <option value="chinese">Chinês</option>
          <option value="russian">Russo</option>
        </select>
      </div>

      <div style={{ marginBottom: 20, textAlign: "left" }}>
        <p style={{ fontWeight: "bold", marginBottom: 5 }}>
          Qualidade de Transcrição: {qualidade}
        </p>
        <p style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
          {qualidade === "Alto"
            ? "Usa o Whisper Small: Maior precisão de áudio, porém um pouco mais lento para processar."
            : "Usa o Whisper Tiny: Processamento muito rápido, porém com precisão reduzida em áudios complexos."}
        </p>
        <button style={styles.button} onClick={toggleQualidade}>
          ⚙️ Alternar Qualidade
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: 20,
    margin: 20,
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: 600,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "15px 20px",
    border: "none",
    borderRadius: 5,
    fontSize: 16,
    cursor: "pointer",
    margin: "10px 0",
    width: "100%",
  },
  select: {
    padding: "10px 15px",
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 16,
    cursor: "pointer",
  },
};
