import { createXRStore } from "@react-three/xr";
import { useEffect, useState } from "react";
import { FaRocket, FaVrCardboard } from "react-icons/fa";
import { useSolarSystemState } from "./hooks/useSolarSystemState";
import { SolarSystemScene } from "./SolarSystemScene";
import { SolarSystemUI } from "./SolarSystemUI";
import { detectXRSupport, getInitialXRSupport } from "./lib/xrSupport";
import { writeLastPlayedGame } from "../../../utils/gameHistory";

export default function SolarSystemGame() {
  const solarSystem = useSolarSystemState();
  const { markSessionActive } = solarSystem;
  const [xrStore] = useState(() =>
    createXRStore({
      emulate: false,
      offerSession: false,
    }),
  );
  const [xrSupport, setXrSupport] = useState(() => getInitialXRSupport());
  const [xrError, setXrError] = useState<string | null>(null);
  const [isInXRSession, setIsInXRSession] = useState(false);

  useEffect(() => {
    let isMounted = true;

    writeLastPlayedGame("vr-solar-system");
    markSessionActive();

    void detectXRSupport().then((nextSupport) => {
      if (isMounted) {
        setXrSupport(nextSupport);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [markSessionActive]);

  useEffect(() => {
    if (isInXRSession) {
      setXrError(null);
    }
  }, [isInXRSession]);

  async function enterVr() {
    try {
      setXrError(null);
      await xrStore.enterVR();
    } catch {
      setXrError("VR sessiyasini ochib bo'lmadi. WebXR qo'llovchi brauzer yoki Meta Quest bilan urinib ko'ring.");
    }
  }

  return (
    <section className="relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.55),_transparent_28%),linear-gradient(135deg,_#02040a_0%,_#050b17_42%,_#010206_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(34,211,238,0.15),transparent_16%),radial-gradient(circle_at_84%_10%,rgba(56,189,248,0.12),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,0.08),transparent_28%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto rounded-full border border-white/12 bg-slate-950/85 px-4 py-2 text-xs font-bold text-white shadow-[0_16px_40px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
          <span className="inline-flex items-center gap-2">
            <FaRocket className="text-cyan-300" />
            Koinot sayohati: Quyosh tizimi
          </span>
        </div>

        <button
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,0.34)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={xrSupport.checked && !xrSupport.isVRSupported}
          onClick={enterVr}
          type="button"
        >
          <FaVrCardboard />
          VR rejimiga kirish
        </button>
      </div>

      <div className="relative h-[100dvh] min-h-[100dvh]">
        <SolarSystemScene
          onSelectPlanet={solarSystem.selectPlanet}
          onSessionStateChange={setIsInXRSession}
          overviewPerspective={solarSystem.overviewPerspective}
          planets={solarSystem.planets}
          selectedPlanet={solarSystem.selectedPlanet}
          selectedPlanetId={solarSystem.selectedPlanetId}
          store={xrStore}
          view={solarSystem.view}
          visitedPlanetIds={solarSystem.visitedPlanetIds}
        />

        <SolarSystemUI
          isInXRSession={isInXRSession}
          onNextPlanet={solarSystem.goToNextPlanet}
          onPreviousPlanet={solarSystem.goToPreviousPlanet}
          onReturnToSystem={solarSystem.returnToSystem}
          onSetOverviewPerspective={solarSystem.setOverviewPerspective}
          onSelectPlanet={solarSystem.selectPlanet}
          overviewPerspective={solarSystem.overviewPerspective}
          planets={solarSystem.planets}
          progress={solarSystem.progress}
          selectedPlanet={solarSystem.selectedPlanet}
          support={xrSupport}
          view={solarSystem.view}
          visitedPrimaryCount={solarSystem.visitedPrimaryCount}
          xrError={xrError}
        />
      </div>
    </section>
  );
}
