import { create } from "zustand";

export const usePlayerStore = create((set) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTrack: null,

  setQueue: (tracks) =>
    set({
      queue: tracks,
      currentIndex: 0,
      currentTrack: tracks[0] || null,
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
