"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="ms-btn-secondary px-3 py-1.5 text-xs font-medium"
      aria-label="Toggle theme"
    >
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
