import { Canvas } from "@react-three/fiber";
import { createXRStore } from "@react-three/xr";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaBookOpen, FaMoon, FaRedoAlt, FaSun, FaVolumeUp, FaVrCardboard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { zooAnimals } from "./data/animals";
import ZooScene from "./components/ZooScene";
import { useAnimalDiscovery } from "./hooks/useAnimalDiscovery";
import zooMusicTrack from "./music/zoo.m4a";
import type { DiscoveryMission, ZooSceneMode } from "./types";
import { writeLastPlayedGame } from "../../../utils/gameHistory";

function playAnimalCue(animalId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const AudioContextClass =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const frequencyMap: Record<string, [number, number]> = {
    lion: [180, 92],
    elephant: [110, 62],
    monkey: [320, 540],
    giraffe: [260, 180],
    zebra: [220, 340],
  };

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const oscillatorTwo = context.createOscillator();
  const gainNode = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = animalId === "lion" ? "sawtooth" : animalId === "elephant" ? "square" : "triangle";
  oscillatorTwo.type = "sine";
  oscillator.frequency.value = frequencyMap[animalId]?.[0] ?? 220;
  oscillatorTwo.frequency.value = frequencyMap[animalId]?.[1] ?? 330;
  filter.type = animalId === "elephant" ? "lowpass" : "bandpass";
  filter.frequency.value = animalId === "lion" ? 420 : animalId === "elephant" ? 180 : 680;
  gainNode.gain.value = 0.0001;

  oscillator.connect(filter);
  oscillatorTwo.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(context.destination);

  const now = context.currentTime;
  gainNode.gain.exponentialRampToValueAtTime(0.04, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

  oscillator.start(now);
  oscillatorTwo.start(now + 0.01);
  oscillator.stop(now + 0.55);
  oscillatorTwo.stop(now + 0.48);
  void oscillator.addEventListener("ended", () => {
    void context.close();
  });
}

export default function VirtualZoo() {
  const navigate = useNavigate();
  const [xrStore] = useState(() =>
    createXRStore({
      emulate: false,
      offerSession: false,
    }),
  );
  const {
    discoveredAnimalIds,
    discoverAnimal,
    lastDiscoveredAnimalId,
    resetDiscovery,
  } = useAnimalDiscovery();
  const [xrError, setXrError] = useState<string | null>(null);
  const [sceneMode, setSceneMode] = useState<ZooSceneMode>("day");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastCueRef = useRef<string | null>(null);
  const ambientCleanupRef = useRef<(() => void) | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  function stopZooMusic() {
    if (!musicRef.current) {
      return;
    }

    musicRef.current.pause();
    musicRef.current.currentTime = 0;
  }

  useEffect(() => {
    writeLastPlayedGame("virtual-zoo-vr");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const audio = new Audio(zooMusicTrack);
    audio.loop = true;
    audio.volume = 0.26;
    audio.preload = "auto";
    musicRef.current = audio;

    const tryPlay = () => {
      void audio.play().catch(() => {
        const resumePlayback = () => {
          void audio.play().catch(() => undefined);
          window.removeEventListener("pointerdown", resumePlayback);
        };

        window.addEventListener("pointerdown", resumePlayback, { once: true });
      });
    };

    if (soundEnabled) {
      tryPlay();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = musicRef.current;

    if (!audio) {
      return;
    }

    if (soundEnabled) {
      void audio.play().catch(() => undefined);
      return;
    }

    audio.pause();
  }, [soundEnabled]);

  useEffect(() => {
    if (!lastDiscoveredAnimalId || lastCueRef.current === lastDiscoveredAnimalId) {
      return;
    }

    lastCueRef.current = lastDiscoveredAnimalId;
    if (soundEnabled) {
      playAnimalCue(lastDiscoveredAnimalId);
    }
  }, [lastDiscoveredAnimalId, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled) {
      ambientCleanupRef.current?.();
      ambientCleanupRef.current = null;
      return;
    }

    const AudioContextClass =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const pad = context.createOscillator();
    const birds = context.createOscillator();
    const padGain = context.createGain();
    const birdsGain = context.createGain();

    pad.type = "sine";
    birds.type = "triangle";
    pad.frequency.value = sceneMode === "night" ? 90 : 140;
    birds.frequency.value = sceneMode === "night" ? 220 : 520;
    padGain.gain.value = 0.0001;
    birdsGain.gain.value = 0.0001;

    pad.connect(padGain);
    birds.connect(birdsGain);
    padGain.connect(context.destination);
    birdsGain.connect(context.destination);

    const now = context.currentTime;
    padGain.gain.exponentialRampToValueAtTime(0.012, now + 0.4);
    birdsGain.gain.exponentialRampToValueAtTime(0.004, now + 0.4);
    pad.start(now);
    birds.start(now);

    const interval = window.setInterval(() => {
      const time = context.currentTime;
      birds.frequency.setValueAtTime(sceneMode === "night" ? 200 : 480, time);
      birds.frequency.exponentialRampToValueAtTime(sceneMode === "night" ? 260 : 760, time + 0.18);
      birdsGain.gain.cancelScheduledValues(time);
      birdsGain.gain.setValueAtTime(0.0001, time);
      birdsGain.gain.exponentialRampToValueAtTime(0.006, time + 0.04);
      birdsGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.26);
    }, sceneMode === "night" ? 5200 : 3400);

    ambientCleanupRef.current = () => {
      window.clearInterval(interval);
      const stopAt = context.currentTime + 0.25;
      padGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      birdsGain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
      pad.stop(stopAt);
      birds.stop(stopAt);
      window.setTimeout(() => {
        void context.close();
      }, 320);
    };

    return () => {
      ambientCleanupRef.current?.();
      ambientCleanupRef.current = null;
    };
  }, [sceneMode, soundEnabled]);

  const missions = useMemo<DiscoveryMission[]>(() => {
    const carnivoreCount = zooAnimals.filter(
      (animal) => animal.dietType === "carnivore" && discoveredAnimalIds.includes(animal.id),
    ).length;

    return [
      {
        id: "find-all",
        title: "Find all animals",
        description: `Barcha ${zooAnimals.length} hayvon zonasini toping.`,
        current: discoveredAnimalIds.length,
        target: zooAnimals.length,
        completed: discoveredAnimalIds.length >= zooAnimals.length,
      },
      {
        id: "discover-three",
        title: "Discover 3 animals",
        description: "Kamida 3 ta hayvon haqida ma'lumot oling.",
        current: Math.min(discoveredAnimalIds.length, 3),
        target: 3,
        completed: discoveredAnimalIds.length >= 3,
      },
      {
        id: "learn-carnivores",
        title: "Learn about carnivores",
        description: "Yirtqich hayvonni topib, oziqlanishi haqida bilib oling.",
        current: Math.min(carnivoreCount, 1),
        target: 1,
        completed: carnivoreCount >= 1,
      },
    ];
  }, [discoveredAnimalIds]);

  const completedMissionCount = missions.filter((mission) => mission.completed).length;

  async function enterVr() {
    try {
      setXrError(null);
      await xrStore.enterVR();
    } catch {
      setXrError("VR sessiyasini ochib bo'lmadi. WebXR brauzer yoki Meta Quest bilan qayta urinib ko'ring.");
    }
  }

  return (
    <section className={`relative h-[100dvh] min-h-[100dvh] overflow-hidden rounded-[32px] ${
      sceneMode === "night"
        ? "bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.18),_transparent_22%),linear-gradient(180deg,_#07111f_0%,_#102742_36%,_#122d21_100%)]"
        : "bg-[radial-gradient(circle_at_top,_rgba(255,248,220,0.25),_transparent_20%),linear-gradient(180deg,_#dff2ff_0%,_#a6d3ff_38%,_#5f8d5f_100%)]"
    }`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(255,255,255,0.35),transparent_20%),radial-gradient(circle_at_84%_8%,rgba(254,240,138,0.3),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#16311d]/65 via-[#16311d]/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#08140d]/55 via-transparent to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto max-w-sm rounded-[26px] border border-white/30 bg-[rgba(8,36,25,0.72)] px-4 py-3 text-white shadow-[0_18px_48px_rgba(15,23,42,0.24)] backdrop-blur-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-100/75">
            VR Educational Adventure
          </p>
          <h1 className="mt-1 text-xl font-black sm:text-2xl">Virtual Zoo Explorer VR</h1>
          <p className="mt-2 text-sm leading-6 text-emerald-50/85">
            Hayvonlarga yaqin boring, ma'lumot o'qing va discovery journal ni to'ldiring.
          </p>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <div className="flex flex-wrap justify-end gap-3">
            <div className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold text-slate-950 backdrop-blur-xl">
              <span className="inline-flex items-center gap-2">
                <FaBookOpen />
                {discoveredAnimalIds.length}/{zooAnimals.length} hayvon topildi
              </span>
            </div>
            <div className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold text-slate-950 backdrop-blur-xl">
              {completedMissionCount}/{missions.length} mission
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[rgba(55,23,18,0.72)] px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-[rgba(77,31,24,0.84)]"
              onClick={() => {
                stopZooMusic();
                navigate("/games");
              }}
              type="button"
            >
              <FaArrowLeft />
              Chiqish
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 via-lime-200 to-amber-200 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_18px_44px_rgba(120,194,108,0.28)] transition hover:brightness-105"
              onClick={enterVr}
              type="button"
            >
              <FaVrCardboard />
              VR rejimiga kirish
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[rgba(12,31,22,0.72)] px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-[rgba(16,44,31,0.82)]"
              onClick={() => setSceneMode((current) => (current === "day" ? "night" : "day"))}
              type="button"
            >
              {sceneMode === "day" ? <FaMoon /> : <FaSun />}
              {sceneMode === "day" ? "Night mode" : "Day mode"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[rgba(12,31,22,0.72)] px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-[rgba(16,44,31,0.82)]"
              onClick={() => setSoundEnabled((current) => !current)}
              type="button"
            >
              <FaVolumeUp />
              {soundEnabled ? "Audio on" : "Audio off"}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[rgba(12,31,22,0.72)] px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-[rgba(16,44,31,0.82)]"
              onClick={resetDiscovery}
              type="button"
            >
              <FaRedoAlt />
              Journal ni tozalash
            </button>
          </div>

          {xrError ? (
            <p className="max-w-sm rounded-2xl border border-amber-200/30 bg-[rgba(92,63,17,0.82)] px-4 py-3 text-right text-xs leading-5 text-amber-50 shadow-[0_18px_40px_rgba(78,51,11,0.24)]">
              {xrError}
            </p>
          ) : null}
        </div>
      </div>

      <Canvas camera={{ fov: 55, position: [0, 1.65, 16] }} shadows>
        <ZooScene
          animals={zooAnimals}
          discoveredIds={discoveredAnimalIds}
          missions={missions}
          onDiscoverAnimal={discoverAnimal}
          sceneMode={sceneMode}
          store={xrStore}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-4 left-4 z-30 max-w-md rounded-[24px] border border-white/20 bg-[rgba(16,34,23,0.7)] px-4 py-3 text-white shadow-[0_18px_40px_rgba(6,14,10,0.28)] backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100/70">
          Explorer Guide
        </p>
        {/* <p className="mt-2 text-sm leading-6 text-emerald-50/90">
          Real zoo sayriga o'xshash tajriba uchun sahnani bosing, keyin `W A S D` bilan yuring, `Shift`
          bilan tezlashib, hayvon yoniga borganingizda ma'lumot panelini oching.
        </p> */}
      </div>
    </section>
  );
}
