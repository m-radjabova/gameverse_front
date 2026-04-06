import { useEffect, useState } from "react";
import AOS from "aos";
import Hero from "../../components/main/Hero";
import TrialSection from "../../components/main/TrialSection";
import AppsServiceSection from "../../components/main/AppsServiceSection";
import HowItWorksSection from "../../components/main/HowItWorksSection";
import Footer from "../../components/footer/Footer";
import SiteLoader from "../../components/main/SiteLoader";
import CommentsSection from "../../components/main/CommentsSection";

function Home() {
  const [isLoading, setIsLoading] = useState(true);
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

    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      AOS.refresh();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const syncAos = window.setTimeout(() => {
      AOS.refreshHard();
    }, 220);

    return () => {
      window.clearTimeout(syncAos);
    };
  }, [isDarkMode, isLoading]);

  useEffect(() => {
    window.localStorage.setItem("home-theme", isDarkMode ? "dark" : "light");
    window.dispatchEvent(new Event("home-theme-change"));
  }, [isDarkMode]);

  if (isLoading) {
    return <SiteLoader />;
  }

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
    </div>
  );
}

export default Home;
