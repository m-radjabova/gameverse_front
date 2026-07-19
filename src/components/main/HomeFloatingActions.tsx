import { useEffect, useState } from "react";
import { FiArrowUp, FiHelpCircle } from "react-icons/fi";

const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

function HomeFloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setShowScrollTop(window.scrollY > 520);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
  };

  const scrollToHelp = () => {
    const contactSection = document.getElementById("contact");
    if (!contactSection) return;

    contactSection.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
  };

  return (
    <aside
      aria-label="Sahifa yordamchilari"
      className="fixed bottom-5 right-4 z-[90] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7"
    >
      <div
        className={`group flex items-center gap-3 transition-all duration-300 motion-reduce:transition-none ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <span className="pointer-events-none hidden rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-3.5 py-2 text-xs font-bold text-[var(--home-heading)] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
          Tepaga qaytish
        </span>
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Sahifa boshiga qaytish"
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/40 bg-[var(--home-accent)] text-white shadow-[0_14px_35px_var(--home-shadow-card)] transition duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--home-accent)]/30 active:translate-y-0 active:scale-95 sm:h-16 sm:w-16"
        >
          <span className="absolute inset-1 rounded-full border border-white/20" />
          <FiArrowUp aria-hidden="true" className="relative text-2xl sm:text-[28px]" />
        </button>
      </div>

      <div className="group flex items-center gap-3">
        <span className="pointer-events-none hidden rounded-full border border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] px-3.5 py-2 text-xs font-bold text-[var(--home-heading)] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
          Yordam va aloqa
        </span>
        <button
          type="button"
          onClick={scrollToHelp}
          aria-label="Yordam va aloqa bo‘limiga o'tish"
          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/50 bg-[var(--home-accent-strong)] text-[#26345f] shadow-[0_14px_38px_var(--home-shadow-card)] transition duration-200 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--home-accent-strong)]/30 active:translate-y-0 active:scale-95 sm:h-16 sm:w-16"
        >
          <span className="absolute inset-1 rounded-full border border-white/30" />
          <FiHelpCircle
            aria-hidden="true"
            className="relative text-2xl sm:text-[28px]"
          />
        </button>
      </div>
    </aside>
  );
}

export default HomeFloatingActions;
