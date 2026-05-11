import type { ReactNode } from "react";
import { FaArrowLeft, FaArrowRight, FaGlobe, FaLocationArrow, FaRocket } from "react-icons/fa";
import { primarySolarSystemPlanets, type SolarSystemPlanet } from "./data";
import type { SolarOverviewPerspective, SolarSystemView } from "./hooks/useSolarSystemState";
import type { SolarProgress } from "./lib/solarProgress";
import { PlanetInfoPanel } from "./PlanetInfoPanel";
import type { XRSupportState } from "./lib/xrSupport";

interface SolarSystemUIProps {
  planets: SolarSystemPlanet[];
  overviewPerspective: SolarOverviewPerspective;
  progress: SolarProgress;
  selectedPlanet: SolarSystemPlanet | null;
  support: XRSupportState;
  visitedPrimaryCount: number;
  view: SolarSystemView;
  xrError: string | null;
  isInXRSession: boolean;
  onNextPlanet: () => void;
  onPreviousPlanet: () => void;
  onReturnToSystem: () => void;
  onSetOverviewPerspective: (perspective: SolarOverviewPerspective) => void;
  onSelectPlanet: (planetId: string) => void;
}

export function SolarSystemUI({
  planets,
  overviewPerspective,
  progress,
  selectedPlanet,
  support,
  visitedPrimaryCount,
  view,
  xrError,
  isInXRSession,
  onNextPlanet,
  onPreviousPlanet,
  onReturnToSystem,
  onSetOverviewPerspective,
  onSelectPlanet,
}: SolarSystemUIProps) {
  const lastVisitedPlanet = planets.find((planet) => planet.id === progress.lastVisitedPlanetId) ?? null;
  const isFocusView = view === "focus" && Boolean(selectedPlanet);
  const isOverviewView = view === "overview";
  const isTopOverview = isOverviewView && overviewPerspective === "top";
  const currentTitle = isFocusView && selectedPlanet ? selectedPlanet.nameUz : "Quyosh tizimi";

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-2 sm:p-3 md:p-4 xl:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(2,6,23,0.18),transparent_18%),linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.08)_22%,rgba(2,6,23,0.14)_100%)]" />
      <div className="flex h-full flex-col gap-2 xl:gap-4">
        <div className="pointer-events-auto hidden gap-3 xl:grid xl:grid-cols-4">
          <StatCard label="Ko'rinish" value={isInXRSession ? "VR rejimi" : "Kompyuter rejimi"} />
          <StatCard label="Holat" value={isFocusView ? "Sayyora fokusi" : "Umumiy tizim"} />
          <StatCard label="Rakurs" value={isTopOverview ? "Tepadan ko'rish" : "Kinematik ko'rinish"} />
          <StatCard label="Progress" value={`${visitedPrimaryCount}/${primarySolarSystemPlanets.length} sayyora`} />
        </div>

        <div className="mt-auto grid items-end gap-2 sm:gap-3 lg:grid-cols-[minmax(0,520px)_320px] lg:justify-between xl:grid-cols-[minmax(0,560px)_360px] 2xl:grid-cols-[minmax(0,620px)_380px]">
          <section className="pointer-events-auto self-end rounded-[16px] border border-white/12 bg-[linear-gradient(135deg,rgba(2,6,23,0.74),rgba(15,23,42,0.68))] p-3 text-slate-100 shadow-[0_18px_50px_rgba(2,6,23,0.42)] backdrop-blur-2xl sm:rounded-[22px] sm:p-4 lg:rounded-[24px] lg:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/75 sm:text-[11px] sm:tracking-[0.26em]">
              Koinot bo'ylab sayohat
            </p>
            <h1 className="mt-2 text-xl font-black leading-tight text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.5)] sm:text-2xl">
              {currentTitle}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2 xl:mt-5 xl:gap-3">
              {isFocusView && selectedPlanet ? (
                <>
                  <ActionButton onClick={onPreviousPlanet} secondary>
                    <FaArrowLeft />
                    Oldingi sayyora
                  </ActionButton>
                  <ActionButton onClick={onReturnToSystem}>
                    <FaGlobe />
                    Tizimga qaytish
                  </ActionButton>
                  <ActionButton onClick={onNextPlanet} secondary>
                    Keyingi sayyora
                    <FaArrowRight />
                  </ActionButton>
                </>
              ) : (
                <>
                  <ActionButton
                    onClick={() => onSetOverviewPerspective(overviewPerspective === "top" ? "angled" : "top")}
                    secondary
                  >
                    <FaLocationArrow />
                    {overviewPerspective === "top" ? "Qiya ko'rinish" : "Tepadan ko'rish"}
                  </ActionButton>
                  {lastVisitedPlanet ? (
                    <ActionButton onClick={() => onSelectPlanet(lastVisitedPlanet.id)}>
                      <FaRocket />
                      Yaqinlashish
                    </ActionButton>
                  ) : null}
                  <ActionButton onClick={() => onSelectPlanet("earth")} secondary>
                    <FaGlobe />
                    Yerdan boshlash
                  </ActionButton>
                </>
              )}
            </div>

            {isFocusView && selectedPlanet ? (
              <p className="mt-3 text-xs font-medium leading-5 text-cyan-100/80 sm:mt-4 sm:text-sm">
                Sayyorani ko'rish uchun bosib ushlab torting.
              </p>
            ) : null}

            {support.checked && !support.isVRSupported ? <NoticeCard message="VR hozircha mavjud emas." /> : null}
            <NoticeCard message={xrError} />
          </section>

          <PlanetInfoPanel
            onSelectPlanet={onSelectPlanet}
            planets={planets}
            progress={progress}
            selectedPlanet={selectedPlanet}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.82),rgba(2,6,23,0.72))] p-3 text-slate-100 shadow-[0_20px_48px_rgba(2,6,23,0.46)] backdrop-blur-2xl xl:rounded-[22px] xl:p-4">
      <span className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <strong className="mt-2 block text-sm font-black leading-6 text-white">{value}</strong>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  secondary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      className={
        secondary
          ? "inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
          : "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
      }
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function NoticeCard({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="mt-3 rounded-[16px] border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100 md:mt-4 md:rounded-[20px] md:px-4 md:py-3 md:text-sm md:leading-6">
      {message}
    </div>
  );
}
