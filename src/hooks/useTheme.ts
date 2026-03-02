/**
 * Hook to use and toggle the theme of the system
 */

import { useState, useEffect } from "react";

// Custom event to synchronize theme changes
const THEME_CHANGE_EVENT = "theme-changed";

/**
 * Hook to manage the theme of the application.
 * @returns An object containing the current theme and a function to toggle it.
 */
export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Load initial theme from local storage
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = storedTheme || "light";
    setTheme(initialTheme);

    // Apply the initial theme class to the document
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    // Listen for theme changes from other components
    // Ref: https://developer.mozilla.org/es/docs/Web/API/CustomEvent
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newTheme = customEvent.detail as "light" | "dark";
      setTheme(newTheme);
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    // Add event listener for theme changes
    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Create a custom event to notify other components of the theme change
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: newTheme })
    );
  };

  return { theme, toggleTheme };
}
