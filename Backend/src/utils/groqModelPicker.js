// src/utils/groqModelPicker.js
const GROQ_MODELS_ENDPOINT = "https://api.groq.com/openai/v1/models";

// Groq's /models endpoint returns everything they host — including audio
// transcription (whisper), text-to-speech, and content-moderation/guard
// models. The old naive `/llama-/i` match could accidentally pick
// "meta-llama/llama-prompt-guard-2-22m", a classification model that
// rejects normal multi-message chat completions outright — which is
// exactly the "single user message" error you were hitting. Excluding
// those explicitly, then preferring known-good large instruct/chat
// models, fixes it at the source instead of hardcoding one model name.
const EXCLUDE_PATTERNS = [
  /guard/i,
  /whisper/i,
  /tts/i,
  /speech/i,
  /moderation/i,
  /embed/i,
];

const PREFERRED_PATTERNS = [
  /llama-3\.3-70b/i,
  /llama-3\.1-70b/i,
  /llama-3\.1-8b/i,
  /llama-3/i,
  /mixtral/i,
  /gemma2?/i,
];

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
  const candidates = (json.data || []).filter(
    (m) => !EXCLUDE_PATTERNS.some((p) => p.test(m.id))
  );

  for (const pattern of PREFERRED_PATTERNS) {
    const match = candidates.find((m) => pattern.test(m.id));
    if (match) return match.id;
  }

  return candidates[0]?.id || null;
}
