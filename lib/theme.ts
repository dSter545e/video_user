export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "user_theme";
export const THEME_CHANGED_EVENT = "user-theme-changed";

export const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

/** Saved preference wins; otherwise follow the device light/dark setting. */
export const resolveTheme = (): ThemeMode => getStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  document.body.setAttribute("data-theme", theme);
};

export const readThemeFromDocument = (): ThemeMode => {
  const onHtml = document.documentElement.getAttribute("data-theme");
  if (onHtml === "light" || onHtml === "dark") return onHtml;
  return getSystemTheme();
};

export const persistTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};
