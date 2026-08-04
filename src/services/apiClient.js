const getApiUrl = () => import.meta.env.VITE_API_URL || "";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || "Erro inesperado no servidor.");
  }
  return response.json();
};

const handleNetworkError = (error) => {
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    throw new Error("Não foi possível conectar ao servidor backend. Verifique a conexão com o servidor.");
  }
  throw error;
};

export async function loginUser(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch(`${getApiUrl()}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    return handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function registerUser({ login, email, senha, lingua }) {
  try {
    const response = await fetch(`${getApiUrl()}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, email, senha, lingua }),
    });
    return handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}
