import { FaArrowLeft, FaHome, FaGraduationCap } from "react-icons/fa";
import { Outlet, useNavigate } from "react-router-dom";
import useHomeTheme from "../hooks/useHomeTheme";

export default function TeacherLayout() {
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();

  return (
    <div data-home-theme={isDarkMode ? "dark" : "light"} className="teacher-theme min-h-screen bg-[var(--panel-page-base)]">
      <header className={`sticky top-0 z-40 border-b backdrop-blur-2xl ${isDarkMode ? "border-white/10 bg-[#0f1b2c]/84" : "border-white/70 bg-white/72"}`}>
        <div className="mx-auto flex min-h-18 max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate("/");
            }}
            className={`group inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${isDarkMode ? "border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/[0.12]" : "border-[var(--panel-border)] bg-white/70 text-[var(--panel-text)] hover:bg-white"}`}
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Orqaga</span>
          </button>

          <button type="button" onClick={() => navigate("/teacher-panel")} className="min-w-0 text-left">
            <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--panel-muted)]">
              <FaGraduationCap className="text-[var(--panel-accent)]" /> Teacher workspace
            </span>
            <span className="mt-1 block truncate text-sm font-black text-[var(--panel-text)] sm:text-base">Savollar markazi</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold sm:inline-flex ${isDarkMode ? "border-emerald-300/15 bg-emerald-400/10 text-emerald-200" : "border-emerald-500/20 bg-emerald-50 text-emerald-700"}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Tayyor
            </span>
            <button
              type="button"
              onClick={() => navigate("/")}
              className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${isDarkMode ? "border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/[0.12]" : "border-[var(--panel-border)] bg-white/70 text-[var(--panel-text)] hover:bg-white"}`}
              title="Bosh sahifa"
            >
              <FaHome />
              <span className="hidden lg:inline">Bosh sahifa</span>
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>
    </div>
  );
}
