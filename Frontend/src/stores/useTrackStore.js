import { create } from "zustand";
import api from "../lib/api";

export const useTrackStore = create((set) => ({
  allTracks: [],
  emotionTracks: [],
  loading: false,
  error: null,

  fetchAllTracks: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get("/api/track/all");

      if (res.data.success) {
        set({ allTracks: res.data.tracks });
      }

      set({ loading: false });
      return res.data;

    } catch (error) {
      set({
        loading: false,
        error: "Failed to load tracks",
      });
    }
  },

  fetchEmotionTracks: async (emotion) => {
    set({ loading: true, error: null });

    try {
      const res = await api.get(`/api/track/emotion/${emotion}`);

      if (res.data.success) {
        set({ emotionTracks: res.data.tracks });
      }

      set({ loading: false });
      return res.data;

    } catch (error) {
      set({
        loading: false,
        error: "Failed to load emotion-based tracks",
      });
    }
  },

  uploadTrack: async (formData) => {
    set({ loading: true, error: null });

    try {
      const res = await api.post("/api/track/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        set((state) => ({
          allTracks: [...state.allTracks, res.data.track],
        }));
      }

      set({ loading: false });
      return res.data;

    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || "Track upload failed",
      });
    }
  },
}));
