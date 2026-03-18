import { FaLayerGroup, FaTrophy, FaUsers } from "react-icons/fa";
import { getGameSessionConfig } from "../../../hooks/gameSession";
import { gameCards } from "../../../pages/games/data";
import { DIRECT_PLAY_GAME_PATHS } from "./directPlayGames";
import GameLeaderboardPanel from "./GameLeaderboardPanel";

type Props = {
  gamePath: string;
  colorClassName: string;
  compact?: boolean;
};

export default function GameModeShowcase({
  gamePath,
  colorClassName,
  compact = false,
}: Props) {
  const game = gameCards.find((item) => item.path === gamePath);

  if (!game) {
    return null;
  }

  const session = getGameSessionConfig(game.id);
  const shouldHideLeaderboard =
    DIRECT_PLAY_GAME_PATHS.has(game.path) ||
    (session?.participantCount ?? 1) > 1;

  if (compact) {
    return (
      <div className="mt-4">
        {!shouldHideLeaderboard ? (
          <GameLeaderboardPanel
            gameKey={game.id}
            title={`${game.title} Reytingi`}
            limit={100}
          />
        ) : null}
      </div>
    );
  }

  const currentMode = session
    ? `${session.participantCount} ${session.participantLabel}`
    : game.players;

  return (
    <div className={`${compact ? "mt-4" : "mt-6"} space-y-4`}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/12 bg-black/25 p-4 backdrop-blur-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            <FaUsers />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
            Tanlangan rejim
          </p>
          <p className="mt-2 text-lg font-black text-white">{currentMode}</p>
          <p className="mt-1 text-xs text-white/55">
            O'yin boshlanishidan oldin rejimni almashtirish mumkin.
          </p>
        </div>

        <div className="rounded-2xl border border-white/12 bg-black/25 p-4 backdrop-blur-sm">
          <div
            className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r ${colorClassName} text-white`}
          >
            <FaLayerGroup />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
            Data konfiguratsiya
          </p>
          <p className="mt-2 text-lg font-black text-white">{game.players}</p>
          <p className="mt-1 text-xs text-white/55">
            `data.tsx` dagi player/jamoa diapazoni asosida.
          </p>
        </div>

        {!shouldHideLeaderboard ? (
          <div className="rounded-2xl border border-white/12 bg-black/25 p-4 backdrop-blur-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-300">
              <FaTrophy />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
              Reyting
            </p>
            <p className="mt-2 text-lg font-black text-white">{game.points}</p>
            <p className="mt-1 text-xs text-white/55">
              O'yinlar kesimida natijalar leaderboard’da chiqadi.
            </p>
          </div>
        ) : null}
      </div>

      {!shouldHideLeaderboard ? (
        <GameLeaderboardPanel gameKey={game.id} title={`${game.title} Reytingi`} />
      ) : null}
    </div>
  );
}
