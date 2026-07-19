import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaPlay, FaUsers } from "react-icons/fa";
import useContextPro from "../../../hooks/useContextPro";
import {
  buildParticipantOptions,
  saveGameSessionConfig,
} from "../../../hooks/gameSession";
import { gameCards } from "../../../pages/games/data";
import { DIRECT_PLAY_GAME_PATHS } from "./directPlayGames";
import GameModeShowcase from "./GameModeShowcase";

type GamePagePlayButtonProps = {
  to: string;
  colorClassName: string;
  className?: string;
  modeSelectionEnabled?: boolean;
  showGameModeShowcase?: boolean;
};

export default function GamePagePlayButton({
  to,
  colorClassName,
  className = "",
  modeSelectionEnabled = false,
  showGameModeShowcase = true,
}: GamePagePlayButtonProps) {
  const navigate = useNavigate();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const {
    state: { user },
  } = useContextPro();

  const game = useMemo(
    () => gameCards.find((item) => item.path === to.replace(/\/play$/, "")),
    [to]
  );
  const gamePath = game?.path ?? to.replace(/\/play$/, "");
  const shouldBypassModeSelection = DIRECT_PLAY_GAME_PATHS.has(gamePath);
  const usesQuestionBank = Boolean(game && QUESTION_BANK_GAME_IDS.has(game.id));

  const participantOptions = useMemo(
    () => (game ? buildParticipantOptions(game.players) : []),
    [game]
  );
  const showsParticipantOptions = Boolean(
    modeSelectionEnabled && !shouldBypassModeSelection && participantOptions.length > 1,
  );

  const handleNavigate = (count?: number) => {
    if (game && count) {
      const option = participantOptions.find((item) => item.count === count);

      if (option) {
        saveGameSessionConfig({
          gameId: game.id,
          participantCount: option.count,
          participantType: option.participantType,
          participantLabel: option.participantLabel,
          participantLabels: Array.from({ length: option.count }, (_, index) => {
            if (option.count === 1) {
              return user?.username?.trim() || "O'YINCHI 1";
            }

            return `${option.participantLabel.toUpperCase()} ${index + 1}`;
          }),
          questionDifficulty: "easy",
          selectedAt: new Date().toISOString(),
        });
      }
    }

    setIsSelectorOpen(false);
    navigate(to);
  };

  const handleClick = () => {
    if (game?.id === "memory-chain") {
      navigate(`/games/${game.id}/mode-setup`);
      return;
    }
    if (game && usesQuestionBank) {
      navigate(`/games/${game.id}/setup`);
      return;
    }

    if (
      (shouldBypassModeSelection && !usesQuestionBank) ||
      (!modeSelectionEnabled && !usesQuestionBank) ||
      !game ||
      (participantOptions.length <= 1 && !usesQuestionBank)
    ) {
      handleNavigate(participantOptions[0]?.count);
      return;
    }

    setIsSelectorOpen(true);
  };

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={handleClick}
        className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${colorClassName} px-6 py-4 text-sm font-black text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:min-w-[260px]`}
        >
          <FaPlay className="text-sm" />
          <span>O'yinni boshlash</span>
          <FaArrowRight className="text-sm" />
        </button>

        {showGameModeShowcase && game && (
          <GameModeShowcase
            gamePath={game.path}
            colorClassName={colorClassName}
            compact
          />
        )}
      </div>

      {isSelectorOpen && game && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-950/95 p-6 text-white shadow-2xl sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${colorClassName}`}><FaUsers className="text-xl" /></div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">
                  Boshlashdan oldin
                </p>
                <h3 className="text-2xl font-black">{game.title}</h3>
                <p className="mt-1 text-sm text-white/65">Rejimni tanlang va o'yinni boshlang.</p>
              </div>
            </div>

            {showsParticipantOptions && <div className="mb-3 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">O'yin rejimi</p><span className="text-xs text-white/40">1 qadam</span></div>}
            <div className="grid gap-3">
              {showsParticipantOptions && participantOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleNavigate(option.count)}
                  className={`group flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${option.count === 1 ? "border-sky-400/30 bg-sky-500/10 hover:border-sky-300/60 hover:bg-sky-500/20" : "border-violet-400/30 bg-violet-500/10 hover:border-violet-300/60 hover:bg-violet-500/20"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-black text-white">{option.count}</span>
                    <div>
                    <p className="text-lg font-black">{option.label}</p>
                    <p className="text-sm text-white/60">
                      {option.count === 1
                        ? "Yakka tartibda o'ynash"
                        : "Jamoaviy o'ynash"}
                    </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white/80 transition group-hover:bg-white/20 group-hover:text-white"><FaPlay className="text-[10px]" /> Boshlash <FaArrowRight className="text-xs" /></span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsSelectorOpen(false)}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white/80 transition-all hover:bg-white/10"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const QUESTION_BANK_GAME_IDS = new Set([
  "quiz-battle", "classic-arcade", "wheel-of-fortune", "math-race",
  "math-chick", "tug-of-war", "baamboozle", "jumanji", "millionaire",
  "truth-detector", "treasure-hunt", "reverse-thinking",
  "pizza-master", "mystery-egg",
  "bingo",
]);
