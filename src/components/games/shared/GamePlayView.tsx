import type { ReactNode } from "react";
import { FaArrowLeft, FaClock, FaGamepad, FaUsers } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { gameCards } from "../../../pages/games/data";
import { getGameSessionConfig } from "../../../hooks/gameSession";
import { ReactBitsPageEnter } from "./ReactBitsMotion";

type GamePlayViewProps = {
  colorClassName: string;
  children: ReactNode;
};

type GameLayoutContext = {
  requestGameExit: (onConfirm: () => void) => void;
};

export default function GamePlayView({ colorClassName, children }: GamePlayViewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestGameExit } = useOutletContext<GameLayoutContext>();
  const [, setSessionVersion] = useState(0);

  useEffect(() => {
    const updateSession = () => setSessionVersion((version) => version + 1);
    window.addEventListener("game-session-updated", updateSession);
    return () => window.removeEventListener("game-session-updated", updateSession);
  }, []);
  const isPlantVrRoute =
    location.pathname === "/games/plant-vr" || location.pathname === "/games/plant-vr/play";
  const isVirtualZooRoute =
    location.pathname === "/games/virtual-zoo-vr" || location.pathname === "/games/virtual-zoo-vr/play";
  const isWorldExplorerRoute =
    location.pathname === "/games/world-explorer" || location.pathname === "/games/world-explorer/play";
  const isPizzaMasterRoute =
    location.pathname === "/games/pizza-master" || location.pathname === "/games/pizza-master/play";
  const isFullBleedGameRoute =
    isPlantVrRoute ||
    isVirtualZooRoute ||
    isWorldExplorerRoute ||
    isPizzaMasterRoute ||
    location.pathname === "/games/vr-solar-system/play" ||
    location.pathname === "/games/quyosh-tizimi-vr/play";
  const game = gameCards.find(
    (item) => `${item.path}/play` === location.pathname || item.path === location.pathname
  );
  const session = game ? getGameSessionConfig(game.id) : null;

  if (isFullBleedGameRoute) return <>{children}</>;

  const goBack = () => requestGameExit(() => navigate(game?.path || "/games"));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-3 py-3 text-white sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className={`pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rotate-45 border-l border-b bg-gradient-to-br ${colorClassName} opacity-[0.09]`} />
      <div className={`pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rotate-12 border border-dashed bg-gradient-to-tr ${colorClassName} opacity-[0.07]`} />

      <ReactBitsPageEnter className="relative mx-auto w-full max-w-[1720px]">
        {game ? (
          <header className="mb-4 flex min-h-16 flex-wrap items-center gap-3 border-b border-white/10 pb-4 sm:mb-5 sm:flex-nowrap sm:gap-4 sm:pb-5">
            <button
              type="button"
              onClick={goBack}
              title="O'yin sahifasiga qaytish"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] text-white/80 transition hover:border-white/30 hover:bg-white/[0.1] hover:text-white md:hidden"
              aria-label="O'yin sahifasiga qaytish"
            >
              <FaArrowLeft />
            </button>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colorClassName} shadow-lg shadow-black/20`}>
              <FaGamepad className="text-lg" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">O'yin maydoni</p>
              <h1 className="truncate text-base font-black text-white sm:text-xl">{game.title}</h1>
            </div>

            <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:w-auto sm:gap-3">
              <span className="inline-flex min-w-0 items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70">
                <FaUsers className="shrink-0 text-white/45" />
                <span className="truncate">{session ? `${session.participantCount} ${session.participantLabel}` : game.players}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/70">
                <FaClock className="text-white/45" />
                {game.time}
              </span>
            </div>
          </header>
        ) : null}

        <section className="relative">
          <div className={`pointer-events-none absolute -left-1 -top-1 h-9 w-9 border-l-2 border-t-2 ${colorClassName.includes("yellow") || colorClassName.includes("orange") ? "border-amber-300" : "border-cyan-300"} opacity-70`} />
          <div className="pointer-events-none absolute -bottom-1 -right-1 h-9 w-9 border-b-2 border-r-2 border-white/30" />
          <div className="relative py-2 sm:py-3">{children}</div>
        </section>
      </ReactBitsPageEnter>
    </main>
  );
}
