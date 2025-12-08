import Track from "../models/trackModel.js";

// In-memory cache
let cache = {
  topTracks: null,
  expiresAt: null,
};

const CACHE_TTL = 30 * 1000; // 30 seconds

export const getTopTracks = async (req, res) => {
  try {
    const now = Date.now();

    // 1️⃣ Serve from cache if available
    if (cache.topTracks && cache.expiresAt > now) {
      return res.status(200).json({
        success: true,
        cached: true,
        tracks: cache.topTracks,
      });
    }

    // 2️⃣ Fetch from DB
    const tracks = await Track.find()
      .sort({ timesUsed: -1 })
      .limit(10);

    if (tracks.length === 0) {
      return res.status(200).json({
        success: true,
        tracks: [],
      });
    }

    // Highest usage count for percentage calculation
    const maxUsed = tracks[0].timesUsed || 1;

    // 3️⃣ Add rank + percentage
    const rankedTracks = tracks.map((t, i) => ({
      rank: i + 1,
      title: t.title,
      artist: t.artist,
      fileUrl: t.fileUrl,
      timesUsed: t.timesUsed,
      usagePercent: Math.round((t.timesUsed / maxUsed) * 100), // 0–100%
      _id: t._id,
    }));

    // 4️⃣ Cache it
    cache.topTracks = rankedTracks;
    cache.expiresAt = now + CACHE_TTL;

    return res.status(200).json({
      success: true,
      cached: false,
      tracks: rankedTracks,
    });

  } catch (error) {
    console.log("Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


