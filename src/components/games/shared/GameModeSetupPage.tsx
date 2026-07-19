import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaPlay, FaUsers } from "react-icons/fa";
import useContextPro from "../../../hooks/useContextPro";
import { buildParticipantOptions, saveGameSessionConfig } from "../../../hooks/gameSession";
import { gameCards } from "../../../pages/games/data";

export default function GameModeSetupPage() {
  const navigate = useNavigate();
  const { gameId = "" } = useParams();
  const { state: { user } } = useContextPro();
  const game = useMemo(() => gameCards.find((item) => item.id === gameId), [gameId]);
  const options = useMemo(() => game ? buildParticipantOptions(game.players) : [], [game]);

  if (!game) return <main className="grid min-h-screen place-items-center bg-slate-950 text-white">O'yin topilmadi</main>;

  const start = (option: (typeof options)[number]) => {
    saveGameSessionConfig({
      gameId: game.id,
      participantCount: option.count,
      participantType: option.participantType,
      participantLabel: option.participantLabel,
      participantLabels: Array.from({ length: option.count }, (_, index) => option.count === 1 ? user?.username?.trim() || "O'YINCHI 1" : `${option.participantLabel.toUpperCase()} ${index + 1}`),
      questionDifficulty: "easy",
      selectedAt: new Date().toISOString(),
    });
    navigate(`${game.path}/play`);
  };

  return (
    <main className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-slate-950 text-white">
      <img src={game.image} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-cyan-950/60" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-72px)] max-w-5xl flex-col px-5 py-8 sm:px-8 lg:py-12">
        <button type="button" onClick={() => navigate(game.path)} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white"><FaArrowLeft /> Orqaga</button>
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200"><FaUsers /> O'yin rejimini tanlang</span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">{game.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/55">O'yin boshlanishidan oldin nechta ishtirokchi qatnashishini tanlang.</p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {options.map((option) => (
              <button key={option.count} type="button" onClick={() => start(option)} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-left shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-cyan-400/10">
                <span className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl"><FaUsers /></span><FaArrowRight className="text-white/35 transition group-hover:translate-x-1 group-hover:text-cyan-200" /></span>
                <b className="mt-6 block text-2xl font-black">{option.label}</b>
                <span className="mt-2 block text-sm text-white/45">{option.count === 1 ? "Yakka tartibda rekord qo'ying" : "Jamoaviy duelda o'ynang"}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-cyan-200"><FaPlay /> Boshlash</span>
              </button>
            ))}
          </div>
          <p className="mt-7 text-xs text-white/35"><FaCheck className="mr-1 inline text-emerald-300" /> Rejim tanlangandan keyin o'yin darhol boshlanadi.</p>
        </section>
      </div>
    </main>
  );
}
