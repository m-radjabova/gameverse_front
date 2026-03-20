import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("home-theme") === "dark";
  });

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(window.localStorage.getItem("home-theme") === "dark");
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("home-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDarkMode ? "bg-[#0f172a] text-[#f1f1f1]" : "bg-white text-[#1f2937]"
      }`}
    >
      {!isHomePage && (
        <Header
          isDark={isDarkMode}
          onThemeToggle={() => setIsDarkMode((prev) => !prev)}
        />
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isHomePage && (
        <footer className="mt-auto">
          <Footer isDark={isDarkMode} />
        </footer>
      )}
    </div>
  );
}
