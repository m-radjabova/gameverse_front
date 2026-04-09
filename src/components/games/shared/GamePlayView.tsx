import type { ReactNode } from "react";
import { FaSlidersH } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { gameCards } from "../../../pages/games/data";
import { getGameSessionConfig } from "../../../hooks/gameSession";

type GamePlayViewProps = {
  colorClassName: string;
  children: ReactNode;
};

export default function GamePlayView({
  colorClassName,
  children,
}: GamePlayViewProps) {
  const location = useLocation();
  const isPlantVrRoute =
    location.pathname === "/games/plant-vr" || location.pathname === "/games/plant-vr/play";
  const isVirtualZooRoute =
    location.pathname === "/games/virtual-zoo-vr" || location.pathname === "/games/virtual-zoo-vr/play";
  const isWorldExplorerRoute =
    location.pathname === "/games/world-explorer" || location.pathname === "/games/world-explorer/play";
  const isFullBleedGameRoute =
    isPlantVrRoute ||
    isVirtualZooRoute ||
    isWorldExplorerRoute ||
    location.pathname === "/games/vr-solar-system" ||
    location.pathname === "/games/quyosh-tizimi-vr";
  const game = gameCards.find(
    (item) => `${item.path}/play` === location.pathname || item.path === location.pathname
  );
  const session = game ? getGameSessionConfig(game.id) : null;

  if (isFullBleedGameRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-8">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${colorClassName} opacity-15`} />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[440px] flex-col sm:max-w-3xl md:min-h-[calc(100vh-4rem)] md:max-w-[1600px]">
        {game && (
          <div className="mb-3 rounded-[28px] border border-white/12 bg-white/6 p-4 backdrop-blur-xl md:mb-4 md:rounded-3xl md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/45">
                  Tanlangan o'yin
                </p>
                <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  {game.title}
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  {session
                    ? `${session.participantCount} ${session.participantLabel} · ${game.time}`
                    : `${game.players} · ${game.time}`}
                </p>
              </div>

              <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white/80 sm:w-auto">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r ${colorClassName}`}
                >
                  <FaSlidersH className="text-sm text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">
                    Rejim
                  </p>
                  <p className="text-sm font-bold text-white">
                    {session ? `${session.participantCount} ${session.participantLabel}` : game.players}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="rounded-[28px] border border-white/12 bg-white/5 p-3 backdrop-blur-xl sm:p-4 md:rounded-3xl md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
