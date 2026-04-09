import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaSeedling,
  FaSun,
  FaTint,
} from "react-icons/fa";
import VRScene, { plantVrStore } from "./components/VRScene";
import { useMissionProgress } from "./hooks/useMissionProgress";
import { usePlantState } from "./hooks/usePlantState";
import { useVRInteractions } from "./hooks/useVRInteractions";
import type { FeedbackMessage } from "./types";

export default function PlantVRGame() {
  const {
    addSunlight,
    addWater,
    careCounts,
    feedback,
    improveSoil,
    inspectPlant,
    plantSeed,
    resetPlant,
    seedPlanted,
    stage,
    stats,
  } = usePlantState();
  const [enterVrError, setEnterVrError] = useState<string | null>(null);
  const [activeFeedback, setActiveFeedback] = useState<FeedbackMessage>(feedback);

  const missionState = useMissionProgress({
    careCounts,
    seedPlanted,
    stage,
    stats,
  });

  const interactions = useVRInteractions({
    inspectPlant,
    onAddSunlight: addSunlight,
    onAddWater: addWater,
    onImproveSoil: improveSoil,
    onPlantSeed: plantSeed,
  });

  useEffect(() => {
    if (missionState.missionFeedback) {
      setActiveFeedback(missionState.missionFeedback);
      const timer = window.setTimeout(() => {
        missionState.setMissionFeedback(null);
      }, 2200);

      return () => window.clearTimeout(timer);
    }

    setActiveFeedback(feedback);
  }, [feedback, missionState]);

  const toolInstruction = useMemo(() => {
    if (interactions.selectedToolMeta) {
      return interactions.selectedToolMeta.instruction;
    }

    return "Avval asboblardan birini tanlang.";
  }, [interactions.selectedToolMeta]);

  const currentToolLabel = interactions.selectedToolMeta?.label ?? "Asbob tanlanmagan";
  const currentMissionTitle = missionState.activeMission?.title ?? "Barcha vazifalar bajarildi";
  const currentMissionText =
    missionState.activeMission?.description ?? "O'simlik gullash bosqichiga yetdi.";
  const isMissionCompleteVisible = activeFeedback.tone === "mission";
  const isWarningVisible = activeFeedback.tone === "warning";

  const currentToolMeta = useMemo(() => {
    switch (interactions.selectedTool) {
      case "seed":
        return {
          icon: FaSeedling,
          accent: "from-amber-200 to-lime-200",
          bg: "bg-[rgba(120,88,34,0.22)]",
        };
      case "water":
        return {
          icon: FaTint,
          accent: "from-sky-200 to-cyan-200",
          bg: "bg-[rgba(42,102,134,0.22)]",
        };
      case "sunlight":
        return {
          icon: FaSun,
          accent: "from-yellow-200 to-amber-200",
          bg: "bg-[rgba(138,111,37,0.22)]",
        };
      case "soil":
        return {
          icon: FaLeaf,
          accent: "from-orange-200 to-emerald-200",
          bg: "bg-[rgba(104,75,47,0.22)]",
        };
      default:
        return {
          icon: FaLeaf,
          accent: "from-emerald-200 to-lime-200",
          bg: "bg-[rgba(21,63,48,0.22)]",
        };
    }
  }, [interactions.selectedTool]);

  const CurrentToolIcon = currentToolMeta.icon;

  const enterVr = async () => {
    try {
      setEnterVrError(null);
      await plantVrStore.enterVR();
    } catch {
      setEnterVrError(
        "VR sessiyani ochib bo'lmadi. Meta Quest yoki WebXR qo'llab-quvvatlanadigan brauzerda qayta urinib ko'ring.",
      );
    }
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(247,251,224,0.18),_transparent_25%),linear-gradient(145deg,_#11281e_0%,_#183527_35%,_#214336_68%,_#122219_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(251,236,183,0.24),transparent_18%),radial-gradient(circle_at_85%_12%,rgba(151,220,182,0.22),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(126,194,255,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-[22rem] bg-[radial-gradient(circle_at_center,rgba(253,249,214,0.14),transparent_60%)]" />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <div className="flex-1">
          <div className="relative h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,rgba(223,243,229,0.08),rgba(205,232,219,0.03))]">
            <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col gap-3 px-4 md:top-5 md:px-5">
              <div className="flex items-start justify-end">
                <div className="pointer-events-auto flex max-w-xs flex-col items-end gap-2">
                  <button
                    className="rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200 px-5 py-3 text-sm font-semibold text-[#183022] shadow-[0_12px_35px_rgba(189,242,162,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"
                    onClick={enterVr}
                    type="button"
                  >
                    VR ga Kirish
                  </button>
                  {enterVrError ? (
                    <p className="rounded-2xl border border-amber-200/20 bg-[rgba(92,63,17,0.78)] px-4 py-2 text-right text-xs leading-5 text-amber-100 shadow-[0_12px_32px_rgba(49,35,11,0.22)] backdrop-blur-lg">
                      {enterVrError}
                    </p>
                  ) : null}
                </div>
              </div>

              {isMissionCompleteVisible ? (
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full border border-emerald-100/20 bg-[linear-gradient(135deg,rgba(62,134,85,0.95),rgba(120,191,135,0.92))] px-5 py-3 text-white shadow-[0_18px_42px_rgba(35,98,58,0.24)]">
                    <FaCheckCircle className="text-xl" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-50/80">
                        Bajarildi
                      </p>
                      <p className="text-base font-semibold">{activeFeedback.title}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isWarningVisible ? (
                <div className="flex justify-center">
                  <div className="inline-flex max-w-[34rem] items-center gap-3 rounded-[20px] border border-red-200/20 bg-[linear-gradient(135deg,rgba(117,34,34,0.95),rgba(165,58,58,0.92))] px-4 py-3 text-white shadow-[0_18px_42px_rgba(94,29,29,0.24)]">
                    <FaExclamationTriangle className="shrink-0 text-xl text-red-100" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-50/80">
                        Diqqat
                      </p>
                      <p className="text-base font-semibold">{activeFeedback.title}</p>
                      <p className="mt-1 text-sm leading-6 text-red-50/90">{activeFeedback.body}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div className="max-w-[18rem] rounded-[20px] border border-white/14 bg-[rgba(10,42,32,0.72)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(5,24,17,0.18)] backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-100/70">
                    Vazifa
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">{currentMissionTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-50/85">{currentMissionText}</p>
                </div>

                <div
                  className={`inline-flex items-center gap-3 rounded-full border border-white/14 ${currentToolMeta.bg} px-4 py-3 text-white shadow-[0_16px_32px_rgba(5,24,17,0.18)] backdrop-blur-xl`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${currentToolMeta.accent} text-[#183022]`}
                  >
                    <CurrentToolIcon className="text-base" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-100/70">
                      Asbob
                    </p>
                    <p className="text-sm font-semibold text-white">{currentToolLabel}</p>
                    <p className="text-xs text-emerald-50/80">{toolInstruction}</p>
                  </div>
                </div>
              </div>
            </div>
            <Canvas camera={{ fov: 50, position: [0, 1.7, 3.2] }} shadows>
              <Suspense fallback={null}>
                <VRScene
                  feedback={activeFeedback}
                  missions={missionState.missions}
                  onPotActivate={interactions.applySelectedToolToPot}
                  onSelectTool={interactions.activateTool}
                  recentEffectType={interactions.recentEffect?.type ?? null}
                  seedPlanted={seedPlanted}
                  selectedTool={interactions.selectedTool}
                  stage={stage}
                  stats={stats}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <button
          className="absolute bottom-6 right-6 z-20 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_32px_rgba(6,22,17,0.24)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/16"
          onClick={resetPlant}
          type="button"
        >
          Qayta Boshlash
        </button>
      </div>
    </section>
  );
}
