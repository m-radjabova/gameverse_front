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

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 sm:p-4 md:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(2,6,23,0.18),transparent_18%),linear-gradient(180deg,rgba(2,6,23,0.22)_0%,rgba(2,6,23,0.08)_22%,rgba(2,6,23,0.14)_100%)]" />
      <div className="flex h-full flex-col gap-4">
        <div className="pointer-events-auto grid gap-3 xl:grid-cols-5">
          <StatCard label="Ko'rinish" value={isInXRSession ? "VR rejimi" : "Kompyuter rejimi"} />
          <StatCard label="Holat" value={isFocusView ? "Sayyora fokusi" : "Umumiy tizim"} />
          <StatCard label="Rakurs" value={isTopOverview ? "Tepadan ko'rish" : "Kinematik ko'rinish"} />
          <StatCard label="Progress" value={`${visitedPrimaryCount}/${primarySolarSystemPlanets.length} sayyora`} />
          <StatCard label="So'nggi o'rganilgan" value={lastVisitedPlanet?.nameUz ?? "Hali tanlanmagan"} />
        </div>

        <div className="mt-auto grid items-end gap-4 lg:grid-cols-[minmax(0,820px)_360px] lg:justify-between xl:grid-cols-[minmax(0,860px)_420px]">
          <section className="pointer-events-auto self-end rounded-[28px] border border-white/12 bg-[linear-gradient(135deg,rgba(2,6,23,0.78),rgba(15,23,42,0.72))] p-5 text-slate-100 shadow-[0_24px_70px_rgba(2,6,23,0.52)] backdrop-blur-2xl md:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-cyan-200/75">
              Koinot bo'ylab sayohat
            </p>
            <h1 className="mt-3 text-2xl font-black leading-tight text-white [text-shadow:0_10px_30px_rgba(0,0,0,0.5)] md:text-3xl">
              {isFocusView && selectedPlanet ? selectedPlanet.nameUz : "Koinot sayohati: Quyosh tizimi"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
              {isFocusView && selectedPlanet
                ? `${selectedPlanet.nameUz} fokusda. Sayyora sekin aylanadi, kamera yaqinlashadi va asosiy ilmiy faktlar qisqa, toza ko'rinishda chiqadi.`
                : "Siqilgan masofalar va ishonarli o'lchamlar yordamida butun Quyosh tizimi bir qarashda tushunarli bo'ladi. Sichqoncha bilan aylantiring, zoom qiling va sayyorani bosib yaqinlashing."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
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

            {isFocusView ? (
              <CompactHelperStrip />
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <HelperTile
                  title="Desktop yordam"
                  body="Sichqoncha bilan aylantiring, g'ildirak bilan yaqinlashing va sayyorani bosib fokusga o'ting."
                />
                <HelperTile
                  title="VR yordam"
                  body="Kontroller yoki qarash bilan sayyorani tanlang. XR mavjud bo'lmasa, kompyuter rejimi saqlanadi."
                />
              </div>
            )}

            {support.checked && !support.isVRSupported ? <NoticeCard message={support.message} /> : null}
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
    <div className="rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(2,6,23,0.82),rgba(2,6,23,0.72))] p-4 text-slate-100 shadow-[0_20px_48px_rgba(2,6,23,0.46)] backdrop-blur-2xl">
      <span className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <strong className="mt-2 block text-sm font-black leading-6 text-white">{value}</strong>
    </div>
  );
}

function HelperTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-4">
      <strong className="text-sm font-black text-slate-100">{title}</strong>
      <p className="mt-2 text-sm leading-6 text-slate-200">{body}</p>
    </div>
  );
}

function CompactHelperStrip() {
  return (
    <div className="mt-5 rounded-[22px] border border-cyan-300/12 bg-cyan-300/[0.06] px-4 py-3 text-sm leading-6 text-slate-100">
      Sichqoncha bilan sahnani aylantiring, g'ildirak bilan masofani sozlang va boshqa sayyoraga o'tish uchun pastdagi tugmalardan foydalaning.
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
          ? "inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          : "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110"
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
    <div className="mt-4 rounded-[20px] border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
      {message}
    </div>
  );
}
