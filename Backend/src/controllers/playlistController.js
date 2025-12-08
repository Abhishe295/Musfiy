// src/controllers/playlistController.js

import Track from "../models/trackModel.js";
import userModel from "../models/userModel.js";
import { normalizeMood } from "../utils/moodUtils.js";
import Groq from "groq-sdk";
import { pickGroqModel } from "../utils/groqModelPicker.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cached model for performance
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

export const generatePlaylist = async (req, res) => {
  try {
    const { moodPrompt } = req.body;
    const userId = req.userId;

    if (!moodPrompt) {
      return res
        .status(400)
        .json({ success: false, message: "Mood prompt required" });
    }

    // Normalize mood → ["romantic", "sad"]
    const moods = normalizeMood(moodPrompt);

    // Filter by mood tags
    const tracks = await Track.find({ emotionTag: { $in: moods } });

    const trackPool =
      tracks.length >= 6 ? tracks : await Track.find(); // fallback

    const trackListText = trackPool
      .map((t) => `${t.title} by ${t.artist} [${t.emotionTag}]`)
      .join("\n");

    const prompt = `
Generate a playlist based on moods: ${moods.join(", ")}.
Pick 3–6 songs from the list.

Return ONLY JSON:

{
  "tracks": ["Song1", "Song2", "Song3"]
}

Song List:
${trackListText}
`;

    const modelId = await getGroqModel();

    const completion = await groq.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: "Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0].message.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid AI JSON" });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    let playlistTitles = [...new Set(parsed.tracks.map((t) => t.trim()))].slice(
      0,
      6
    );

    if (playlistTitles.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Not enough valid songs",
      });
    }

    const selectedTracks = await Track.find({
      title: { $in: playlistTitles },
    });

    // Save to user history
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

    // Update usage counters
    // for (let t of selectedTracks) {
    //   t.timesUsed++;
    //   await t.save();
    // }

    res.status(200).json({ success: true, playlist: selectedTracks });
  } catch (err) {
    console.error("Playlist Error:", err);
    res.status(500).json({ success: false, message: "Internal Error" });
  }
};
