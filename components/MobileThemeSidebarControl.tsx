"use client";

import { FiSun } from "react-icons/fi";
import { ThemeMode } from "../lib/theme";
import { useTheme } from "./ThemeProvider";
import MobileSidebarOptionRow from "./MobileSidebarOptionRow";

const THEME_OPTIONS = [
  { value: "light" as ThemeMode, label: "Light" },
  { value: "dark" as ThemeMode, label: "Dark" },
];

export default function MobileThemeSidebarControl() {
  const { theme, setTheme } = useTheme();

  return (
    <MobileSidebarOptionRow
      icon={<FiSun />}
      label="Mode"
      value={theme}
      options={THEME_OPTIONS}
      onChange={setTheme}
      groupLabel="Color mode"
      wideSegment
    />
  );
}
