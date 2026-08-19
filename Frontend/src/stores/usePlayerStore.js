import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  queue: [],
  // Tracks where the current queue came from, so we know whether it's safe
  // to silently extend it as more library batches load in the background.
  // 'library' = built from the paginated All Tracks list (safe to extend)
  // 'playlist' = an AI-generated mix (fixed, never auto-extended)
  queueSource: null,
  currentIndex: 0,
  isPlaying: false,
  currentTrack: null,

  setQueue: (tracks, source = null) =>
    set({
      queue: tracks,
      queueSource: source,
      currentIndex: 0,
      currentTrack: tracks[0] || null,
    }),

  // Called whenever the library store loads another batch. Only actually
  // touches the queue if it was built from the library (not an AI playlist),
  // and never resets currentIndex/currentTrack or duplicates tracks.
  appendToQueue: (newTracks) =>
    set((state) => {
      if (state.queueSource !== "library" || !newTracks?.length) return state;

      const existingIds = new Set(state.queue.map((t) => t._id));
      const additions = newTracks.filter((t) => !existingIds.has(t._id));

      if (!additions.length) return state;

      return { queue: [...state.queue, ...additions] };
    }),

  // 🔥 IMPORTANT FIX: locate index correctly
  playTrack: (track) =>
    set((state) => {
      const index = state.queue.findIndex((t) => t._id === track._id);

      return {
        currentTrack: track,
        currentIndex: index === -1 ? 0 : index,
        isPlaying: true,
      };
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  next: () =>
    set((state) => {
      if (!state.queue.length) return state;

      const newIndex = (state.currentIndex + 1) % state.queue.length;

      return {
        currentIndex: newIndex,
        currentTrack: state.queue[newIndex],
        isPlaying: true,
      };
    }),

  prev: () =>
    set((state) => {
      if (!state.queue.length) return state;

      const newIndex =
        (state.currentIndex - 1 + state.queue.length) % state.queue.length;

      return {
        currentIndex: newIndex,
        currentTrack: state.queue[newIndex],
        isPlaying: true,
      };
    }),

  shuffle: () =>
    set((state) => {
      if (!state.queue.length) return state;

      const newIndex = Math.floor(Math.random() * state.queue.length);
      return {
        currentIndex: newIndex,
        currentTrack: state.queue[newIndex],
        isPlaying: true,
      };
    }),
}));
