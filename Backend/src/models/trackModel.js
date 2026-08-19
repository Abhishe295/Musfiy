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
    }
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
