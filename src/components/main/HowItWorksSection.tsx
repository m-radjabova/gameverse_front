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
    accent: "from-[#f6c671] via-[#eeaa64] to-[#de8b57]",
    surface: "from-[#fff6ea] via-[#ffefdf] to-[#ffe4d0]",
  },
  {
    id: "choose",
    title: "O'yinni tanlang",
    short: "Tanlash",
    description:
      "Mavzu, sinf yoki dars maqsadiga mos o'yinni tanlab, darhol jarayonni boshlang.",
    note: "Har darsga mos format mavjud",
    image: start,
    accent: "from-[#e58ca0] via-[#d96f8b] to-[#bc5c74]",
    surface: "from-[#fff2f5] via-[#ffe6eb] to-[#ffdbe3]",
  },
  {
    id: "play",
    title: "Birga o'ynang",
    short: "Faollik",
    description:
      "O'quvchilarni jamoa yoki individual formatda darsga jalb qiling va jarayonni qiziqarli qiling.",
    note: "Interaktiv va jonli tajriba",
    image: play,
    accent: "from-[#8fd3cf] via-[#74c3bf] to-[#58aba7]",
    surface: "from-[#eefcfb] via-[#def6f4] to-[#cfeeea]",
  },
  {
    id: "feedback",
    title: "Fikr bildiring",
    short: "Yaxshilash",
    description:
      "Taklif va mulohazalaringiz orqali platformani yanada kuchli, qulay va foydali qilib boramiz.",
    note: "Har bir fikr biz uchun muhim",
    image: feedback,
    accent: "from-[#f6b37a] via-[#ed996c] to-[#df7f62]",
    surface: "from-[#fff5ed] via-[#ffe8db] to-[#ffdbc9]",
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
    <section className={`relative overflow-hidden py-18 lg:py-24 ${
      isDark
        ? "bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#131a2d]"
        : "bg-gradient-to-b from-[#fff7f6] via-[#fff1ef] to-[#fff9f8]"
    }`}>
      <div className="absolute inset-0">
        <div className={`absolute left-10 top-12 h-56 w-56 rounded-full blur-3xl ${isDark ? "bg-[#ff6b8a]/16" : "bg-[#f6d4da]/30"}`} />
        <div className={`absolute right-10 top-20 h-64 w-64 rounded-full blur-3xl ${isDark ? "bg-[#1e1e2f]" : "bg-[#fbe5dd]/35"}`} />
        <div className={`absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full blur-3xl ${isDark ? "bg-[#ff4f74]/10" : "bg-[#f1d7de]/20"}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center" data-aos="fade-up" data-aos-delay="80">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
            isDark ? "border-[#ff6b8a]/20 bg-[#1e1e2f]/80" : "border-[#f0d9d6] bg-white/90 shadow-[#d9b2b8]/20"
          }`}>
            <HiSparkles className="text-sm text-[#ff6b8a]" />
            <span className={`text-[10px] font-bold uppercase tracking-[0.24em] sm:text-[11px] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
              Qanday ishlaydi
            </span>
          </div>

          <h2 className={`mx-auto max-w-4xl text-4xl font-black leading-[0.98] sm:text-5xl lg:text-6xl ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
            Platformadan qanday
            <span className="mt-2 block bg-gradient-to-r from-[#ff6b8a] via-[#ff4f74] to-[#ff8ca6] bg-clip-text text-transparent">
              foydalaniladi?
            </span>
          </h2>

          <p className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>
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
                        ? "border-[#ff6b8a]/18 bg-[#1a1a28]/86 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-[16px] -translate-y-1"
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
            <div className={`absolute inset-x-8 top-8 -z-10 h-48 rounded-full blur-3xl ${isDark ? "bg-[#ff6b8a]/14" : "bg-[#f4cfd5]/35"}`} />
            <div className={`rounded-[34px] border p-5 backdrop-blur-[18px] sm:p-6 ${
              isDark
                ? "border-[#ff6b8a]/18 bg-[#1a1a28]/86 shadow-[0_28px_80px_rgba(0,0,0,0.28)]"
                : "border-white/70 bg-white/58 shadow-[0_28px_80px_rgba(139,92,100,0.16)]"
            }`}>
              <div className={`rounded-[28px] border p-6 sm:p-7 ${
                isDark
                  ? "border-[#2b3146] bg-gradient-to-br from-[#1e1e2f] via-[#181c2a] to-[#131827]"
                  : `border-[#f2d9d7] bg-gradient-to-br ${activeStep.surface}`
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "text-[#a1a1aa]" : "text-[#d48d97]"}`}>
                      Faol bosqich
                    </p>
                    <h3 className={`mt-3 text-3xl font-black leading-tight sm:text-4xl ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
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

                <p className={`mt-5 max-w-lg text-base leading-relaxed ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}>
                  {activeStep.description}
                </p>

                <div className={`mt-6 rounded-2xl border px-4 py-4 shadow-sm ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/70"}`}>
                  <div className="flex items-center gap-3">
                    <FaRegLightbulb className="text-[#ff6b8a]" />
                    <p className={`text-sm font-semibold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
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
                      <FaCheckCircle className="text-[#ff6b8a]" />
                      <span className={`text-sm font-medium ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate("/games")}
                    className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#e07c8e] via-[#d97386] to-[#bf6474] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(224,124,142,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(224,124,142,0.45)]"
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
