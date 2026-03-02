/**
 * ThemeButton
 *
 * This component renders a button that allows users to toggle
 * between light and dark themes.
 */

import { useEffect, useState } from "react";
import { Brightness4 } from "@mui/icons-material";

const modeButtonStyle = `text-text-primary`;

// Same constant as in useTheme hook
const THEME_CHANGE_EVENT = "theme-changed";

export default function ThemeButton({ inHeader = false }: { inHeader?: boolean }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved theme from localStorage on page load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    // Listen for theme changes from other components
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newTheme = customEvent.detail as string;
      setIsDark(newTheme === "dark");
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const handleThemeToggle = () => {
    const newDarkState = !isDark;
    setIsDark(newDarkState);

    const newTheme = newDarkState ? "dark" : "light";
    if (newDarkState) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Dispatch custom event to sync with other components
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: newTheme })
    );
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const iconColor = inHeader ? "text-white" : modeButtonStyle;

  return (
    <button
      onClick={handleThemeToggle}
      className="cursor-pointer p-2 rounded-full hover:bg-card-hover transition-colors"
      title="Cambiar tema"
    >
      <Brightness4 className={iconColor} />
    </button>
  );
}
