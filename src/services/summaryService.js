/**
 * Serviço responsável por gerar resumos de texto utilizando a API do DeepSeek / OpenAI.
 */

const SUMMARY_PROMPTS = {
  concise: "Faça um resumo curto e conciso do seguinte texto em português. Retorne APENAS o resumo, sem introduções ou explicações adicionais.",
  bullets: "Sintetize os pontos principais do seguinte texto em tópicos claros (bullet points) em português. Retorne APENAS os tópicos, sem explicações adicionais.",
  detailed: "Faça um resumo detalhado, organizado em parágrafos bem estruturados, do seguinte texto em português. Retorne APENAS o resumo.",
};

export async function summarizeText(text, style = "concise") {
  if (!text || !text.trim()) {
    throw new Error("Nenhum texto foi fornecido para gerar o resumo.");
  }

  const apiKey = localStorage.getItem("deepseekApiKey") || "";

  if (!apiKey) {
    throw new Error("Chave da API do DeepSeek não configurada. Por favor, adicione sua chave de API nas Configurações do sistema.");
  }

  const systemInstruction = SUMMARY_PROMPTS[style] || SUMMARY_PROMPTS.concise;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Erro no servidor de IA (${response.status}). Verifique sua chave de API.`);
  }

  const data = await response.json();
  const summaryContent = data.choices?.[0]?.message?.content?.trim();

  if (!summaryContent) {
    throw new Error("A API retornou uma resposta vazia.");
  }

  return summaryContent;
}
