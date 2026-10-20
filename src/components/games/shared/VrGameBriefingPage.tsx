import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCompass,
  FaExpand,
  FaGamepad,
  FaMousePointer,
  FaRocket,
  FaPlay,
} from "react-icons/fa";
import { gameCards } from "../../../pages/games/data";

type VrGameBriefingPageProps = {
  gameId: "plant-vr" | "world-explorer" | "virtual-zoo-vr" | "vr-solar-system";
  playPath: string;
};

const briefings = {
  "plant-vr": {
    eyebrow: "Virtual laboratoriya",
    mission: "Urug'dan hosilgacha bo'lgan jarayonni o'zingiz boshqaring.",
    highlights: [
      "Urug' eking va tuproqni tayyorlang",
      "Suv hamda yorug'lik muvozanatini kuzating",
      "O'simlik o'sishini natija orqali baholang",
    ],
    accent: "from-emerald-400 via-lime-300 to-amber-300",
    glow: "shadow-emerald-500/30",
    ring: "ring-emerald-400/40",
  },
  "world-explorer": {
    eyebrow: "3D geografiya missiyasi",
    mission:
      "Globusni boshqaring, mamlakatlarni kashf qiling va dunyoni yaqinroqdan biling.",
    highlights: [
      "3D globusni erkin aylantiring",
      "Davlatlar haqida qisqa faktlarni o'qing",
      "Qiziqarli joylarni o'zingiz toping",
    ],
    accent: "from-sky-400 via-blue-400 to-emerald-300",
    glow: "shadow-sky-500/30",
    ring: "ring-sky-400/40",
  },
  "virtual-zoo-vr": {
    eyebrow: "Immersive ekspeditsiya",
    mission:
      "Virtual zooparkda sayr qiling va hayvonot olamini kashf eting.",
    highlights: [
      "Hayvonlarga xavfsiz tarzda yaqinlashing",
      "Muhit va turli hayvonlarni kuzating",
      "Biologiyani tajriba orqali o'rganing",
    ],
    accent: "from-emerald-300 via-teal-300 to-sky-300",
    glow: "shadow-teal-500/30",
    ring: "ring-teal-400/40",
  },
  "vr-solar-system": {
    eyebrow: "Koinot navigatsiyasi",
    mission:
      "Quyosh tizimi bo'ylab sayohat qilib, sayyoralarni yangi masshtabda ko'ring.",
    highlights: [
      "Sayyorani tanlang va unga yaqinlashing",
      "Koinot obyektlarini erkin kuzating",
      "Har bir sayyora haqidagi faktlarni o'rganing",
    ],
    accent: "from-cyan-300 via-blue-400 to-violet-400",
    glow: "shadow-violet-500/30",
    ring: "ring-violet-400/40",
  },
} as const;

const controlItems = [
  {
    icon: FaMousePointer,
    title: "Boshqaruv",
    desc: "Sichqoncha yoki touch bilan erkin harakat qiling.",
  },
  {
    icon: FaExpand,
    title: "Keng ekran",
    desc: "Tajriba uchun keng ekran yoki VR qurilma tavsiya etiladi.",
  },
  {
    icon: FaRocket,
    title: "Tayyor bo'ling",
    desc: "Jarayon boshlangach, sayohatni o'zingiz boshqarasiz.",
  },
];

export default function VrGameBriefingPage({
  gameId,
  playPath,
}: VrGameBriefingPageProps) {
  const navigate = useNavigate();
  const game = useMemo(
    () => gameCards.find((item) => item.id === gameId),
    [gameId],
  );
  const briefing = briefings[gameId];

  if (!game) return null;

  const GameIcon = game.mainIcon;

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#061323] text-white">
      {/* ── Background layers ── */}
      <img
        src={game.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(3,11,22,0.98)_0%,rgba(3,11,22,0.9)_40%,rgba(3,11,22,0.55)_70%,rgba(3,11,22,0.35)_100%)]" />
      <div
        className={`absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-gradient-to-br ${briefing.accent} opacity-20 blur-[140px] animate-pulse-slow`}
      />
      <div
        className={`absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr ${briefing.accent} opacity-15 blur-[140px]`}
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative mx-auto flex h-full w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-10 lg:py-6">
        {/* Top bar: back + meta */}
        <div className="flex shrink-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/games")}
            className="group inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 text-xs font-bold text-white/85 backdrop-blur-xl transition-all hover:-translate-x-0.5 hover:border-white/25 hover:bg-white/[0.12]"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">O'yinlarga qaytish</span>
            <span className="sm:hidden">Orqaga</span>
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${briefing.accent} px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-950 shadow-lg ${briefing.glow}`}
            >
              <FaCompass /> {briefing.eyebrow}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
              <FaGamepad /> {game.level}
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid min-h-0 flex-1 items-center gap-6 py-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-6">
          {/* ── LEFT: Hero ── */}
          <section className="flex min-h-0 flex-col justify-center animate-fade-in-up">
            {/* Icon */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} text-2xl shadow-2xl ring-1 ring-white/25`}
            >
              <GameIcon />
            </div>

            {/* Title */}
            <h1 className="mt-5 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-3xl font-black leading-[1.05] tracking-tight text-transparent sm:text-4xl lg:text-5xl xl:text-6xl">
              {game.title}
            </h1>

            {/* Mission */}
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base lg:text-lg">
              {briefing.mission}
            </p>

            {/* Decorative line */}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                VR Briefing
              </span>
            </div>
          </section>

          {/* ── RIGHT: Panel (highlights + controls + CTA) ── */}
          <section className="relative flex min-h-0 flex-col animate-fade-in-up [animation-delay:150ms]">
            {/* Glow behind */}
            <div
              className={`pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r ${briefing.accent} opacity-20 blur-2xl`}
            />

            <div className="relative flex max-h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/70 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              {/* Highlights */}
              <div className="p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                  Bu missiyada nimalar bor
                </p>
                <ul className="mt-3 grid gap-2.5">
                  {briefing.highlights.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-5 text-white/80 animate-fade-in-up"
                      style={{ animationDelay: `${200 + i * 80}ms` }}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br ${briefing.accent} text-[9px] text-slate-950 shadow-md`}
                      >
                        <FaCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Controls */}
              <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">
                {controlItems.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="group flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:border-white/15 hover:bg-white/[0.06]"
                  >
                    <Icon className="mt-0.5 shrink-0 text-cyan-300 transition-transform group-hover:scale-110" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-white/50">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-auto border-t border-white/10 p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => navigate(playPath)}
                  className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r ${briefing.accent} px-6 py-4 text-sm font-black text-slate-950 shadow-2xl ${briefing.glow} ring-1 ring-white/30 transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)] active:scale-[0.99]`}
                >
                  {/* Shine sweep */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <FaPlay className="text-xs transition-transform group-hover:scale-110" />
                  <span>Tajribani boshlash</span>
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom gradient line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </main>
  );
}