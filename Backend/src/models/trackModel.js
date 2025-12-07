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

const Track = mongoose.models.Track || mongoose.model("Track", trackSchema);

export default Track;
