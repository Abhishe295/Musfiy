import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlayerStore } from "../stores/usePlayerStore";
import api from '../lib/api.js';
import Waveform from "./Waveform";
import AudioVisualizer from "./AudioVisualizer";

const AudioPlayer = () => {
  const audioRef = useRef(null);

  // UI States
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [tracked, setTracked] = useState(false);

  // Zustand Player Store
  const { currentTrack, isPlaying, next, prev, shuffle } = usePlayerStore();

  // 🔥 Load a new track when it changes — reload only happens here, never
  // on a play/pause toggle, so pausing never resets playback position.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    const playWhenReady = () => {
      if (usePlayerStore.getState().isPlaying) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("loadeddata", playWhenReady);
    return () => audio.removeEventListener("loadeddata", playWhenReady);
  }, [currentTrack]);

  // 🔥 Play/pause the EXISTING audio element in place (no reload) whenever
  // the play state toggles — this is what makes pause/resume remember
  // exactly where you left off instead of jumping back to 0:00.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 🔥 Time + metadata listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isSeeking) setCurrentTime(audio.currentTime);
    };
    const updateMeta = () => {
      setDuration(audio.duration || 1);
      audio.volume = volume;
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadeddata", updateMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadeddata", updateMeta);
    };
  }, [currentTrack, isSeeking, volume]);

  // 🔥 Smooth playhead: the browser's own `timeupdate` event only fires a
  // handful of times per second, which is what made the waveform progress
  // look like it was "stepping" instead of flowing. Driving currentTime
  // with requestAnimationFrame instead gives it a continuous ~60fps feed,
  // which is what actually makes the sweep look smooth.
  useEffect(() => {
    let raf;
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused && !isSeeking) {
        setCurrentTime(audio.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isSeeking]);

  // 🔥 Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;

      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        usePlayerStore.setState((s) => ({ isPlaying: !s.isPlaying }));
      }
      if (e.code === "ArrowRight") next();
      if (e.code === "ArrowLeft") prev();
      if (e.code === "KeyM") toggleMute();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Format time
  const fmt = (t) =>
    isNaN(t) ? "0:00" : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  // Volume toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Progress bar seeking
  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const commitSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
    setIsSeeking(false);
  };

  // Waveform click-to-seek (percent-based, since Waveform already resolves
  // the click position for us).
  const seekToPercent = (percent) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = percent * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  useEffect(() => {
    setTracked(false); // reset when new track loads
  }, [currentTrack]);

  // --- Predictive prefetching engine ---
  // Whenever the current track changes: (1) log the transition from the
  // previous track so the Markov-style predictor learns from it, then
  // (2) ask what's statistically most likely to play next and warm the
  // browser's HTTP cache for it in the background, so that if the
  // prediction is right, playback starts with near-zero latency.
  const prevTrackIdRef = useRef(null);
  const prefetchedUrlsRef = useRef(new Set());

  useEffect(() => {
    const prevId = prevTrackIdRef.current;
    const currId = currentTrack?._id;

    if (prevId && currId && prevId !== currId) {
      api.post("/api/transition", { from: prevId, to: currId }).catch(() => {});
    }
    prevTrackIdRef.current = currId;

    if (!currId) return;

    const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback || clearTimeout;

    const idleHandle = requestIdle(async () => {
      let nextUrl = null;

      try {
        const res = await api.get(`/api/transition/predict/${currId}`);
        const predictedId = res.data?.predictedTrackId;
        if (predictedId) {
          const { queue } = usePlayerStore.getState();
          const predictedTrack = queue.find((t) => t._id === predictedId);
          if (predictedTrack) nextUrl = predictedTrack.fileUrl;
        }
      } catch (err) {
        // Predictions are a nice-to-have; never let a failure touch playback.
      }

      if (!nextUrl) {
        const { queue, currentIndex } = usePlayerStore.getState();
        const fallback = queue[currentIndex + 1];
        if (fallback) nextUrl = fallback.fileUrl;
      }

      if (nextUrl && !prefetchedUrlsRef.current.has(nextUrl)) {
        prefetchedUrlsRef.current.add(nextUrl);
        fetch(nextUrl, { mode: "no-cors" }).catch(() => {});
      }
    });

    return () => cancelIdle(idleHandle);
  }, [currentTrack]);

  // --- Real-time audio visualizer (Web Audio AnalyserNode) ---
  // Built once, on the same <audio> element, and reused across every
  // track change (a MediaElementAudioSourceNode can only ever be created
  // once per element). Wrapped defensively: if the browser or the CDN
  // response doesn't cooperate with cross-origin analysis, this silently
  // disables itself — it must NEVER be able to break actual playback.
  const [analyser, setAnalyser] = useState(null);
  const [corsBlocked, setCorsBlocked] = useState(false);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audio);
      const node = ctx.createAnalyser();
      node.fftSize = 64;
      source.connect(node);
      node.connect(ctx.destination);

      audioCtxRef.current = ctx;
      setAnalyser(node);
    } catch (err) {
      console.log("Audio visualizer unavailable (non-fatal):", err.message);
    }

    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // Resume the AudioContext on the first real play (browsers suspend it
  // until a user gesture).
  useEffect(() => {
    if (isPlaying && audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
  }, [isPlaying]);

  // If corsBlocked just flipped on (see onError below), the crossOrigin
  // attribute was already removed by the re-render, but the element won't
  // re-fetch on its own — force a reload so the same track actually plays
  // in the fallback (non-analyzable) mode instead of staying stuck on error.
  const isFirstCorsCheck = useRef(true);
  useEffect(() => {
    if (isFirstCorsCheck.current) {
      isFirstCorsCheck.current = false;
      return;
    }
    const audio = audioRef.current;
    if (!audio || !corsBlocked) return;

    const wasPlaying = usePlayerStore.getState().isPlaying;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [corsBlocked]);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-base-100/90 backdrop-blur-2xl border-t border-base-content/[0.06] z-50">

      {/* ▬▬▬▬▬ PROGRESS BAR / WAVEFORM ▬▬▬▬▬ */}
      {currentTrack.waveformPeaks?.length > 0 ? (
        <div className="w-full">
          <Waveform
            peaks={currentTrack.waveformPeaks}
            currentTime={currentTime}
            duration={duration}
            onSeek={seekToPercent}
          />
        </div>
      ) : (
        <div
          className="w-full h-1 bg-base-300 cursor-pointer relative group"
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={commitSeek}
          onClick={commitSeek}
          onMouseMove={(e) => isSeeking && handleSeek(e)}
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary relative"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      )}

      {/* ▬▬▬▬▬ MAIN PLAYER UI ▬▬▬▬▬ */}
      <div className="px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">

        {/* 🎵 Track Info + real-time visualizer - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3 w-1/3 overflow-hidden">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
            🎵
          </div>
          <div className="truncate flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base truncate">{currentTrack.title}</h3>
            <p className="text-xs text-base-content/50 truncate">{currentTrack.artist}</p>
          </div>
          <AudioVisualizer analyser={analyser} isPlaying={isPlaying} />
        </div>

        {/* 🎛 Controls */}
        <div className="flex flex-col items-center gap-1 w-full sm:w-1/3">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">

            <button
              onClick={shuffle}
              className="btn btn-xs sm:btn-sm btn-ghost btn-circle hover:text-primary hidden sm:flex"
            >
              <Shuffle size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              onClick={prev}
              className="btn btn-sm btn-ghost btn-circle hover:text-primary"
            >
              <SkipBack size={18} className="sm:w-[20px] sm:h-[20px]" />
            </button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="btn btn-circle bg-gradient-to-br from-primary to-secondary border-none w-12 h-12 sm:w-14 sm:h-14"
              onClick={() =>
                usePlayerStore.setState((s) => ({ isPlaying: !s.isPlaying }))
              }
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isPlaying ? "pause" : "play"}
                  initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause size={24} fill="currentColor" className="sm:w-[28px] sm:h-[28px]" />
                  ) : (
                    <Play size={24} fill="currentColor" className="sm:w-[28px] sm:h-[28px]" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <button
              onClick={next}
              className="btn btn-sm btn-ghost btn-circle hover:text-primary"
            >
              <SkipForward size={18} className="sm:w-[20px] sm:h-[20px]" />
            </button>

            <button
              className={`btn btn-xs sm:btn-sm btn-ghost btn-circle hidden sm:flex ${
                loop ? "text-primary bg-primary/15" : "hover:text-primary"
              }`}
              onClick={() => setLoop(!loop)}
            >
              <Repeat size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-base-content/50 mt-0.5 tabular-nums">
            {fmt(currentTime)} / {fmt(duration)}
          </div>
        </div>

        {/* 🔊 Volume - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3 w-1/3 justify-end">
          <button
            onClick={toggleMute}
            className="btn btn-xs sm:btn-sm btn-ghost btn-circle hover:text-primary"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" />
            ) : (
              <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              audioRef.current.volume = v;
              setIsMuted(v === 0);
            }}
            className="range range-primary range-xs w-20 lg:w-28"
          />
        </div>
      </div>

      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        loop={loop}
        preload="metadata"
        crossOrigin={corsBlocked ? undefined : "anonymous"}
        src={currentTrack.fileUrl || ""}
        onEnded={next}
        onError={() => {
          // If enabling crossOrigin (needed for the visualizer to read real
          // frequency data) ever causes the media itself to fail loading,
          // permanently fall back to no-CORS mode so playback always wins
          // over the bonus visualizer.
          if (!corsBlocked) {
            console.log(
              "Audio failed to load with CORS enabled — disabling the " +
              "visualizer and retrying in normal playback mode."
            );
            setCorsBlocked(true);
          }
        }}
        onPlay={async () => {
          if (!tracked && currentTrack?._id) {
            setTracked(true);
            try {
              await api.post(`/api/track/play/${currentTrack._id}`);
            } catch (err) {
              console.log("Play tracking failed:", err);
            }
          }
        }}
      />
    </div>
  );
};

export default AudioPlayer;
