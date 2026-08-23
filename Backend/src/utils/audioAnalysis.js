import ffmpeg from "fluent-ffmpeg";
import streamifier from "streamifier";
import FFT from "fft.js";

// Prefer the bundled static binary (ffmpeg-static) so this works out of
// the box on a fresh `npm i`. Its postinstall step downloads a ~80MB
// binary from GitHub though, which some corporate networks / antivirus /
// VPNs interrupt (ECONNRESET) — if that happens, fall back to whatever
// `ffmpeg` is already on the system PATH instead of crashing the app.
// (Install one with `winget install ffmpeg` on Windows, `brew install
// ffmpeg` on Mac, or `apt install ffmpeg` on Linux.)
try {
  const { default: ffmpegStaticPath } = await import("ffmpeg-static");
  if (ffmpegStaticPath) ffmpeg.setFfmpegPath(ffmpegStaticPath);
} catch (err) {
  console.log(
    "[audioAnalysis] ffmpeg-static not installed — falling back to a system " +
    "ffmpeg on PATH. Audio analysis (waveform + similarity) will be skipped " +
    "for uploads if none is found, but everything else keeps working."
  );
}

// Aggressively downsampled mono PCM is plenty for waveform shape, energy,
// brightness and tempo estimation — and keeps decode + FFT cost tiny even
// for a multi-minute track, so this can run synchronously during upload.
const SAMPLE_RATE = 8000;
const NUM_PEAKS = 200;

const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Decode any ffmpeg-supported audio buffer to mono PCM samples at a fixed,
 * low sample rate. This is the single decode step that both the waveform
 * extraction and the acoustic feature extraction below are built on top of
 * — we never pay to decode the same file twice.
 */
function decodeToPCM(buffer) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    const command = ffmpeg(streamifier.createReadStream(buffer))
      .format("s16le")
      .audioChannels(1)
      .audioFrequency(SAMPLE_RATE)
      .on("error", (err) => reject(err));

    const stream = command.pipe();
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => {
      const raw = Buffer.concat(chunks);
      const sampleCount = Math.floor(raw.length / 2);
      const samples = new Float32Array(sampleCount);
      for (let i = 0; i < sampleCount; i++) {
        samples[i] = raw.readInt16LE(i * 2) / 32768;
      }
      resolve(samples);
    });
    stream.on("error", (err) => reject(err));
  });
}

/** Min/max amplitude per time-bucket, for a scrub-able waveform UI. */
function extractPeaks(samples, numPeaks = NUM_PEAKS) {
  if (!samples.length) return [];
  const blockSize = Math.max(1, Math.floor(samples.length / numPeaks));
  const peaks = [];

  for (let i = 0; i < numPeaks; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, samples.length);
    let min = 0;
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = samples[j];
      if (v > max) max = v;
      if (v < min) min = v;
    }
    peaks.push([round3(min), round3(max)]);
  }

  return peaks;
}

function rmsEnergy(samples) {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

function zeroCrossingRate(samples) {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) crossings++;
  }
  return crossings / samples.length;
}

/**
 * Spectral centroid: the "center of mass" of the frequency spectrum — a
 * standard DSP proxy for perceived brightness. Computed per windowed frame
 * (Hann window to reduce spectral leakage) and averaged across the track.
 */
function spectralCentroid(samples, sampleRate = SAMPLE_RATE) {
  const frameSize = 1024; // must be a power of two for FFT
  const fft = new FFT(frameSize);
  const out = fft.createComplexArray();
  const data = fft.createComplexArray();

  let centroidSum = 0;
  let frameCount = 0;

  for (let start = 0; start + frameSize <= samples.length; start += frameSize) {
    for (let i = 0; i < frameSize; i++) {
      const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frameSize - 1));
      data[2 * i] = samples[start + i] * hann;
      data[2 * i + 1] = 0;
    }

    fft.transform(out, data);

    let weightedSum = 0;
    let magSum = 0;
    const bins = frameSize / 2;
    for (let k = 0; k < bins; k++) {
      const re = out[2 * k];
      const im = out[2 * k + 1];
      const mag = Math.sqrt(re * re + im * im);
      const freq = (k * sampleRate) / frameSize;
      weightedSum += freq * mag;
      magSum += mag;
    }

    if (magSum > 0) {
      centroidSum += weightedSum / magSum;
      frameCount++;
    }
  }

  return frameCount ? centroidSum / frameCount : 0;
}

/**
 * Tempo estimate via an onset-strength envelope + autocorrelation — a
 * simplified version of the "novelty function" technique real beat
 * trackers use: find where short-term energy rises sharply (an onset),
 * then find the periodicity of those rises.
 */
function estimateTempo(samples, sampleRate = SAMPLE_RATE) {
  const frameDuration = 0.02; // 20ms frames
  const hop = Math.round(sampleRate * frameDuration);
  const frameCount = Math.floor(samples.length / hop);
  if (frameCount < 4) return 0;

  const energy = new Float32Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    let sum = 0;
    const start = i * hop;
    for (let j = 0; j < hop && start + j < samples.length; j++) {
      sum += samples[start + j] * samples[start + j];
    }
    energy[i] = sum / hop;
  }

  // Half-wave rectified energy diff = "onset strength"
  const onset = new Float32Array(frameCount);
  for (let i = 1; i < frameCount; i++) {
    onset[i] = Math.max(0, energy[i] - energy[i - 1]);
  }

  // Autocorrelate the onset envelope over a plausible tempo range
  // (60–180 BPM) to find the dominant beat period.
  const framesPerSec = 1 / frameDuration;
  const minLag = Math.round(framesPerSec * (60 / 180));
  const maxLag = Math.round(framesPerSec * (60 / 60));

  let bestLag = 0;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag && lag < frameCount; lag++) {
    let score = 0;
    for (let i = lag; i < frameCount; i++) {
      score += onset[i] * onset[i - lag];
    }
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  if (!bestLag) return 0;
  return Math.round((framesPerSec * 60) / bestLag);
}

/**
 * Full analysis pipeline for an uploaded audio buffer: one ffmpeg decode,
 * shared by waveform extraction and acoustic feature extraction.
 * Never throws — audio analysis is a nice-to-have, not a blocker for
 * uploads, so callers get { peaks: [], features: null } on failure.
 */
export async function analyzeAudioBuffer(buffer) {
  try {
    const samples = await decodeToPCM(buffer);
    if (!samples.length) return { peaks: [], features: null };

    const peaks = extractPeaks(samples);
    const features = {
      energy: round3(rmsEnergy(samples)),
      brightness: round3(spectralCentroid(samples) / (SAMPLE_RATE / 2)),
      zcr: round3(zeroCrossingRate(samples)),
      tempo: estimateTempo(samples),
    };

    return { peaks, features };
  } catch (err) {
    console.log("Audio analysis failed (non-fatal):", err.message);
    return { peaks: [], features: null };
  }
}
