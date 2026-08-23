import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    artist: {
      type: String,
      default: "Unknown",
    },

    fileUrl: {
      type: String,
      required: true,
    },

    emotionTag: {
  type: String,
  enum: [
    "romantic",
    "happy",
    "sad",
    "energetic",
    "chill",
    "night",
    "heartbreak",
    null
  ],
  default: null
},


    timesUsed: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    duration: {
      type: Number, // in seconds
      default: 0,
    },

    // --- Feature 1: waveform scrubbing ---
    // Array of [min, max] amplitude pairs (one per time-bucket), extracted
    // once at upload time so the client never has to decode raw audio just
    // to draw a waveform.
    waveformPeaks: {
      type: [[Number]],
      default: [],
    },

    // --- Feature 2: acoustic-similarity recommendations ---
    // Real DSP-derived features (see utils/audioAnalysis.js), not an LLM
    // guess — used for cosine-similarity "sounds like this" matching.
    audioFeatures: {
      energy: { type: Number, default: null },
      brightness: { type: Number, default: null },
      zcr: { type: Number, default: null },
      tempo: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// Supports the paginated "all tracks" query (sort by newest first)
trackSchema.index({ createdAt: -1 });

// Supports emotion-based filtering (getEmotionTracks + AI playlist mood matching)
trackSchema.index({ emotionTag: 1 });

// Supports the top-tracks/leaderboard query (sort by usage descending)
trackSchema.index({ timesUsed: -1 });

const Track = mongoose.models.Track || mongoose.model("Track", trackSchema);

export default Track;
