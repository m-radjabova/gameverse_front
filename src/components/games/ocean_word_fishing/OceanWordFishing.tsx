import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  FaArrowLeft,
  FaCrown,
  FaFish,
  FaPlay,
  FaPlus,
  FaRedo,
  FaTrash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import Confetti from "react-confetti-boom";

import oceanSound from "../../../assets/sounds/ocean-wave-1.m4a";

import dingSound from "../../../assets/sounds/ding.m4a";
import oopsSound from "../../../assets/sounds/wrong.m4a";
import tadaSound from "../../../assets/sounds/tada.mp3";

import fish1 from "../../../assets/blue-fish-removebg-preview.png";
import fish2 from "../../../assets/cute_fish-removebg-preview.png";
import fish3 from "../../../assets/fish-removebg-preview.png";

import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Phase = "teacher" | "play" | "finish";
type FishVariant = 0 | 1 | 2;

type Fish = {
  id: string;
  letter: string;
  x: number;
  y: number;
  facing: 1 | -1;

  fromX: number;
  toX: number;
  swimDuration: number;
  swimDelay: number;

  floatDuration: number;
  size: number;
  color: string;
  caught: boolean;
  variant: FishVariant;
  imageUrl: string;

  lane: number;
};

type WordItem = {
  id: string;
  word: string;
  letters: string[];
  found: boolean;
  points: number;
};
import ocean from "../../../assets/ocean.jpg";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const OCEAN_IMAGE = ocean
const FISH_IMAGES: Record<FishVariant, string> = {
  0: fish1,
  1: fish2,
  2: fish3,
};

const FISH_COLORS = [
  "#f97316",
  "#f43f5e",
  "#facc15",
  "#14b8a6",
  "#22d3ee",
  "#60a5fa",
  "#34d399",
];

const shuffle = <T,>(arr: T[]) => {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const getRoundTime = (word: string) =>
  Math.max(35, Math.min(90, 25 + word.length * 7));

const normalizeWord = (value: string) =>
  value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z]/g, "");

const buildLettersForRound = (word: string) => {
  const targetLetters = word.split("");
  const distractorCount = Math.max(
    5,
    Math.min(12, Math.ceil(targetLetters.length * 1.2)),
  );
  const available = ALPHABET.split("").filter(
    (char) => !targetLetters.includes(char),
  );

  const distractors = Array.from({ length: distractorCount }, () => {
    const pool = available.length ? available : ALPHABET.split("");
    return pool[Math.floor(Math.random() * pool.length)];
  });

  return shuffle([...targetLetters, ...distractors]);
};

// ✅ now takes allowedVariants for unlock system
const createFishes = (letters: string[], allowedVariants: FishVariant[]) => {
  const lanes = clamp(Math.ceil(letters.length / 3.5), 5, 7);

  const topMin = 18;
  const topMax = 82;
  const laneStep = (topMax - topMin) / (lanes - 1);

  const slotsPerLane = clamp(Math.ceil(letters.length / lanes), 4, 8);

  const laneSlots = Array.from({ length: lanes }, () =>
    shuffle(Array.from({ length: slotsPerLane }, (_, i) => i)),
  );

  const laneMinX = 12;
  const laneMaxX = 88;
  const slotStep = (laneMaxX - laneMinX) / (slotsPerLane - 1);

  return letters.map((letter, idx) => {
    const lane = idx % lanes;

    const baseY = topMin + lane * laneStep;
    const yJitter = Math.random() * 8 - 4;
    const y = clamp(baseY + yJitter, topMin, topMax);

    const slotList = laneSlots[lane];
    const slotIndex = slotList.length
      ? slotList.pop()!
      : Math.floor(Math.random() * slotsPerLane);
    const x = laneMinX + slotIndex * slotStep;

    const facing = (lane < Math.ceil(lanes / 2) ? 1 : -1) as 1 | -1;

    const size = 66 + Math.random() * 36;

    const fromX =
      facing === 1 ? -35 - Math.random() * 25 : 120 + Math.random() * 25;
    const toX =
      facing === 1 ? 120 + Math.random() * 25 : -35 - Math.random() * 25;

    const swimDuration = 14 + lane * 1.6 + Math.random() * 6;
    const swimDelay = slotIndex * 0.65 + Math.random() * 1.1;

    const floatDuration = 2.4 + Math.random() * 2.6;

    const variant =
      allowedVariants[
        Math.floor(Math.random() * Math.max(1, allowedVariants.length))
      ] ?? 0;

    return {
      id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      letter,
      x,
      y,
      facing,
      fromX,
      toX,
      swimDuration,
      swimDelay,
      floatDuration,
      size,
      color: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)],
      caught: false,
      variant,
      imageUrl: FISH_IMAGES[variant],
      lane,
    } satisfies Fish;
  });
};

