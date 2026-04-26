import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function RegisterScreen({ navigateTo }) {
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [lingua, setLingua] = useState("Português");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("usuarios")
        .insert([{ login: login, email: email, senha: password, lingua: lingua }]);

      if (error) {
        throw error;
      }

      setMessage("Usuário cadastrado com sucesso! Você pode voltar e fazer o login.");
      setIsSuccess(true);
      setLogin("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setLingua("Português");
    } catch (error) {
      setMessage(error.message || "Erro desconhecido ao realizar cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Criar Conta</h2>
        <p style={styles.subtitle}>Preencha os dados para se cadastrar</p>

        {message && (
          <p style={{ ...styles.messageText, color: isSuccess ? "green" : "red" }}>
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome de Usuário</label>
            <input
              type="text"
              style={styles.input}
              placeholder="Seu login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              style={styles.input}
              placeholder="Seu e-mail"
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
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Senha</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Idioma Preferido</label>
            <select
              style={styles.input}
              value={lingua}
              onChange={(e) => setLingua(e.target.value)}
            >
              <option value="Português">Português</option>
              <option value="Inglês">Inglês</option>
              <option value="Espanhol">Espanhol</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button type="button" style={styles.backButton} onClick={() => navigateTo("Login")}>
              Voltar
            </button>
            <button type="submit" style={isLoading ? styles.disabledButton : styles.button} disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" },
  card: { width: "100%", maxWidth: 400, padding: "40px 30px", borderRadius: 15, backgroundColor: "#ffffff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", textAlign: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  inputGroup: { display: "flex", flexDirection: "column", textAlign: "left" },
  label: { fontSize: 14, fontWeight: "bold", color: "#444", marginBottom: 8 },
  input: { padding: "12px 15px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16, outline: "none" },
  messageText: { marginBottom: 15, fontSize: 14, fontWeight: "bold" },
  buttonGroup: { display: "flex", gap: "10px", marginTop: "10px" },
  button: { flex: 1, backgroundColor: "#007bff", color: "white", padding: "15px", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "pointer" },
  backButton: { flex: 1, backgroundColor: "#6c757d", color: "white", padding: "15px", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "pointer" },
  disabledButton: { flex: 1, backgroundColor: "#a0a0a0", color: "white", padding: "15px", border: "none", borderRadius: 8, fontSize: 16, fontWeight: "bold", cursor: "not-allowed" },
};