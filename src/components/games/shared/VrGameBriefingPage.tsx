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
    highlights: ["Urug' eking va tuproqni tayyorlang", "Suv hamda yorug'lik muvozanatini kuzating", "O'simlik o'sishini natija orqali baholang"],
    accent: "from-emerald-400 via-lime-300 to-amber-300",
  },
  "world-explorer": {
    eyebrow: "3D geografiya missiyasi",
    mission: "Globusni boshqaring, mamlakatlarni kashf qiling va dunyoni yaqinroqdan biling.",
    highlights: ["3D globusni erkin aylantiring", "Davlatlar haqida qisqa faktlarni o'qing", "Qiziqarli joylarni o'zingiz toping"],
    accent: "from-sky-400 via-blue-400 to-emerald-300",
  },
  "virtual-zoo-vr": {
    eyebrow: "Immersive ekspeditsiya",
    mission: "Virtual zooparkda sayr qiling va hayvonot olamini kashf eting.",
    highlights: ["Hayvonlarga xavfsiz tarzda yaqinlashing", "Muhit va turli hayvonlarni kuzating", "Biologiyani tajriba orqali o'rganing"],
    accent: "from-emerald-300 via-teal-300 to-sky-300",
  },
  "vr-solar-system": {
    eyebrow: "Koinot navigatsiyasi",
    mission: "Quyosh tizimi bo'ylab sayohat qilib, sayyoralarni yangi masshtabda ko'ring.",
    highlights: ["Sayyorani tanlang va unga yaqinlashing", "Koinot obyektlarini erkin kuzating", "Har bir sayyora haqidagi faktlarni o'rganing"],
    accent: "from-cyan-300 via-blue-400 to-violet-400",
  },
} as const;

export default function VrGameBriefingPage({ gameId, playPath }: VrGameBriefingPageProps) {
  const navigate = useNavigate();
  const game = useMemo(() => gameCards.find((item) => item.id === gameId), [gameId]);
  const briefing = briefings[gameId];

  if (!game) return null;

  const GameIcon = game.mainIcon;

  return (
    <main className="min-h-screen bg-[#061323] px-4 py-5 text-white sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1440px]">
        <button
          type="button"
          onClick={() => navigate("/games")}
          className="mb-5 inline-flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm font-bold text-white/85 transition hover:bg-white/[0.12] md:hidden"
        >
          <FaArrowLeft /> O'yinlarga qaytish
        </button>

        <section className="relative min-h-[660px] overflow-hidden rounded-lg border border-white/15 bg-[#081b2d] shadow-[0_28px_80px_rgba(0,0,0,0.42)] lg:min-h-[720px]">
          <img src={game.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,11,22,0.96)_0%,rgba(3,11,22,0.82)_40%,rgba(3,11,22,0.18)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative flex min-h-[660px] flex-col justify-between p-6 sm:p-8 lg:min-h-[720px] lg:p-12">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-md bg-gradient-to-r ${briefing.accent} px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-950`}>
                  <FaCompass /> {briefing.eyebrow}
                </span>
                <span className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-slate-950/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
                  <FaGamepad /> {game.level}
                </span>
              </div>

              <div className={`mt-8 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${game.iconBg} text-2xl shadow-xl ring-1 ring-white/25`}>
                <GameIcon />
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">{game.title}</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">{briefing.mission}</p>
            </div>

            <div className="mt-10 max-w-2xl border-t border-white/15 pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">Bu missiyada nimalar bor</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {briefing.highlights.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-5 text-white/82">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br ${briefing.accent} text-[9px] text-slate-950`}><FaCheck /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid border-x border-b border-white/10 bg-[#081627] lg:grid-cols-[1fr_auto]">
          <div className="grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
            <div className="flex items-start gap-3">
              <FaMousePointer className="mt-1 text-cyan-300" />
              <div><p className="text-sm font-bold">Boshqaruv</p><p className="mt-1 text-xs leading-5 text-white/55">Sichqoncha yoki touch bilan erkin harakat qiling.</p></div>
            </div>
            <div className="flex items-start gap-3">
              <FaExpand className="mt-1 text-cyan-300" />
              <div><p className="text-sm font-bold">Keng ekran</p><p className="mt-1 text-xs leading-5 text-white/55">Tajriba uchun keng ekran yoki VR qurilma tavsiya etiladi.</p></div>
            </div>
            <div className="flex items-start gap-3">
              <FaRocket className="mt-1 text-cyan-300" />
              <div><p className="text-sm font-bold">Tayyor bo'ling</p><p className="mt-1 text-xs leading-5 text-white/55">Jarayon boshlangach, sayohatni o'zingiz boshqarasiz.</p></div>
            </div>
          </div>
          <div className="flex items-center border-t border-white/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
            <button
              type="button"
              onClick={() => navigate(playPath)}
              className={`group flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r ${briefing.accent} px-6 py-4 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110 sm:w-auto`}
            >
              Tajribani boshlash <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
