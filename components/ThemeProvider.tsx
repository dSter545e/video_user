"use client";

import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  persistTheme,
  readThemeFromDocument,
  THEME_CHANGED_EVENT,
  ThemeMode,
} from "../lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: ReactNode;
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useLayoutEffect(() => {
    setThemeState(readThemeFromDocument());
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredTheme()) return;
      const next = getSystemTheme();
      setThemeState(next);
      applyTheme(next);
    };

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  useEffect(() => {
    const onThemeChange = () => setThemeState(readThemeFromDocument());
    window.addEventListener(THEME_CHANGED_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_CHANGED_EVENT, onThemeChange);
  }, []);

  const setTheme = (next: ThemeMode) => {
    persistTheme(next);
    applyTheme(next);
    setThemeState(next);
    window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