// Baliq rasmi komponenti
const FishImage = ({ fish }: { fish: Fish }) => {
  const [imageError, setImageError] = useState(false);

  const flip = fish.facing > 0 ? "scaleX(-1)" : "scaleX(1)";

  if (imageError || !fish.imageUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-full shadow-xl"
        style={{
          width: fish.size,
          height: fish.size * 0.8,
          backgroundColor: fish.color,
          border: "3px solid white",
        }}
      >
        <div style={{ transform: flip }}>
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {fish.letter}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: fish.size, height: fish.size * 0.8 }}>
      <img
        src={fish.imageUrl}
        alt={`Baliq-${fish.letter}`}
        className="h-full w-full object-contain drop-shadow-2xl"
        style={{ transform: flip }}
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {fish.letter}
        </span>
      </div>
    </div>
  );
};

export default function OceanWordFishing() {
  const [phase, setPhase] = useState<Phase>("teacher");
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [draftWord, setDraftWord] = useState("");
  const [draftError, setDraftError] = useState("");

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hadMistakeThisRound, setHadMistakeThisRound] = useState(false);

  const [caughtFxId, setCaughtFxId] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const [stars, setStars] = useState(0);
  const [medal, setMedal] = useState<"bronze" | "silver" | "gold" | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const [playerLevel, setPlayerLevel] = useState(1);
  const [unlockedFish, setUnlockedFish] = useState<FishVariant[]>([0]);

  // audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dingRef = useRef<HTMLAudioElement | null>(null);
  const oopsRef = useRef<HTMLAudioElement | null>(null);
  const tadaRef = useRef<HTMLAudioElement | null>(null);

  const timerRef = useRef<number | null>(null);
  const wordsRef = useRef<WordItem[]>([]);
  const indexRef = useRef(0);

  const currentWord = words[currentWordIndex];
  const progress =
    words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  const foundCount = useMemo(
    () => words.filter((word) => word.found).length,
    [words],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const playSfx = (ref: React.RefObject<HTMLAudioElement | null>) => {
    if (isMuted) return;
    const a = ref.current;
    if (!a) return;
    try {
      a.currentTime = 0;
      a.play().catch(() => undefined);
    } catch {
      // ignore
    }
  };

  const setupRound = (index: number, list = wordsRef.current) => {
    const target = list[index];
    if (!target) return;

    setCurrentWordIndex(index);
    indexRef.current = index;

    setSelectedLetters([]);
    setTimeLeft(getRoundTime(target.word));

    setHadMistakeThisRound(false);
    setStreak(0);

    const letters = buildLettersForRound(target.word);
    setFishes(createFishes(letters, unlockedFish));
  };

  const calculateRewards = () => {
    const total = wordsRef.current.length || 1;
    const found = wordsRef.current.filter((w) => w.found).length;
    const ratio = found / total;

    const nextStars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio >= 0.3 ? 1 : 0;
    const nextMedal =
      ratio >= 0.9 ? "gold" : ratio >= 0.6 ? "silver" : ratio >= 0.3 ? "bronze" : null;

    setStars(nextStars);
    setMedal(nextMedal);

    setPlayerLevel((lvl) => lvl + Math.floor(nextStars / 2));

    if (nextStars >= 2) {
      setUnlockedFish((prev) => {
        const all: FishVariant[] = [0, 1, 2];
        const next = all.find((v) => !prev.includes(v));
        return next !== undefined ? [...prev, next] : prev;
      });
    }
  };

  const finishGame = () => {
    setIsPlaying(false);
    setPhase("finish");
    if (audioRef.current) audioRef.current.pause();
    calculateRewards();
  };

  const advanceRound = (isFound: boolean) => {
    const idx = indexRef.current;

    if (isFound) {
      setWords((prev) =>
        prev.map((word, wIdx) => (wIdx === idx ? { ...word, found: true } : word)),
      );
    }

    const nextIndex = idx + 1;
    if (nextIndex >= wordsRef.current.length) {
      finishGame();
      return;
    }
    setupRound(nextIndex, wordsRef.current);
  };

  useEffect(() => {
    wordsRef.current = words;
  }, [words]);

  useEffect(() => {
    // bg ocean
    audioRef.current = new Audio(oceanSound);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.32;

    // sfx
    dingRef.current = new Audio(dingSound);
    oopsRef.current = new Audio(oopsSound);
    tadaRef.current = new Audio(tadaSound);

    if (dingRef.current) dingRef.current.volume = 0.7;
    if (oopsRef.current) oopsRef.current.volume = 0.7;
    if (tadaRef.current) tadaRef.current.volume = 0.8;

    return () => {
      [audioRef, dingRef, oopsRef, tadaRef].forEach((r) => {
        if (r.current) {
          r.current.pause();
          r.current = null;
        }
      });
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (phase === "play" && isPlaying && !isMuted) {
      audioRef.current.play().catch(() => undefined);
    } else {
      audioRef.current.pause();
    }
  }, [isMuted, isPlaying, phase]);

  useEffect(() => {
    if (phase !== "play" || !isPlaying) return;

    timerRef.current = window.setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          showToast("Vaqt tugadi, keyingi so'z!");
          window.setTimeout(() => advanceRound(false), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, isPlaying, timeLeft]);

  const addWord = () => {
    const word = normalizeWord(draftWord.trim());
    if (!word) return setDraftError("Faqat lotin harflari bilan so'z kiriting.");
    if (word.length < 3) return setDraftError("So'z kamida 3 harf bo'lishi kerak.");
    if (words.some((item) => item.word === word))
      return setDraftError("Bu so'z allaqachon qo'shilgan.");

    setWords((prev) => [
      ...prev,
      {
        id: `word-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        word,
        letters: word.split(""),
        found: false,
        points: word.length * 12,
      },
    ]);

    setDraftWord("");
    setDraftError("");
    showToast(`"${word}" qo'shildi`);
  };

  const removeWord = (id: string) => {
    setWords((prev) => prev.filter((word) => word.id !== id));
    showToast("So'z o'chirildi");
  };

  const startGame = () => {
    if (words.length === 0) return setDraftError("Kamida 1 ta so'z kiriting.");

    const resetWords = words.map((word) => ({ ...word, found: false }));
    setWords(resetWords);
    wordsRef.current = resetWords;

    setScore(0);
    setPhase("play");
    setIsPlaying(true);

    // reset run stats
    setHadMistakeThisRound(false);
    setStreak(0);
    setBestStreak(0);

    const target = resetWords[0];
    setCurrentWordIndex(0);
    indexRef.current = 0;
    setSelectedLetters([]);
    setTimeLeft(getRoundTime(target.word));

    setFishes(createFishes(buildLettersForRound(target.word), unlockedFish));

    showToast("O'yin boshlandi. To'g'ri harflarni tuting!");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const resetCurrentRound = () => {
    if (!currentWord) return;
    setSelectedLetters([]);
    setHadMistakeThisRound(false);
    setStreak(0);
    setFishes(createFishes(buildLettersForRound(currentWord.word), unlockedFish));
    showToast("Joriy so'z qayta boshlandi");
  };

  const handleFishClick = (fish: Fish) => {
    if (phase !== "play" || !isPlaying || !currentWord || fish.caught) return;

    const nextIndex = selectedLetters.length;
    const expectedLetter = currentWord.letters[nextIndex];

    // ❌ WRONG: no restart, only penalty + shake + sound
    if (fish.letter !== expectedLetter) {
      setHadMistakeThisRound(true);
      setStreak(0);
      setTimeLeft((t) => Math.max(0, t - 3));

      playSfx(oopsRef);

      setScreenShake(true);
      window.setTimeout(() => setScreenShake(false), 300);

      showToast(`Xato! "${expectedLetter}" harfini toping`);
      return;
    }

    // ✅ CORRECT
    const comboAfter = streak + 1; // use for last-letter scoring immediately

    playSfx(dingRef);

    setStreak((prev) => {
      const next = prev + 1;
      setBestStreak((b) => Math.max(b, next));
      return next;
    });

    // mark caught
    setFishes((prev) =>
      prev.map((item) => (item.id === fish.id ? { ...item, caught: true } : item)),
    );

    // trigger caught animation (we keep rendering caught fish briefly)
    setCaughtFxId(fish.id);
    window.setTimeout(() => setCaughtFxId(null), 260);

    const updated = [...selectedLetters, fish.letter];
    setSelectedLetters(updated);

    // word completed
    if (updated.length === currentWord.letters.length) {
      const timeBonus = Math.max(0, timeLeft);
      const streakBonus = comboAfter >= 8 ? 40 : comboAfter >= 5 ? 25 : comboAfter >= 3 ? 12 : 0;
      const perfectBonus = hadMistakeThisRound ? 0 : 40;

      const earned = currentWord.points + timeBonus + streakBonus + perfectBonus;

      const bonusText = [
        timeBonus ? `+${timeBonus} time` : null,
        streakBonus ? `+${streakBonus} combo` : null,
        perfectBonus ? `+${perfectBonus} PERFECT` : null,
      ]
        .filter(Boolean)
        .join(" • ");

      setScore((prev) => prev + earned);

      playSfx(tadaRef);

      showToast(
        bonusText ? `Ajoyib! +${earned} (${bonusText})` : `Ajoyib! +${earned} ball`,
      );

      window.setTimeout(() => advanceRound(true), 900);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Okean foni */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#56c9ff] via-[#1e7ed8] to-[#0b3d91]"
        style={{
          backgroundImage: `url("${OCEAN_IMAGE}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c4a6e]/20 via-[#0c4a6e]/35 to-[#082f49]/50" />

        {/* To'lqinlar */}
        <div className="absolute -bottom-14 left-0 right-0 h-40 bg-gradient-to-t from-cyan-300/20 to-transparent animate-wave" />
        <div
          className="absolute -bottom-16 left-0 right-0 h-44 bg-gradient-to-t from-sky-200/10 to-transparent animate-wave-slow"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-12 left-0 right-0 h-36 bg-gradient-to-t from-blue-300/15 to-transparent animate-wave-slower"
          style={{ animationDelay: "2s" }}
        />

        {/* Pufakchalar */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 20}%`,
              width: `${5 + Math.random() * 15}px`,
              height: `${5 + Math.random() * 15}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Toast xabarlar */}
      <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2">
        {toast && (
          <div className="rounded-full border border-cyan-200/40 bg-gradient-to-r from-sky-700/90 to-cyan-700/90 px-5 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md">
            {toast}
          </div>
        )}
      </div>

      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={120}
          effectCount={1}
          x={0.5}
          y={0.35}
          colors={["#22d3ee", "#3b82f6", "#0ea5e9", "#34d399", "#facc15"]}
        />
      )}

      {/* O'qituvchi paneli */}
      {phase === "teacher" && (
        <div className="relative z-10 mx-auto max-w-4xl p-6">
          <div className="rounded-3xl border border-cyan-200/35 bg-gradient-to-br from-sky-950/75 to-cyan-950/70 p-7 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500">
                <FaFish className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">OCEAN WORD FISHING</h2>
                <p className="text-cyan-100/80">
                  O'qituvchi so'zlarni kiritsin, bolalar baliq tutib so'z yig'adi.
                </p>
                <p className="mt-1 text-xs text-cyan-100/70">
                  Unlock: {unlockedFish.length}/3 fish • Level: {playerLevel}
                </p>
              </div>
            </div>

            <div className="mb-7">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={draftWord}
                  onChange={(e) => setDraftWord(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWord()}
                  className="w-full rounded-xl border border-cyan-200/30 bg-white/10 px-5 py-3 text-lg text-white placeholder:text-cyan-100/55 focus:border-cyan-300 focus:outline-none"
                  placeholder="Masalan: BALIQ"
                />
                <button
                  onClick={addWord}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 text-base font-black text-white transition hover:scale-[1.02]"
                >
                  <FaPlus className="mr-2 inline" />
                  Qo'shish
                </button>
              </div>
              {draftError && <p className="mt-2 text-sm text-rose-300">{draftError}</p>}
            </div>

            <div className="grid max-h-80 gap-3 overflow-y-auto pr-1">
              {words.map((word, idx) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between rounded-xl border border-cyan-200/25 bg-white/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-lg font-black text-white">{word.word}</p>
                      <p className="text-xs text-cyan-100/75">Ball: {word.points}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWord(word.id)}
                    className="text-rose-300 transition hover:text-rose-200"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              ))}

              {words.length === 0 && (
                <div className="rounded-xl border border-dashed border-cyan-200/30 p-8 text-center text-cyan-100/60">
                  Hozircha so'zlar yo'q
                </div>
              )}
            </div>

            {words.length > 0 && (
              <div className="mt-7 text-center">
                <button
                  onClick={handleStartGame}
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-10 py-4 text-xl font-black text-white shadow-2xl transition hover:scale-[1.03]"
                >
                  <FaPlay className="mr-3 inline" />
                  O'yinni Boshlash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* O'yin jarayoni */}
      {phase === "play" && currentWord && (
        <div className="relative z-10 min-h-screen">
          {/* Yuqori panel */}
          <div className="absolute left-0 right-0 top-0 z-20 bg-gradient-to-b from-sky-950/85 to-transparent p-4">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-cyan-200/30 bg-white/15 px-4 py-2 backdrop-blur-md">
                  <p className="text-xs text-cyan-100">Ball</p>
                  <p className="text-2xl font-black text-white">{score}</p>
                </div>
                <div className="rounded-xl border border-cyan-200/30 bg-white/15 px-4 py-2 backdrop-blur-md">
                  <p className="text-xs text-cyan-100">Vaqt</p>
                  <p className="text-2xl font-black text-white">{timeLeft}s</p>
                </div>

                {/* ✅ Combo/Streak panel */}
                <div className="rounded-xl border border-cyan-200/30 bg-white/15 px-4 py-2 backdrop-blur-md">
                  <p className="text-xs text-cyan-100">Combo</p>
                  <p className="text-2xl font-black text-white">{streak}</p>
                  <p className="text-[10px] text-cyan-100/70">Best: {bestStreak}</p>
                </div>
              </div>

              <div className="max-w-3xl flex-1 rounded-xl border border-cyan-200/25 bg-white/10 p-3 backdrop-blur-md">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-cyan-100">Topiladigan so'z:</span>
                  {currentWord.letters.map((letter, i) => (
                    <span
                      key={`${letter}-${i}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg font-black ${
                        i < selectedLetters.length
                          ? "border-emerald-300 bg-emerald-500 text-white"
                          : "border-cyan-100/35 bg-white/15 text-cyan-100/65"
                      }`}
                    >
                      {i < selectedLetters.length ? letter : "?"}
                    </span>
                  ))}

                  {/* ✅ Perfect hint */}
                  {!hadMistakeThisRound && (
                    <span className="ml-2 rounded-full border border-emerald-200/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-100">
                      PERFECT ACTIVE
                    </span>
                  )}
                </div>

                <div className="h-2 rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleMute}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/30 bg-white/15 text-white transition-all hover:bg-white/25"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <button
                  onClick={resetCurrentRound}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200/30 bg-white/15 text-white transition-all hover:bg-white/25"
                >
                  <FaRedo />
                </button>
              </div>
            </div>
          </div>

          {/* Baliqlar maydoni */}
          <div
            className={`relative h-screen w-full overflow-hidden pt-28 ${
              screenShake ? "screen-shake" : ""
            }`}
          >
            {fishes.map((fish) => {
              const shouldRender = !fish.caught || caughtFxId === fish.id;
              if (!shouldRender) return null;

              return (
                <div
                  key={fish.id}
                  className="absolute"
                  style={{
                    left: `${fish.x}%`,
                    top: `${fish.y}%`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: fish.caught ? "none" : "auto",
                  }}
                >
                  <div
                    style={
                      {
                        animation: `fish-pass-${
                          fish.facing === 1 ? "right" : "left"
                        } ${fish.swimDuration}s linear infinite`,
                        animationDelay: `${fish.swimDelay}s`,
                        ["--fromX"]: `${fish.fromX}vw`,
                        ["--toX"]: `${fish.toX}vw`,
                        willChange: "transform",
                        opacity: fish.caught ? 0.92 : 1,
                      } as CSSProperties
                    }
                  >
                    <div
                      style={
                        {
                          animation: `fish-float ${fish.floatDuration}s ease-in-out infinite`,
                          willChange: "transform",
                        } as CSSProperties
                      }
                    >
                      <button
                        onClick={() => handleFishClick(fish)}
                        className={`relative transition duration-200 hover:scale-110 active:scale-95 ${
                          fish.caught && caughtFxId === fish.id ? "fish-caught" : ""
                        }`}
                      >
                        <span className="absolute -inset-5" />
                        <FishImage fish={fish} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pastki panel - yig'ilgan harflar */}
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
            <div className="rounded-2xl border border-cyan-100/30 bg-sky-950/65 p-4 backdrop-blur-lg">
              <p className="mb-2 text-center text-xs text-cyan-100/80">Yig'ilgan harflar</p>
              <div className="flex min-h-11 gap-2">
                {selectedLetters.length > 0 ? (
                  selectedLetters.map((letter, i) => (
                    <span
                      key={`${letter}-${i}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-xl font-black text-white animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {letter}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-2 text-sm text-cyan-100/60">
                    Baliqlarni bosib so'zni yig'ing
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yakuniy natija */}
      {phase === "finish" && (
        <div className="relative z-10 mx-auto max-w-3xl p-6">
          <div className="rounded-3xl border border-cyan-100/35  p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400">
                <FaCrown className="text-4xl text-white" />
              </div>
            </div>

            <h2 className="mb-3 text-4xl font-black text-white">Tabriklaymiz!</h2>
            <p className="mb-3 text-xl text-cyan-100">Yakuniy ball: {score}</p>

            {/* ✅ stars */}
            <div className="mb-3 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`text-3xl ${i < stars ? "opacity-100" : "opacity-30"}`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* ✅ medal + level + unlock */}
            {medal && (
              <p className="mb-2 text-lg font-bold text-cyan-100">
                Medal:{" "}
                {medal === "gold" ? "🥇 Gold" : medal === "silver" ? "🥈 Silver" : "🥉 Bronze"}
              </p>
            )}
            <p className="mb-5 text-sm text-cyan-100/85">
              Level: <span className="font-black text-white">{playerLevel}</span> • Unlock:
              <span className="ml-1 font-black text-white">{unlockedFish.length}/3</span>
            </p>

            <div className="mx-auto mb-6 grid max-w-md grid-cols-2 gap-3">
              <div className="rounded-xl border border-cyan-100/30 bg-white/10 p-4">
                <p className="text-sm text-cyan-100/80">Topilgan so'zlar</p>
                <p className="text-2xl font-black text-white">
                  {foundCount}/{words.length}
                </p>
              </div>
              <div className="rounded-xl border border-cyan-100/30 bg-white/10 p-4">
                <p className="text-sm text-cyan-100/80">Best Combo</p>
                <p className="text-2xl font-black text-white">{bestStreak}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setPhase("teacher");
                  setIsPlaying(false);
                }}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-7 py-3 text-lg font-black text-white transition-all hover:scale-105"
              >
                <FaPlay className="mr-2 inline" />
                Qayta O'ynash
              </button>
              <button
                onClick={() => {
                  window.location.href = "/games";
                }}
                className="rounded-xl border border-cyan-100/40 bg-white/10 px-7 py-3 text-lg font-bold text-white transition-all hover:bg-white/20"
              >
                <FaArrowLeft className="mr-2 inline" />
                O'yinlar
              </button>
            </div>
          </div>
        </div>
      )}
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
