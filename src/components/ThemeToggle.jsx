import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * Pill-shaped light/dark switch. `compact` renders a smaller icon-only
 * button for tight spaces (e.g. mobile menu row).
 */
const ThemeToggle = ({ compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        aria-pressed={isDark}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[var(--jb-primary)] hover:text-[var(--jb-primary)] transition-all duration-300 hover:rotate-12"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="theme-switch relative flex items-center w-16 h-9 rounded-full px-1 transition-colors duration-500 shrink-0"
      style={{
        background: isDark
          ? "linear-gradient(90deg, var(--jb-accent-dark), var(--jb-primary))"
          : "linear-gradient(90deg, #E5E7EB, #D1D5DB)",
      }}
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      >
        {isDark ? (
          <Moon size={14} className="text-[var(--jb-primary)]" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;
