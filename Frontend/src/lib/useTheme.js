import { create } from "zustand";

// Deliberately just two modes — light and dark — not a theme picker.
// Persisted to localStorage, applied via a `data-theme` attribute that
// index.css keys its color tokens off of.
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("musify-theme");
  if (saved === "light" || saved === "dark") return saved;
  // Respect OS preference on first visit if nothing's saved yet.
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

const initial = getInitialTheme();
if (typeof document !== "undefined") applyTheme(initial);

export const useThemeStore = create((set, get) => ({
  theme: initial,
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("musify-theme", next);
    applyTheme(next);
    set({ theme: next });
  },
}));
