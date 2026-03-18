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
};

export default function GamePagePlayButton({
  to,
  colorClassName,
  className = "",
  modeSelectionEnabled = false,
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

  const participantOptions = useMemo(
    () => (game ? buildParticipantOptions(game.players) : []),
    [game]
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
          selectedAt: new Date().toISOString(),
        });
      }
    }

    setIsSelectorOpen(false);
    navigate(to);
  };

  const handleClick = () => {
    if (
      shouldBypassModeSelection ||
      !modeSelectionEnabled ||
      !game ||
      participantOptions.length <= 1
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

        {game && (
          <GameModeShowcase
            gamePath={game.path}
            colorClassName={colorClassName}
            compact
          />
        )}
      </div>

      {isSelectorOpen && game && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-2xl">
            <div className="mb-6 flex items-start gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${colorClassName}`}>
                <FaUsers className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">
                  Boshlashdan oldin
                </p>
                <h3 className="text-2xl font-black">{game.title}</h3>
                <p className="mt-1 text-sm text-white/65">
                  O'yin nechta {participantOptions[0]?.participantLabel ?? "ishtirokchi"} bilan boshlanishini tanlang.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {participantOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleNavigate(option.count)}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:scale-[1.01] hover:border-white/25 hover:bg-white/10"
                >
                  <div>
                    <p className="text-lg font-black">{option.label}</p>
                    <p className="text-sm text-white/60">
                      {option.count === 1
                        ? "Yakka tartibda o'ynash"
                        : "Jamoaviy o'ynash"}
                    </p>
                  </div>
                  <FaArrowRight className="text-white/60" />
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
