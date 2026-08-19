import Track from "../models/trackModel.js";
import userModel from "../models/userModel.js";
import { normalizeMood } from "../utils/moodUtils.js";
import Groq from "groq-sdk";
import { pickGroqModel } from "../utils/groqModelPicker.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------------- MODEL CACHE ----------------
let cachedModel = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 1000;

async function getGroqModel() {
  if (cachedModel && Date.now() - cachedAt < CACHE_TTL) {
    return cachedModel;
  }

  cachedModel = await pickGroqModel(process.env.GROQ_API_KEY);
  cachedAt = Date.now();
  console.log("⚡ Using Groq model:", cachedModel);
  return cachedModel;
}

// ---------------- CONTROLLER ----------------
export const generatePlaylist = async (req, res) => {
  try {
    const { moodPrompt } = req.body;
    const userId = req.userId;

    if (!moodPrompt) {
      return res
        .status(400)
        .json({ success: false, message: "Mood prompt required" });
    }

    // 1️⃣ Normalize mood
    const moods = normalizeMood(moodPrompt);

    // 2️⃣ Fetch tracks by mood (capped candidate pool — we only need enough
    // songs to build a reasonable prompt for the model, not the whole library)
    let tracks = await Track.find({ emotionTag: { $in: moods } })
      .limit(60)
      .lean();

    // Ensure minimum pool size
    if (tracks.length < 10) {
      tracks = await Track.find().limit(25).lean();
    }

    if (!tracks.length) {
      return res
        .status(400)
        .json({ success: false, message: "No tracks available" });
    }

    // 3️⃣ Build song list for AI
    const trackListText = tracks
      .map((t) => `${t.title} by ${t.artist}`)
      .join("\n");

    // 4️⃣ STRICT PROMPT (NO EXPLANATIONS ALLOWED)
    const prompt = `
You are given a list of songs.

STRICT RULES (MUST FOLLOW):
- Choose ONLY from the Song List below
- Return ONLY song TITLES
- Each array element MUST be a single song title string
- NO explanations
- NO extra text
- NO comments
- NO reasoning
- If unsure, still pick from the list

Return ONLY valid JSON in EXACT format:

{
  "tracks": ["Song Title 1", "Song Title 2", "Song Title 3"]
}

Song List:
${trackListText}
`;

    const modelId = await getGroqModel();

    // 5️⃣ Call AI (retry once if invalid)
    let parsed = null;
    let raw = "";

    for (let attempt = 1; attempt <= 2; attempt++) {
      const completion = await groq.chat.completions.create({
        model: modelId,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You output ONLY valid JSON. No explanations. No extra text.",
          },
          { role: "user", content: prompt },
        ],
      });

      raw = completion.choices[0].message.content?.trim();
      console.log("🧠 AI RAW OUTPUT:\n", raw);

      try {
        parsed = JSON.parse(raw);
        if (Array.isArray(parsed.tracks)) break;
      } catch {
        if (attempt === 2) throw new Error("Invalid AI JSON");
      }
    }

    // 6️⃣ SANITIZE AI OUTPUT
    const cleanTitles = parsed.tracks
      .filter((t) => typeof t === "string")
      .map((t) => t.trim())
      .filter(
        (t) =>
          t.length > 0 &&
          !t.toLowerCase().includes("not found") &&
          !t.toLowerCase().includes("selecting")
      );

    const playlistTitles = [...new Set(cleanTitles)].slice(0, 6);

    // 7️⃣ If AI still fails → fallback (NO EMPTY PLAYLISTS)
    if (playlistTitles.length < 3) {
      console.warn("⚠️ AI failed, using fallback playlist");

      const shuffled = [...tracks].sort(() => 0.5 - Math.random());
      const fallbackTracks = shuffled.slice(0, 5);

      return res.status(200).json({
        success: true,
        playlist: fallbackTracks,
        fallback: true,
      });
    }

    // 8️⃣ Fetch actual tracks from DB
    const selectedTracks = await Track.find({
      title: { $in: playlistTitles },
    }).lean();

    if (selectedTracks.length < 3) {
      console.warn("⚠️ Title mismatch, using fallback playlist");

      const shuffled = [...tracks].sort(() => 0.5 - Math.random());
      const fallbackTracks = shuffled.slice(0, 5);

      return res.status(200).json({
        success: true,
        playlist: fallbackTracks,
        fallback: true,
      });
    }

    // 9️⃣ Save to user history
    await userModel.findByIdAndUpdate(userId, {
      $push: {
        generatedMixes: {
          mood: moodPrompt,
          tracks: selectedTracks.map((t) => ({
            track: t._id,
            weight: 1,
          })),
        },
      },
    });

    // 🔟 Respond
    return res.status(200).json({
      success: true,
      playlist: selectedTracks,
    });
  } catch (err) {
    console.error("Playlist Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Error" });
  }
};
