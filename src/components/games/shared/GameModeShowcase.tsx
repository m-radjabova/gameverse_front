import { FaCheckCircle, FaLayerGroup, FaTrophy, FaUsers } from "react-icons/fa";
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
  const shouldHideLeaderboard = DIRECT_PLAY_GAME_PATHS.has(game.path);

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
  const lastSelectedLabel = session
    ? `${session.participantCount} ${session.participantLabel} tanlangan`
    : "Hali rejim tanlanmagan";

  return (
    <div className={`${compact ? "mt-4" : "mt-6"} space-y-4`}>
      <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.16)] backdrop-blur-md md:p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-white/45">
              O'yin konfiguratsiyasi
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Rejim va leaderboard
            </h3>
            <p className="mt-1 text-sm text-white/55">
              Oxirgi tanlangan rejim saqlanadi va shu o'yin uchun natijalar quyida ko'rsatiladi.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-black/15 px-4 py-2 text-sm font-bold text-white/75">
            {lastSelectedLabel}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
                <FaUsers />
              </div>
              {session ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300">
                  <FaCheckCircle className="text-[10px]" />
                  Aktiv
                </span>
              ) : null}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
              Tanlangan rejim
            </p>
            <p className="mt-2 text-xl font-black text-white">{currentMode}</p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              O'yin boshlanishidan oldin rejimni bemalol almashtirishingiz mumkin.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClassName} opacity-[0.07]`} />
            <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/10">
              <FaLayerGroup />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
              Data konfiguratsiya
            </p>
            <p className="mt-2 text-xl font-black text-white">{game.players}</p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              `data.tsx` dagi o'yinchi yoki jamoa diapazoni asosida avtomatik ishlaydi.
            </p>
          </div>

          {!shouldHideLeaderboard ? (
            <div className="group relative overflow-hidden rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm transition-transform hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-transparent opacity-70" />
              <div className="relative mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-300/15">
                  <FaTrophy />
                </div>
                <span className="rounded-full border border-yellow-300/15 bg-yellow-500/10 px-3 py-1 text-[11px] font-bold text-yellow-200/80">
                  Leaderboard
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
                Reyting salohiyati
              </p>
              <p className="mt-2 text-xl font-black text-white">{game.points}</p>
              <p className="mt-2 text-xs leading-5 text-white/55">
                O'yinlar kesimida natijalar leaderboardda saqlanadi va quyida ko'rinadi.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {!shouldHideLeaderboard ? (
        <GameLeaderboardPanel gameKey={game.id} title={`${game.title} Reytingi`} />
      ) : null}
    </div>
  );
}
