import { useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaRegCommentDots,
  FaRegLightbulb,
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
];

function HowItWorksSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(steps[0].id);

  const activeStep = useMemo(
    () => steps.find((step) => step.id === activeId) ?? steps[0],
    [activeId]
  );

  return (
    <section className="relative overflow-hidden bg-[image:var(--home-section-how-bg)] py-18 lg:py-24">
      <div className="absolute inset-0">
        <div className="absolute left-10 top-12 h-56 w-56 rounded-full bg-[var(--home-blob-1)] blur-3xl" />
        <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-[var(--home-blob-2)] blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-[var(--home-blob-3)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-aos="fade-up" data-aos-delay="80">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
            isDark ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] shadow-[var(--home-shadow-soft)]" : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] shadow-[var(--home-shadow-soft)]"
          }`}>
            <HiSparkles className="text-sm text-[var(--home-accent)]" />
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

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="grid gap-5 sm:grid-cols-2" data-aos="fade-right" data-aos-delay="140">
            {steps.map((step, index) => {
              const isActive = step.id === activeId;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveId(step.id)}
                  data-aos="fade-up"
                  data-aos-delay={160 + index * 70}
                  className={`group relative overflow-hidden rounded-[30px] border p-5 text-left transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? "border-[#59b9e6]/18 bg-[#1a1a28]/86 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-[16px] -translate-y-1"
                        : "border-white/80 bg-white/70 shadow-[0_24px_70px_rgba(139,92,100,0.16)] backdrop-blur-[16px] -translate-y-1"
                      : isDark
                        ? "border-[#2b3146] bg-[#1e1e2f]/78 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur-[12px] hover:-translate-y-1 hover:bg-[#25253a]"
                        : "border-white/60 bg-white/50 shadow-[0_14px_40px_rgba(139,92,100,0.10)] backdrop-blur-[12px] hover:-translate-y-1 hover:bg-white/65"
                  }`}
                >
                  <div className={`absolute inset-x-6 top-4 h-24 rounded-full bg-gradient-to-r ${step.accent} opacity-20 blur-3xl`} />
                  <div className={`relative rounded-[24px] bg-gradient-to-br ${step.surface} p-4`}>
                    <div className="overflow-hidden rounded-[18px] border border-white/70 bg-white/50">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="h-60 bg-transparent w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            <div className="absolute inset-x-8 top-8 -z-10 h-48 rounded-full bg-[var(--home-blob-1)] blur-3xl" />
            <div className={`rounded-[34px] border p-5 backdrop-blur-[18px] sm:p-6 ${
              isDark
                ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
                : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
            }`}>
              <div className={`rounded-[28px] border p-6 sm:p-7 ${
                isDark
                  ? "border-[#2b3146] bg-gradient-to-br from-[#1e1e2f] via-[#181c2a] to-[#131827]"
                  : `border-[#f2d9d7] bg-gradient-to-br ${activeStep.surface}`
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--home-soft-text)]">
                      Faol bosqich
                    </p>
                    <h3 className="mt-3 text-3xl font-black leading-tight text-[var(--home-heading)] sm:text-4xl">
                      {activeStep.title}
                    </h3>
                  </div>
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${activeStep.accent} shadow-lg`}>
                    <FaRegCommentDots className="text-xl text-white" />
                  </div>
                </div>

                <div className={`mt-6 overflow-hidden rounded-[24px] border shadow-sm ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/55"}`}>
                  <img
                    src={activeStep.image}
                    alt={activeStep.title}
                    className="h-64 w-full object-cover object-center"
                  />
                </div>

                <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--home-body)]">
                  {activeStep.description}
                </p>

                <div className={`mt-6 rounded-2xl border px-4 py-4 shadow-sm ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/70"}`}>
                  <div className="flex items-center gap-3">
                    <FaRegLightbulb className="text-[#ffd15d]" />
                    <p className="text-sm font-semibold text-[var(--home-heading)]">
                      {activeStep.note}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Interaktiv boshlash jarayoni",
                    "Darsga moslashadigan o'yinlar",
                    "Natijaga yo'naltirilgan tajriba",
                  ].map((item, index) => (
                    <div
                      key={item}
                      data-aos="fade-up"
                      data-aos-delay={220 + index * 60}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/65"}`}
                    >
                      <FaCheckCircle className="text-[var(--home-accent)]" />
                      <span className="text-sm font-medium text-[var(--home-heading)]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/games")}
                    className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(89,185,230,0.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(255,209,93,0.34)]"
                    style={{ backgroundImage: "var(--home-accent-gradient)" }}
                  >
                    O'yinlarni ko'rish
                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
                  </button>
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
