import React, { useState } from "react";
import usersData from "../users.json";

export default function LoginScreen({ navigateTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Busca no JSON um usuário que tenha exatamente o mesmo e-mail e senha
    const validUser = usersData.find((user) => user.email === email && user.password === password);

    if (validUser) {
      navigateTo("Home");
    } else {
      setError("E-mail ou senha incorretos.");
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
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Ainda não tem uma conta?{" "}
            <span style={styles.link} onClick={() => alert("Redirecionando para tela de cadastro...")}>
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
  footer: { marginTop: 25 },
  footerText: { fontSize: 14, color: "#666" },
  link: { color: "#007bff", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" },
};