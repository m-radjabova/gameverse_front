import { useEffect, useState } from "react";

export default function useHomeTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("home-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener("home-theme-change", syncTheme as EventListener);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("home-theme-change", syncTheme as EventListener);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  return isDarkMode;
}
