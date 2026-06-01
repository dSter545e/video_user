import { THEME_STORAGE_KEY } from "../lib/theme";

/** Runs before paint so the first frame matches device or saved theme. */
export default function ThemeInit() {
  const script = `
(function () {
  try {
    var key = ${JSON.stringify(THEME_STORAGE_KEY)};
    var stored = localStorage.getItem(key);
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    document.body.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
