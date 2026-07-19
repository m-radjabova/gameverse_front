import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaCheck, FaPlay, FaStar, FaUsers } from "react-icons/fa";
import useContextPro from "../../../hooks/useContextPro";
import {
  buildParticipantOptions,
  saveGameQuestionDifficulty,
  saveGameSessionConfig,
  type GameQuestionDifficulty,
} from "../../../hooks/gameSession";
import { gameCards } from "../../../pages/games/data";
import { DIRECT_PLAY_GAME_PATHS } from "./directPlayGames";

const DIFFICULTIES: Array<{
  value: GameQuestionDifficulty;
  label: string;
  description: string;
  stars: number;
}> = [
  { value: "easy", label: "Oson", description: "Tez va sodda savollar", stars: 1 },
  { value: "medium", label: "O'rta", description: "Biroz fikrlash talab qiladi", stars: 2 },
  { value: "hard", label: "Qiyin", description: "Kuchli bilim va mantiq uchun", stars: 3 },
];

export default function GameQuestionSetupPage() {
  const navigate = useNavigate();
  const { gameId = "" } = useParams();
  const { state: { user } } = useContextPro();
  const game = useMemo(() => gameCards.find((item) => item.id === gameId), [gameId]);
  const participantOptions = useMemo(() => game ? buildParticipantOptions(game.players) : [], [game]);
  const showsParticipantOptions = Boolean(
    game &&
    !DIRECT_PLAY_GAME_PATHS.has(game.path) &&
    game.id !== "pizza-master" &&
    game.id !== "mystery-egg" &&
    game.id !== "truth-detector" &&
    participantOptions.length > 1,
  );
  const [difficulty, setDifficulty] = useState<GameQuestionDifficulty>("easy");
  const [participantCount, setParticipantCount] = useState(participantOptions[0]?.count ?? 1);

  if (!game) {
    return (
      <main className="grid min-h-[calc(100dvh-72px)] place-items-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">O'yin topilmadi</h1>
          <button type="button" onClick={() => navigate("/games")} className="mt-5 rounded-2xl bg-white/10 px-6 py-3 font-bold">O'yinlarga qaytish</button>
        </div>
      </main>
    );
  }

  const startGame = () => {
    saveGameQuestionDifficulty(game.id, difficulty);

    if (showsParticipantOptions) {
      const option = participantOptions.find((item) => item.count === participantCount) ?? participantOptions[0];
      if (option) {
        saveGameSessionConfig({
          gameId: game.id,
          participantCount: option.count,
          participantType: option.participantType,
          participantLabel: option.participantLabel,
          participantLabels: Array.from({ length: option.count }, (_, index) =>
            option.count === 1
              ? user?.username?.trim() || "O'YINCHI 1"
              : `${option.participantLabel.toUpperCase()} ${index + 1}`,
          ),
          questionDifficulty: difficulty,
          selectedAt: new Date().toISOString(),
        });
      }
    }

    navigate(`${game.path}/play`);
  };

  const accent = game.gradient ?? "from-violet-500 to-fuchsia-500";

  return (
    <main className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-slate-950 text-white">
      <img src={game.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35 blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(255,255,255,0.08),transparent_35%),linear-gradient(120deg,rgba(2,6,23,0.99)_15%,rgba(2,6,23,0.88)_48%,rgba(2,6,23,0.7))]" />
      <div className={`absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br ${accent} opacity-20 blur-[130px]`} />

      <div className="relative mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <button type="button" onClick={() => navigate(game.path)} className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white">
          <FaArrowLeft /> Orqaga
        </button>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <section>
            <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${accent} px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl`}>
              <FaStar /> O'yinga tayyorgarlik
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.92] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{game.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/55 sm:text-lg">{game.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/65">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{game.players}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{game.time}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{game.category}</span>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7 lg:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">1-qadam</p>
                <h2 className="mt-1 text-2xl font-black">Savollar qiyinligi</h2>
              </div>
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent}`}><FaStar /></div>
            </div>

            <div className="mt-5 grid gap-3">
              {DIFFICULTIES.map((item) => {
                const selected = difficulty === item.value;
                return (
                  <button key={item.value} type="button" onClick={() => setDifficulty(item.value)} className={`group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5 ${selected ? "border-white/30 bg-white/10 shadow-xl" : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"}`}>
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? `bg-gradient-to-br ${accent}` : "bg-white/5 text-white/45"}`}>{selected ? <FaCheck /> : item.stars}</span>
                    <span className="min-w-0 flex-1"><b className="block text-lg">{item.label}</b><small className="text-sm text-white/45">{item.description}</small></span>
                    <span className="flex gap-1">{Array.from({ length: 3 }, (_, index) => <FaStar key={index} className={index < item.stars ? "text-amber-300" : "text-white/10"} />)}</span>
                  </button>
                );
              })}
            </div>

            {showsParticipantOptions && (
              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="mb-3 flex items-center gap-2"><FaUsers className="text-white/45" /><h3 className="font-black">O'yinchilar soni</h3></div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {participantOptions.map((option) => (
                    <button key={option.count} type="button" onClick={() => setParticipantCount(option.count)} className={`rounded-xl border px-3 py-3 text-sm font-black transition ${participantCount === option.count ? `border-white/30 bg-gradient-to-r ${accent}` : "border-white/10 bg-white/5 hover:bg-white/10"}`}>{option.label}</button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-xs leading-5 text-white/40">Teacher savollari mavjud bo'lsa ular ishlatiladi. Aks holda tanlangan qiyinlikdagi tayyor savollar yuklanadi.</p>
            <button type="button" onClick={startGame} className={`mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${accent} px-6 py-4 text-base font-black shadow-2xl transition hover:scale-[1.01] active:scale-[0.99]`}>
              <FaPlay /> O'yinni boshlash <FaArrowRight />
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
