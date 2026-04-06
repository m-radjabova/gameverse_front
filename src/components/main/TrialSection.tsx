import { FaArrowRight, FaCheckCircle, FaPlay } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { PiStudentFill } from "react-icons/pi";
import { TbDeviceDesktopAnalytics, TbSchool } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import trialImg from "../../assets/trial_image.png";

const highlights = [
  "7 kunlik bepul sinov",
  "O'qituvchi uchun qulay boshqaruv",
  "O'quvchi uchun qiziqarli tajriba",
];

const quickStats = [
  {
    icon: PiStudentFill,
    value: "5K+",
    label: "Faol o'quvchilar",
  },
  {
    icon: TbSchool,
    value: "30+",
    label: "Fan va yo'nalish",
  },
  {
    icon: TbDeviceDesktopAnalytics,
    value: "24/7",
    label: "Nazorat va tahlil",
  },
];

function TrialSection({ isDark = false }: { isDark?: boolean }) {
  const navigate = useNavigate();

  return (
    <section
      className="relative overflow-hidden bg-[image:var(--home-section-trial-bg)] py-18 transition-colors duration-500 lg:py-24"
    >
      <div className="absolute inset-0">
        <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-[var(--home-blob-1)] blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-[var(--home-blob-2)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[var(--home-blob-3)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-center lg:text-left" data-aos="fade-right" data-aos-delay="80">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-lg backdrop-blur-sm ${
                isDark
                  ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] shadow-[var(--home-shadow-soft)]"
                  : "border-[var(--home-surface-border)] bg-[var(--home-surface-bg)] shadow-[var(--home-shadow-soft)]"
              }`}
            >
              <HiSparkles className="text-sm text-[var(--home-accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--home-muted)] sm:text-[11px]">
                Sinov versiyasi
              </span>
            </div>

            <h2 className="max-w-2xl text-4xl font-black leading-[0.98] text-[var(--home-heading)] sm:text-5xl lg:text-6xl">
              Platformani
              <span
                className="mt-2 block bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--home-accent-gradient)" }}
              >
                7 kun bepul sinab ko'ring
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--home-body)] lg:mx-0 lg:text-lg">
              O'qituvchi va o'quvchi uchun qulay boshqaruvni bir joyga jamlab,
              sahifaning yangi dark uslubiga mos, silliq va zamonaviy blok
              tayyorlandi.
            </p>

            <div className="mt-8 space-y-3">
              {highlights.map((item, index) => (
                <div
                  key={item}
                  data-aos="fade-up"
                  data-aos-delay={180 + index * 70}
                  className={`flex items-center justify-center gap-3 rounded-2xl border px-4 py-3 text-left backdrop-blur-sm lg:justify-start ${
                    isDark
                      ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-soft)] shadow-[0_12px_30px_var(--home-shadow-card-soft)]"
                      : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg-soft)] shadow-[0_12px_30px_var(--home-shadow-card-soft)]"
                  }`}
                >
                  <FaCheckCircle className="shrink-0 text-[var(--home-accent)]" />
                  <span className="text-sm font-semibold text-[var(--home-heading)] sm:text-[15px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <button
                onClick={() => navigate("/games")}
                className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(89,185,230,0.30)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(255,209,93,0.34)]"
                style={{ backgroundImage: "var(--home-accent-gradient)" }}
              >
                <FaPlay className="text-xs" />
                Boshlash
                <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="relative" data-aos="fade-left" data-aos-delay="140">
            <div className="absolute inset-x-8 top-8 -z-10 h-48 rounded-full bg-[var(--home-blob-1)] blur-3xl" />
            <div
              className={`rounded-[34px] border p-5 backdrop-blur-[18px] sm:p-6 ${
                isDark
                  ? "border-[var(--home-surface-border)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
                  : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg-faint)] shadow-[0_28px_80px_var(--home-shadow-card)]"
              }`}
            >
              <div
                className={`rounded-[28px] border p-5 sm:p-6 ${
                  isDark
                    ? "border-[#2b3146] bg-gradient-to-br from-[#1e1e2f] via-[#181c2a] to-[#131827]"
                    : "border-[var(--home-surface-border)] bg-gradient-to-br from-[#ffffff] via-[#f6fcff] to-[#fff7df]"
                }`}
              >
                <div
                  className={`rounded-[24px] border-2 border-dashed p-1 shadow-sm ${
                    isDark
                      ? "border-[#59b9e6]/25 bg-[linear-gradient(135deg,rgba(18,28,45,0.94),rgba(15,23,42,0.90))]"
                      : "border-[#eccbce] bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(253,236,238,0.85))]"
                  }`}
                >
                  <img className="rounded-[24px]" src={trialImg} alt="Trial image" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quickStats.map((item, index) => (
                    <div
                      key={item.label}
                      data-aos="zoom-in"
                      data-aos-delay={220 + index * 70}
                      className={`rounded-2xl border p-4 shadow-sm ${
                        isDark
                          ? "border-[#2b3146] bg-[#1e1e2f]"
                          : "border-[var(--home-surface-border-soft)] bg-[var(--home-surface-bg)]"
                      }`}
                    >
                      <item.icon className="mb-3 text-lg text-[var(--home-accent)]" />
                      <p className="text-xl font-black text-[var(--home-heading)]">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--home-body)]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrialSection;
