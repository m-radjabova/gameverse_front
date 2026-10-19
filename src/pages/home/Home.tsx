import { useEffect, useState } from "react";
import AOS from "aos";
import Hero from "../../components/main/Hero";
import TrialSection from "../../components/main/TrialSection";
import AppsServiceSection from "../../components/main/AppsServiceSection";
import HowItWorksSection from "../../components/main/HowItWorksSection";
import Footer from "../../components/footer/Footer";
import CommentsSection from "../../components/main/CommentsSection";
import HomeFloatingActions from "../../components/main/HomeFloatingActions";

function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeNav, setActiveNav] = useState<
    "O'yinlar" | "Haqida" | "Izohlar" | "Bog'lanish" | undefined
  >(undefined);

  const sectionByNav: Record<string, string> = {
    "O'yinlar": "games",
    Haqida: "about",
    Izohlar: "comments",
    "Bog'lanish": "contact",
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("home-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
    });

  }, []);

  useEffect(() => {
    const syncAos = window.setTimeout(() => {
      AOS.refreshHard();
    }, 220);

    return () => {
      window.clearTimeout(syncAos);
    };
  }, [isDarkMode]);

  useEffect(() => {
    window.localStorage.setItem("home-theme", isDarkMode ? "dark" : "light");
    window.dispatchEvent(new Event("home-theme-change"));
  }, [isDarkMode]);

  const handleNavClick = (section: string) => {
    const targetId = sectionByNav[section];
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (!element) return;

    setActiveNav(section as "O'yinlar" | "Haqida" | "Izohlar" | "Bog'lanish");

    const headerOffset = 96;
    const y = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="min-h-screen bg-[var(--home-page-bg)] text-[var(--home-page-text)] transition-colors duration-500"
    >
      <div>
        <div id="home">
          <Hero
            activeNav={activeNav}
            isDark={isDarkMode}
            onNavClick={handleNavClick}
            onThemeToggle={() => setIsDarkMode((prev) => !prev)}
          />
        </div>
        <div id="about">
          <TrialSection isDark={isDarkMode} />
        </div>
      </div>
      <div id="games">
        <AppsServiceSection isDark={isDarkMode} />
      </div>
      <HowItWorksSection isDark={isDarkMode} />
      <div id="comments">
        <CommentsSection isDark={isDarkMode} />
      </div>
      <div id="contact">
        <Footer isDark={isDarkMode} />
      </div>
      <HomeFloatingActions />
    </div>
  );
}

export default Home;
