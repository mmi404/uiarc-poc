import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type Accent = "violet" | "blue" | "green" | "amber" | "coral" | "rose";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.dataset.theme as Theme) ?? "light";
}

function readAccent(): Accent {
  if (typeof document === "undefined") return "violet";
  return (document.documentElement.dataset.accent as Accent) ?? "violet";
}

/** Reads and writes the theme + accent on <html>, persisting to localStorage. The initial values are set by the inline script in index.html. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);
  const [accent, setAccentState] = useState<Accent>(readAccent);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("arc-theme", theme);
    } catch {
      /* ignore private-mode storage errors */
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    try {
      localStorage.setItem("arc-accent", accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, accent, setTheme: setThemeState, setAccent: setAccentState, toggleTheme };
}
