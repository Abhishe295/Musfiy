export function normalizeMood(input) {
  const text = input.toLowerCase();

  const moodMap = {
    romantic: ["romantic", "love", "date", "soft", "affection", "intimate"],
    happy: ["happy", "joy", "cheerful", "bright", "uplifting", "smile"],
    sad: ["sad", "cry", "melancholy", "lonely", "pain", "down"],
    energetic: ["gym", "workout", "hype", "party", "dance", "angry", "rage"],
    chill: ["calm", "relax", "focus", "study", "lofi", "chill", "peaceful"],
    night: ["night", "drive", "dark", "midnight", "lonely night"],
    heartbreak: ["breakup", "heartbreak", "lost", "hurt"]
  };

  let result = [];

  for (const mood in moodMap) {
    if (moodMap[mood].some((keyword) => text.includes(keyword))) {
      result.push(mood);
    }
  }

  return result.length ? result : ["general"];
}