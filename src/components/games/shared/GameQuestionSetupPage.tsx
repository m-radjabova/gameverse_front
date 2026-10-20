import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaPlay,
  FaStar,
  FaUsers,
  FaBolt,
  FaBrain,
  FaFire,
} from "react-icons/fa";
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
  icon: React.ReactNode;
  glow: string;
  ring: string;
}> = [
  {
    value: "easy",
    label: "Oson",
    description: "Tez va sodda savollar",
    stars: 1,
    icon: <FaBolt />,
    glow: "shadow-emerald-500/30",
    ring: "ring-emerald-400/50",
  },
  {
    value: "medium",
    label: "O'rta",
    description: "Biroz fikrlash talab qiladi",
    stars: 2,
    icon: <FaBrain />,
    glow: "shadow-amber-500/30",
    ring: "ring-amber-400/50",
  },
  {
    value: "hard",
    label: "Qiyin",
    description: "Kuchli bilim va mantiq uchun",
    stars: 3,
    icon: <FaFire />,
    glow: "shadow-rose-500/30",
    ring: "ring-rose-400/50",
  },
];

export default function GameQuestionSetupPage() {
  const navigate = useNavigate();
  const { gameId = "" } = useParams();
  const {
    state: { user },
  } = useContextPro();

  const game = useMemo(
    () => gameCards.find((item) => item.id === gameId),
    [gameId],
  );
  const participantOptions = useMemo(
    () => (game ? buildParticipantOptions(game.players) : []),
    [game],
  );

  const showsParticipantOptions = Boolean(
    game &&
      !DIRECT_PLAY_GAME_PATHS.has(game.path) &&
      game.id !== "pizza-master" &&
      game.id !== "mystery-egg" &&
      game.id !== "truth-detector" &&
      participantOptions.length > 1,
  );

  const [difficulty, setDifficulty] = useState<GameQuestionDifficulty>("easy");
  const [participantCount, setParticipantCount] = useState(
    participantOptions[0]?.count ?? 1,
  );

  if (!game) {
    return (
      <main className="grid min-h-[calc(100dvh-72px)] place-items-center bg-slate-950 px-4 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">O'yin topilmadi</h1>
          <button
            type="button"
            onClick={() => navigate("/games")}
            className="mt-5 rounded-2xl bg-white/10 px-6 py-3 font-bold"
          >
            O'yinlarga qaytish
          </button>
        </div>
      </main>
    );
  }

  const startGame = () => {
    saveGameQuestionDifficulty(game.id, difficulty);

    if (showsParticipantOptions) {
      const option =
        participantOptions.find((item) => item.count === participantCount) ??
        participantOptions[0];
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
  const activeDifficulty = DIFFICULTIES.find((d) => d.value === difficulty);

  return (
    <main className="relative min-h-[calc(100dvh-72px)] overflow-hidden bg-slate-950 text-white">
      {/* Background layers */}
      <img
        src={game.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_20%,rgba(255,255,255,0.08),transparent_40%),linear-gradient(120deg,rgba(2,6,23,0.99)_10%,rgba(2,6,23,0.9)_45%,rgba(2,6,23,0.72))]" />
      <div
        className={`absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-gradient-to-br ${accent} opacity-25 blur-[140px] animate-pulse-slow`}
      />
      <div
        className={`absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr ${accent} opacity-15 blur-[140px]`}
      />

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(game.path)}
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 backdrop-blur-xl transition-all hover:-translate-x-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          Orqaga
        </button>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* LEFT: Hero */}
          <section className="animate-fade-in-up">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${accent} px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/40 ring-1 ring-white/20`}
            >
              <FaStar className="animate-spin-slow" /> O'yinga tayyorgarlik
            </span>

            <h1 className="mt-6 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-5xl font-black leading-[0.92] tracking-[-0.045em] text-transparent sm:text-6xl lg:text-7xl">
              {game.title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
              {game.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5 text-xs font-bold text-white/70">
              {[game.players, game.time, game.category].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Decorative progress dots */}
            <div className="mt-10 hidden items-center gap-3 lg:flex">
              <div className="h-1 flex-1 rounded-full bg-white/10" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Setup
              </span>
              <div className="h-1 flex-1 rounded-full bg-white/10" />
            </div>
          </section>

          {/* RIGHT: Config panel */}
          <section className="relative animate-fade-in-up [animation-delay:150ms]">
            {/* Glow behind panel */}
            <div
              className={`absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r ${accent} opacity-20 blur-2xl`}
            />

            <div className="relative rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-7 lg:p-8">
              {/* Step header */}
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">
                    1-qadam
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Savollar qiyinligi
                  </h2>
                </div>
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accent} shadow-lg shadow-black/40 ring-1 ring-white/20`}
                >
                  <FaStar />
                </div>
              </div>

              {/* Difficulty cards */}
              <div className="mt-5 grid gap-3">
                {DIFFICULTIES.map((item) => {
                  const selected = difficulty === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDifficulty(item.value)}
                      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
                        selected
                          ? `border-white/30 bg-white/10 ring-2 ${item.ring} shadow-2xl ${item.glow}`
                          : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
                      }`}
                    >
                      {/* Hover shine */}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      {/* Icon */}
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg transition-all ${
                          selected
                            ? `bg-gradient-to-br ${accent} scale-110 shadow-lg`
                            : "bg-white/5 text-white/45 group-hover:bg-white/10 group-hover:text-white/70"
                        }`}
                      >
                        {selected ? (
                          <FaCheck className="animate-pop-in" />
                        ) : (
                          item.icon
                        )}
                      </span>

                      {/* Text */}
                      <span className="min-w-0 flex-1">
                        <b className="block text-lg">{item.label}</b>
                        <small className="text-sm text-white/45">
                          {item.description}
                        </small>
                      </span>

                      {/* Stars */}
                      <span className="flex gap-1">
                        {Array.from({ length: 3 }, (_, index) => (
                          <FaStar
                            key={index}
                            className={`transition-all ${
                              index < item.stars
                                ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.6)]"
                                : "text-white/10"
                            }`}
                          />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Participants */}
              {showsParticipantOptions && (
                <div className="mt-7 animate-fade-in border-t border-white/10 pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <FaUsers className="text-white/45" />
                    <h3 className="font-black">O'yinchilar soni</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {participantOptions.map((option) => {
                      const active = participantCount === option.count;
                      return (
                        <button
                          key={option.count}
                          type="button"
                          onClick={() => setParticipantCount(option.count)}
                          className={`relative overflow-hidden rounded-xl border px-3 py-3 text-sm font-black transition-all duration-300 ${
                            active
                              ? `border-white/30 bg-gradient-to-r ${accent} shadow-lg shadow-black/30`
                              : "border-white/10 bg-white/5 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                          {active && (
                            <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-ping rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info note */}
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-5 text-white/40">
                <span className="mt-0.5 text-white/60">ℹ️</span>
                <p>
                  Teacher savollari mavjud bo'lsa ular ishlatiladi. Aks holda
                  tanlangan qiyinlikdagi tayyor savollar yuklanadi.
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={startGame}
                className={`group relative mt-5 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r ${accent} px-6 py-4 text-base font-black shadow-2xl shadow-black/40 ring-1 ring-white/20 transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)] active:scale-[0.99]`}
              >
                {/* Shine */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                <FaPlay className="transition-transform group-hover:scale-110" />
                <span>O'yinni boshlash</span>
                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Selected summary */}
              <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-white/30">
                {activeDifficulty?.label} ·{" "}
                {showsParticipantOptions
                  ? `${participantCount} o'yinchi`
                  : "Yakka rejim"}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}