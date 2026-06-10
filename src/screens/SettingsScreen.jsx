import React, { useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native"; // Removido
// import styles from "../styles"; // Usaremos estilos inline ou CSS

export default function SettingsScreen() {
  const [idioma, setIdioma] = useState("Português");
  const [qualidade, setQualidade] = useState("Alto");

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Configurações</h2>
      <p style={styles.text}>Idioma: {idioma}</p>
      <p style={styles.text}>Qualidade: {qualidade}</p>

      <button
        style={styles.button}
        onClick={() => setIdioma(idioma === "Português" ? "Inglês" : "Português")}
      >
        🌍 Trocar Idioma
      </button>

      <button
        style={styles.button}
        onClick={() => setQualidade(qualidade === "Alto" ? "Médio" : "Alto")}
      >
        ⚙️ Qualidade
      </button>
    </div>
  );
}

// Estilos de exemplo
const styles = {
  card: { padding: 20,
    margin: 20,
    marginLeft: 250,
    marginRight: 250,
    borderRadius: 10,
    backgroundColor: '#f9f9f9', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px 20px',
    border: 'none',
    borderRadius: 5,
    fontSize: 16,
    cursor: 'pointer',
    margin: '10px 0',
    width: '100%',
  },
};
