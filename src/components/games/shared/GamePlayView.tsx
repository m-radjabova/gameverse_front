import { Link } from "react-router-dom";
import { FaArrowLeft, FaPlay } from "react-icons/fa";
import type { IconType } from "react-icons";
// import GameFeedbackPanel from "./GameFeedbackPanel";
import type { ReactNode } from "react";

type GamePlayViewProps = {
  title: string;
  subtitle: string;
  gameKey: string;
  backTo: string;
  icon: IconType;
  colorClassName: string;
  children: ReactNode;
};

export default function GamePlayView({
  title,
  subtitle,
  // gameKey,
  backTo,
  icon: Icon,
  colorClassName,
  children,
}: GamePlayViewProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-6 md:px-6 md:py-8">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${colorClassName} opacity-15`} />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/12 bg-white/5 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${colorClassName} text-white shadow-xl`}>
              <Icon className="text-2xl" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/70">
                <FaPlay className="text-[10px]" />
                Play mode
              </div>
              <h1 className="mt-3 text-2xl font-black text-white md:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-white/70">{subtitle}</p>
            </div>
          </div>

          <Link
            to={backTo}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-black/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-black/25"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClassName} opacity-20 transition-opacity group-hover:opacity-30`} />
            <FaArrowLeft className="relative text-xs" />
            <span className="relative">Orqaga</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-white/12 bg-white/5 p-4 backdrop-blur-xl md:p-6">
          {/* <GameFeedbackPanel gameKey={gameKey} /> */}
          {children}
        </div>
      </div>
    </div>
  );
}
