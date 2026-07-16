import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaRegLightbulb,
  FaUserPlus,
  FaGamepad,
  FaUsers,
  FaStar,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import register from "../../assets/register.png";
import start from "../../assets/start_game.png";
import play from "../../assets/play_game.png";
import feedback from "../../assets/reviews.png";

type Step = {
  id: string;
  title: string;
  short: string;
  description: string;
  note: string;
  image: string;
  accent: string;
  surface: string;
  icon: React.ReactNode;
};

const stepIcons: Record<string, React.ReactNode> = {
  signup: <FaUserPlus />,
  choose: <FaGamepad />,
  play: <FaUsers />,
  feedback: <FaStar />,
};

const steps: Step[] = [
  {
    id: "signup",
    title: "Ro'yxatdan o'ting",
    short: "Boshlash",
    description:
      "Bir necha daqiqada akkaunt yarating va platformadagi barcha imkoniyatlarni ishga tushiring.",
    note: "Tez va sodda kirish jarayoni",
    image: register,
    accent: "from-[#ffd76e] via-[#ffc85f] to-[#ffb94d]",
    surface: "from-[#fffdf0] via-[#fff8df] to-[#fff1c6]",
  },
  {
    id: "choose",
    title: "O'yinni tanlang",
    short: "Tanlash",
    description:
      "Mavzu, sinf yoki dars maqsadiga mos o'yinni tanlab, darhol jarayonni boshlang.",
    note: "Har darsga mos format mavjud",
    image: start,
    accent: "from-[#8ad8f2] via-[#69c9eb] to-[#4aaee0]",
    surface: "from-[#f3fdff] via-[#e4f7fc] to-[#d6eef8]",
  },
  {
    id: "play",
    title: "Birga o'ynang",
    short: "Faollik",
    description:
      "O'quvchilarni jamoa yoki individual formatda darsga jalb qiling va jarayonni qiziqarli qiling.",
    note: "Interaktiv va jonli tajriba",
    image: play,
    accent: "from-[#7ed8f4] via-[#61c6ee] to-[#4aafe4]",
    surface: "from-[#f2fcff] via-[#e4f8ff] to-[#d4f0fb]",
  },
  {
    id: "feedback",
    title: "Fikr bildiring",
    short: "Yaxshilash",
    description:
      "Taklif va mulohazalaringiz orqali platformani yanada kuchli, qulay va foydali qilib boramiz.",
    note: "Har bir fikr biz uchun muhim",
    image: feedback,
    accent: "from-[#ffd66f] via-[#ffca68] to-[#ffb85b]",
    surface: "from-[#fffcef] via-[#fff4dc] to-[#ffecc8]",
  },
].map((step) => ({ ...step, icon: stepIcons[step.id] }));

function HowItWorksSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(steps[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeStep = useMemo(
    () => steps.find((step) => step.id === activeId) ?? steps[0],
    [activeId]
  );

  const activeIndex = useMemo(
    () => steps.findIndex((step) => step.id === activeId),
    [activeId]
  );

  return (
    <section className="relative overflow-hidden bg-[image:var(--home-section-how-bg)] py-18 lg:py-24">
      {/* ===== Decorative background orbs ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--home-blob-1)] blur-3xl animate-pulse" />
        <div className="absolute right-10 top-1/3 h-80 w-80 rounded-full bg-[var(--home-blob-3)] blur-3xl animate-bounce-slow" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-[var(--home-blob-2)] blur-3xl animate-pulse" />
        <div className="absolute left-[60%] top-[10%] h-48 w-48 rounded-full bg-[var(--home-blob-4)] blur-3xl animate-float-slow" />

        {/* Floating sparkles */}
        <div className="absolute left-[12%] top-[22%] animate-float-slow text-[var(--home-accent)]/20">
          <HiSparkles className="text-2xl" />
        </div>
        <div className="absolute right-[18%] top-[62%] animate-float-delayed text-[var(--home-accent-strong)]/20">
          <HiSparkles className="text-xl" />
        </div>
        <div className="absolute left-[38%] top-[78%] animate-float-slower text-[var(--home-accent)]/15">
          <HiSparkles className="text-lg" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Header ===== */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="80">
          <div
            className={`mb-6 inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
              isDark
                ? "border-[color-mix(in_srgb,var(--home-accent)_25%,transparent)] bg-[rgba(18,28,45,0.72)]"
                : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] shadow-[var(--home-shadow-soft)]"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--home-accent)]/15">
              <HiSparkles className="text-sm text-[var(--home-accent)]" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--home-muted)] sm:text-[11px]">
              Qanday ishlaydi
            </span>
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black leading-[0.98] text-[var(--home-heading)] sm:text-5xl lg:text-6xl">
            Platformadan qanday
            <span
              className="mt-2 block bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--home-accent-gradient)" }}
            >
              foydalaniladi?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--home-body)] sm:text-lg">
            To'rt oddiy bosqich bilan darsni boshlaysiz, o'yinni tanlaysiz,
            o'quvchilarni jalb qilasiz va jarayonni doimiy yaxshilab borasiz.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.85fr)] lg:items-start">
          {/* ===== Left: Step List ===== */}
          <ol className="relative space-y-4" data-aos="fade-right" data-aos-delay="140">
            {/* Connecting line */}
            <div
              className="absolute left-[1.875rem] top-8 bottom-8 w-[2px] rounded-full transition-all duration-700"
              style={{
                background: `linear-gradient(180deg, var(--home-accent) 0%, var(--home-accent) ${((activeIndex + 1) / steps.length) * 100}%, var(--home-surface-border) ${((activeIndex + 1) / steps.length) * 100}%, var(--home-surface-border) 100%)`,
              }}
              aria-hidden="true"
            />

            {steps.map((step, index) => {
              const isActive = step.id === activeId;
              const isHovered = step.id === hoveredId;

              return (
                <li key={step.id} className="relative pl-16" data-aos="fade-up" data-aos-delay={160 + index * 70}>
                  {/* Step number circle */}
                  <button
                    type="button"
                    onClick={() => setActiveId(step.id)}
                    onMouseEnter={() => setHoveredId(step.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`absolute left-0 top-5 grid h-[3.25rem] w-[3.25rem] place-items-center rounded-2xl border-2 text-base font-black transition-all duration-500 ${
                      isActive
                        ? `border-transparent bg-gradient-to-br ${step.accent} text-white shadow-lg scale-110`
                        : isHovered
                          ? `border-[var(--home-accent)]/40 bg-[var(--home-surface-bg)] text-[var(--home-accent)] scale-105`
                          : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] text-[var(--home-muted)]"
                    }`}
                    style={{
                      transform: isActive
                        ? "scale(1.1) rotate(0deg)"
                        : isHovered
                          ? "scale(1.05)"
                          : "scale(1)",
                    }}
                  >
                    <span
                      className="transition-transform duration-500"
                      style={{
                        transform: isActive ? "rotate(0deg) scale(1)" : "rotate(0deg) scale(1)",
                      }}
                    >
                      {step.icon}
                    </span>

                    {/* Active glow ring */}
                    {isActive && (
                      <span
                        className="absolute -inset-1.5 rounded-2xl opacity-40 animate-pulse"
                        style={{
                          background: `var(--home-accent-gradient)`,
                        }}
                      />
                    )}
                  </button>

                  {/* Step card */}
                  <button
                    type="button"
                    onClick={() => setActiveId(step.id)}
                    onMouseEnter={() => setHoveredId(step.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    aria-pressed={isActive}
                    className={`group relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-500 sm:p-5 ${
                      isActive
                        ? isDark
                          ? "border-[#59b9e6]/35 bg-[#1a1a28]/90 shadow-[0_16px_38px_rgba(0,0,0,0.2)]"
                          : "border-white/90 bg-white/80 shadow-[0_16px_38px_rgba(139,92,100,0.12)]"
                        : isDark
                          ? "border-transparent bg-transparent hover:border-[#2b3146] hover:bg-[#1e1e2f]/65"
                          : "border-transparent bg-transparent hover:border-white/65 hover:bg-white/45"
                    }`}
                    style={{
                      transform: isHovered && !isActive ? "translateX(4px)" : "translateX(0)",
                    }}
                  >
                    {/* Small preview image */}
                    <div
                      className={`hidden h-16 w-22 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${step.surface} shadow-sm transition-all duration-500 sm:block ${
                        isActive ? "ring-2 ring-[var(--home-accent)]/30" : ""
                      }`}
                    >
                      <img
                        src={step.image}
                        alt=""
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Text content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                          isActive
                            ? "text-[var(--home-accent)]"
                            : "text-[var(--home-muted)]"
                        }`}
                      >
                        {step.short}
                      </p>
                      <h3 className="mt-0.5 text-lg font-black text-[var(--home-heading)] sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-sm text-[var(--home-body)]">
                        {step.note}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div
                      className={`shrink-0 grid h-8 w-8 place-items-center rounded-lg transition-all duration-500 ${
                        isActive
                          ? "bg-[var(--home-accent)]/10 translate-x-0"
                          : "bg-transparent -translate-x-1 group-hover:translate-x-0 group-hover:bg-[var(--home-accent)]/5"
                      }`}
                    >
                      <FaArrowRight
                        className={`text-xs transition-all duration-500 ${
                          isActive
                            ? "translate-x-0 text-[var(--home-accent)]"
                            : "-translate-x-1 text-[var(--home-muted)] group-hover:translate-x-0"
                        }`}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* ===== Right: Active Step Detail Card ===== */}
          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            {/* Background glow */}
            <div
              className="absolute inset-x-8 top-12 -z-10 h-56 rounded-full blur-3xl transition-all duration-700"
              style={{
                background: `var(--home-accent-gradient)`,
                opacity: 0.12,
              }}
            />

            {/* Main card */}
            <div
              className={`relative rounded-2xl border p-1 backdrop-blur-[18px] transition-all duration-500 ${
                isDark
                  ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
                  : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
              }`}
            >
              {/* Step indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden">
                <div
                  className="h-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${((activeIndex + 1) / steps.length) * 100}%`,
                    background: "var(--home-accent-gradient)",
                  }}
                />
              </div>

              <div
                className={`overflow-hidden rounded-xl border transition-all duration-500 ${
                  isDark
                    ? "border-[#2b3146] bg-gradient-to-br from-[#1e1e2f] via-[#181c2a] to-[#131827]"
                    : `border-[#f2d9d7] bg-gradient-to-br ${activeStep.surface}`
                }`}
              >
                {/* Image area */}
                <div className="relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(180deg, transparent 0%, ${
                        isDark ? "rgba(30,30,47,0.8)" : "rgba(255,255,255,0.6)"
                      } 100%)`,
                    }}
                  />
                  <img
                    src={activeStep.image}
                    alt={activeStep.title}
                    className="h-64 w-full object-cover object-center transition-all duration-700 sm:h-72 hover:scale-105"
                    style={{
                      animation: "none",
                    }}
                  />

                  {/* Gradient underline */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1.5"
                    style={{ backgroundImage: "var(--home-accent-gradient)" }}
                  />

                  {/* Step badge on image */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${activeStep.accent} text-sm font-black text-white shadow-lg backdrop-blur-sm`}
                    >
                      {activeStep.icon}
                    </span>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--home-soft-text)]">
                        Tanlangan qadam
                      </p>
                      <h3 className="mt-1.5 text-2xl font-black leading-tight text-[var(--home-heading)] sm:text-3xl">
                        {activeStep.title}
                      </h3>
                    </div>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${activeStep.accent} text-xs font-black text-white shadow-md`}
                    >
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-4 text-base leading-relaxed text-[var(--home-body)]">
                    {activeStep.description}
                  </p>

                  <div
                    className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-[#2b3146] bg-[#ffffff]/[0.02]"
                        : "border-white/70 bg-[#ffffff]/[0.5]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ffd15d]/15">
                      <FaRegLightbulb className="text-sm text-[#ffd15d]" />
                    </span>
                    <p className="text-sm font-semibold text-[var(--home-heading)]">
                      {activeStep.note}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate("/games")}
                      className="group relative inline-flex cursor-pointer items-center gap-3 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_40px_rgba(89,185,230,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(255,209,93,0.34)] overflow-hidden"
                      style={{ backgroundImage: "var(--home-accent-gradient)" }}
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
                      <span className="relative z-10 flex items-center gap-3">
                        O'yinlarni ko'rish
                        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;