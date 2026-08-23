import mongoose from "mongoose";

// A running tally of "after track A played, track B played next" events.
// This is deliberately just a counted edge list rather than a full
// first-order Markov matrix in memory — Mongo already gives us fast
// lookups on (from, count desc), and the table only grows with distinct
// transitions actually observed, not with every possible track pair.
const playTransitionSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Supports "given this track, what's the most likely next track" lookups.
playTransitionSchema.index({ from: 1, count: -1 });
// Enforces one row per (from, to) pair so repeats increment count instead
// of creating duplicate rows.
playTransitionSchema.index({ from: 1, to: 1 }, { unique: true });

const PlayTransition =
  mongoose.models.PlayTransition ||
  mongoose.model("PlayTransition", playTransitionSchema);

export default PlayTransition;
