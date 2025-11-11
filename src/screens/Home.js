import React, { useState } from "react";
// Componentes web equivalentes
// import { useNavigation } from "@react-navigation/native"; // Removido
// import * as DocumentPicker from "expo-document-picker"; // Removido
import { uploadAndTranscribeAudio } from "../api"; // Caminho atualizado
// import styles from "../styles"; // Usaremos estilos inline ou CSS

// O componente agora recebe props para controlar a navegação
export default function HomeScreen({ navigateTo }) {
  // const navigation = useNavigation(); // Removido
  const [isLoading, setIsLoading] = useState(false);

  // Função para lidar com o envio de áudio usando a API da Web
  const handleSendAudio = async () => {
    if (isLoading) return;

    // Cria um input de arquivo dinamicamente para abrir o seletor de arquivos
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = async (event) => {
      const file = event.target.files[0];

      if (file) {
        console.log("PASSO 1: Arquivo de áudio selecionado:", file.name);
        setIsLoading(true);
        try {
          // O fluxo agora é assíncrono. O ideal seria navegar para uma página
          // que mostra o status da transcrição. Por simplicidade, vamos apenas
          // mostrar um alerta e o ID no console.
          const transcriptId = await uploadAndTranscribeAudio(file, file.name);
          setIsLoading(false);
          window.alert(`Arquivo enviado! A transcrição (ID: ${transcriptId}) está sendo processada em segundo plano.`);
          console.log(`Iniciada transcrição com ID: ${transcriptId}. Verifique o histórico para o resultado.`);
          // Aqui você poderia navegar para uma tela de histórico que se atualiza.
        } catch (error) {
          setIsLoading(false);
          console.error("Erro ao enviar arquivo:", error);
          window.alert(`Erro ao enviar arquivo: ${error.message}`);
        }
      } else {
        console.log("Seleção de arquivo cancelada ou falhou.");
      }
    };
    input.click();
  };

  return (
    // Substituindo View por div e aplicando estilos
    <div style={styles.card}>
      <img src="src/screens/logo.jpg" alt="Logo" style={{ width: 100, height: 100 }} />

      <button style={styles.button} onClick={() => navigateTo("Gravação")}>
        🎙️ Gravar Áudio
      </button>

      <button style={styles.button} onClick={handleSendAudio} disabled={isLoading}>
        {isLoading ? (
          <div className="spinner" /> // Um spinner CSS simples
        ) : (
          "📤 Enviar Áudio"
        )}
      </button>
   </div>
  );
}

// Exemplo de estilos que podem ser usados.
// Idealmente, isso viria de um arquivo CSS ou de uma biblioteca CSS-in-JS.
const styles = {
  card: {
    padding: 20,
    margin: 20,
    marginLeft: 250,
    marginRight: 250,
    borderRadius: 40,
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
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
  subtitle: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  textMuted: {
    color: '#6c757d',
  },
};
