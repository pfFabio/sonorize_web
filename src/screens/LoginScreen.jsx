import React, { useState } from "react";
// import usersData from "../users.json"; // Removido, agora usaremos a API
import { supabase } from "../supabaseClient"; // Importa o cliente Supabase
 
export default function LoginScreen({ navigateTo }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
 
    try {
      const formData = new URLSearchParams();
      formData.append("username", login);
      formData.append("password", password);

      const response = await fetch("http://localhost:8001/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Login ou senha incorretos.");
      }

      const data = await response.json();
      
      console.log("Usuário logado:", data);
      
      // Salva as informações do usuário localmente
      localStorage.setItem('user', JSON.stringify({ login: login, token: data.access_token }));
      navigateTo("Home"); // Navega para a home em caso de sucesso

    } catch (err) {
      setError(err.message || "Erro desconhecido ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bem-vindo de volta!</h2>
        <p style={styles.subtitle}>Faça login para continuar na Sonorize</p>

        {error && <p style={styles.errorText}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Login</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Seu nome de usuário"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            style={isLoading ? styles.disabledButton : styles.button} 
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Ainda não tem uma conta?{" "}
            <span style={styles.link} onClick={() => navigateTo("Register")}>
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: "40px 30px",
    borderRadius: 15,
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "left" },
  label: { fontSize: 14, fontWeight: "bold", color: "#444", marginBottom: 8 },
  input: {
    padding: "12px 15px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
  },
  errorText: { color: "red", marginBottom: 15, fontSize: 14, fontWeight: "bold" },
  button: { backgroundColor: "#007bff", color: "white", padding: "15px", border: "none", borderRadius: 8, fontSize: 18, fontWeight: "bold", cursor: "pointer", marginTop: 10 },
  disabledButton: { backgroundColor: "#6c757d", color: "white", padding: "15px", border: "none", borderRadius: 8, fontSize: 18, fontWeight: "bold", cursor: "not-allowed", marginTop: 10 },
  footer: { marginTop: 25 },
  footerText: { fontSize: 14, color: "#666" },
  link: { color: "#007bff", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" },
};