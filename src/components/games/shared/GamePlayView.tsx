import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ReactBitsPageEnter } from "./ReactBitsMotion";

type GamePlayViewProps = {
  colorClassName: string;
  children: ReactNode;
};

export default function GamePlayView({ colorClassName, children }: GamePlayViewProps) {
  const location = useLocation();
  const isPlantVrRoute =
    location.pathname === "/games/plant-vr" || location.pathname === "/games/plant-vr/play";
  const isVirtualZooRoute =
    location.pathname === "/games/virtual-zoo-vr" || location.pathname === "/games/virtual-zoo-vr/play";
  const isWorldExplorerRoute =
    location.pathname === "/games/world-explorer" || location.pathname === "/games/world-explorer/play";
  const isPizzaMasterRoute =
    location.pathname === "/games/pizza-master" || location.pathname === "/games/pizza-master/play";
  const isMysteryEggRoute =
    location.pathname === "/games/mystery-egg" || location.pathname === "/games/mystery-egg/play";
  const isWheelOfFortuneRoute =
    location.pathname === "/games/wheel-of-fortune" || location.pathname === "/games/wheel-of-fortune/play";
  const isFullBleedGameRoute =
    isPlantVrRoute ||
    isVirtualZooRoute ||
    isWorldExplorerRoute ||
    isPizzaMasterRoute ||
    isMysteryEggRoute ||
    isWheelOfFortuneRoute ||
    location.pathname === "/games/vr-solar-system/play" ||
    location.pathname === "/games/quyosh-tizimi-vr/play";

  // Full-bleed games own their visual language, but must still occupy the
  // complete viewport.  This avoids the page background appearing below a
  // game on taller screens without imposing a fixed height (and clipping
  // content) on any game.
  if (isFullBleedGameRoute) {
    return <div className="game-fullbleed">{children}</div>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] px-3 py-3 text-white sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className={`pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rotate-45 border-l border-b bg-gradient-to-br ${colorClassName} opacity-[0.09]`} />
      <div className={`pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rotate-12 border border-dashed bg-gradient-to-tr ${colorClassName} opacity-[0.07]`} />

      <ReactBitsPageEnter className="relative mx-auto w-full max-w-[1720px]">
        <section className="relative">
          <div className="relative py-2 sm:py-3">{children}</div>
        </section>
      </ReactBitsPageEnter>
    </main>
  );
}
