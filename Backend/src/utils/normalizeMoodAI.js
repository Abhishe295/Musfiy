import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function normalizeMoodAI(input) {
  const prompt = `
You classify user mood descriptions into structured music moods.

Valid moods:
romantic, happy, sad, energetic, chill, night, heartbreak

Rules:
- You MUST understand combined words like "happyenergetic", "nighthappy".
  Split them intelligently into valid moods.
- Return ONLY moods from the list.
- Return 1–3 moods max.
- Do NOT return extra text.
- Output format ONLY: ["mood1", "mood2"]

User mood description:
"${input}"
`;


  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "Return ONLY valid JSON array." },
      { role: "user", content: prompt }
    ],
  });

  const raw = completion.choices[0].message.content || "";

  // Extract JSON array
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return ["happy"]; // fallback safe mood
  }

  try {
    const list = JSON.parse(jsonMatch[0]);
    return Array.isArray(list) && list.length ? list : ["happy"];
  } catch {
    return ["happy"];
  }
}
