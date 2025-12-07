// src/utils/groqModelPicker.js
const GROQ_MODELS_ENDPOINT = "https://api.groq.com/openai/v1/models";

export async function pickGroqModel(apiKey) {
  if (!apiKey) throw new Error("GROQ_API_KEY missing");

  const res = await fetch(GROQ_MODELS_ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Groq model list failed: ${res.status}`);
  }

  const json = await res.json();
  const models = json.data || [];

  const preferred = [
    /llama-3/i,
    /llama3/i,
    /llama-/i,
    /gemma/i,
    /mixtral/i,
  ];

  for (const p of preferred) {
    const match = models.find((m) => p.test(m.id));
    if (match) return match.id;
  }

  return models[0]?.id || null;
}
