// One-time migration: tracks uploaded before waveform/feature extraction
// existed have no waveformPeaks or audioFeatures. This walks the existing
// library, re-downloads each track's audio from Cloudinary, and runs it
// through the same analysis pipeline used at upload time.
//
// Run with: npm run backfill:audio

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Track from "../models/trackModel.js";
import { analyzeAudioBuffer } from "../utils/audioAnalysis.js";

dotenv.config();

async function run() {
  await connectDB();

  const tracks = await Track.find({
    $or: [
      { waveformPeaks: { $size: 0 } },
      { "audioFeatures.energy": null },
    ],
  });

  console.log(`Found ${tracks.length} track(s) missing audio analysis.`);

  let succeeded = 0;
  let failed = 0;

  for (const track of tracks) {
    try {
      const response = await fetch(track.fileUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { peaks, features } = await analyzeAudioBuffer(buffer);

      track.waveformPeaks = peaks;
      track.audioFeatures = features;
      await track.save();

      succeeded++;
      console.log(`  analyzed: ${track.title}`);
    } catch (err) {
      failed++;
      console.log(`  skipped ${track.title}: ${err.message}`);
    }
  }

  console.log(`Backfill complete. ${succeeded} succeeded, ${failed} failed.`);
  await mongoose.disconnect();
  process.exit(0);
}

run();
