// src/utils/moodUtils.js

export function normalizeMood(input) {
  if (!input || typeof input !== "string") return ["general"];

  const text = input.toLowerCase();

  const moodMap = {
    romantic: ["romantic", "love", "date", "soft", "affection", "intimate"],
    happy: ["happy", "joy", "cheerful", "bright", "uplifting", "smile"],
    sad: ["sad", "cry", "melancholy", "lonely", "pain", "down"],
    energetic: ["gym", "workout", "hype", "party", "dance", "angry", "rage"],
    chill: ["calm", "relax", "focus", "study", "lofi", "chill", "peaceful"],
    night: ["night", "drive", "dark", "midnight"],
    heartbreak: ["breakup", "heartbreak", "lost", "hurt"],
  };

  const detected = [];

  for (const mood in moodMap) {
    for (const keyword of moodMap[mood]) {
      if (text.includes(keyword)) {
        detected.push(mood);
        break;
      }
    }
  }

  // Deduplicate + fallback
  const unique = [...new Set(detected)];
  return unique.length ? unique : ["general"];
}
