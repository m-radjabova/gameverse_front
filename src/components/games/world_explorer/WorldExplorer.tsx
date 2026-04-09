import Confetti from "react-confetti-boom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import correctSfx from "../../../assets/sounds/correct.m4a";
import GlobeScene from "./components/GlobeScene";
import MissionPanel from "./components/MissionPanel";
import { countries } from "./data/countries";
import type { Country, ExploreFeedback } from "./types";

export default function WorldExplorer() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [, setScore] = useState(0);
  const [exploredCountries, setExploredCountries] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ExploreFeedback | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewardMessage, setRewardMessage] = useState<string | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  const completedSet = useMemo(
    () => new Set(exploredCountries),
    [exploredCountries],
  );

  useEffect(() => {
    correctAudioRef.current = new Audio(correctSfx);
  }, []);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  useEffect(() => {
    if (!rewardMessage) return;
    const timer = window.setTimeout(() => setRewardMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [rewardMessage]);

  useEffect(() => {
    if (!selectedCountry) return;
    const stillVisible = countries.some((country) => country.id === selectedCountry.id);
    if (!stillVisible) {
      setSelectedCountry(null);
      setFeedback(null);
    }
  }, [selectedCountry]);

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);

    if (completedSet.has(country.id)) {
      setFeedback({
        kind: "repeat",
        message: `${country.name} ma'lumoti allaqachon ochilgan. Yana bemalol o'qib chiqishingiz mumkin.`,
      });
      return;
    }

    setScore((current) => current + 40);
    setExploredCountries((current) =>
      current.includes(country.id) ? current : [...current, country.id],
    );
    setShowConfetti(true);
    correctAudioRef.current?.play().catch(() => {});
    setRewardMessage(`${country.flag} ${country.name} o'rganildi • +40 ball`);
    setFeedback({
      kind: "new",
      message: `${country.name} bo'yicha yangi ma'lumot ochildi. Siz 40 ball oldingiz.`,
    });
  };

  return (
    <section className="relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#081124_45%,_#020617_100%)]">
      {showConfetti && (
        <Confetti
          colors={["#22c55e", "#06b6d4", "#3b82f6", "#f59e0b", "#f472b6"]}
          effectCount={1}
          mode="boom"
          particleCount={140}
          x={0.5}
          y={0.32}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.10),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_30%)]" />

      <GlobeScene
        completedMissionIds={exploredCountries}
        countries={countries}
        hideMarkers={false}
        onClearSelection={() => {
          setSelectedCountry(null);
          setFeedback(null);
        }}
        onSelectCountry={handleSelectCountry}
        selectedCountry={selectedCountry}
      />

      <AnimatePresence>
        {rewardMessage && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-none absolute left-1/2 top-6 z-30 w-[min(92vw,420px)] -translate-x-1/2 rounded-[24px] border border-emerald-300/20 bg-emerald-400/15 px-5 py-4 text-center text-sm font-semibold text-emerald-50 shadow-[0_24px_80px_rgba(16,185,129,0.24)] backdrop-blur-2xl"
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
          >
            {rewardMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <MissionPanel
        completedMissionIds={exploredCountries}
        feedback={feedback}
        onClose={() => {
          setSelectedCountry(null);
          setFeedback(null);
        }}
        selectedCountry={selectedCountry}
      />
    </section>
  );
}
