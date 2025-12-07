import Groq from "groq-sdk";
import { pickGroqModel } from "../utils/groqModelPicker.js";
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function normalizeMoodAI(input) {
  const modelId = await pickGroqModel(process.env.GROQ_API_KEY);

  const prompt = `
You classify user mood descriptions into structured music moods.

Valid moods:
romantic, happy, sad, energetic, chill, night, heartbreak

Rules:
- Return ONLY moods from the list.
- Return 1–3 moods max.
- Do NOT return extra text.
- Output format ONLY: ["mood1", "mood2"]

User mood description:
"${input}"
`;

  const completion = await groq.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: "Return ONLY valid JSON array." },
      { role: "user", content: prompt }
    ],
  });

  const raw = completion.choices[0].message?.content || "";
  const jsonMatch = raw.match(/\[[\s\S]*\]/);

  if (!jsonMatch) return ["happy"];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return ["happy"];
  }
}
