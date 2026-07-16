import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaRocket, FaStar } from "react-icons/fa6";

export type CountdownValue = 3 | 2 | 1 | "BOSHLANDI" | null;

type Props = {
  visible: boolean;
  value: CountdownValue;
};

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

export default function GameStartCountdownOverlay({ visible, value }: Props) {
  const reduceMotion = useReducedMotion();
  const { width, height } = useViewportSize();

  if (!visible || value === null) return null;

  const isStarted = value === "BOSHLANDI";
  const accent = isStarted
    ? "from-emerald-400 via-cyan-400 to-sky-400"
    : value === 1
      ? "from-amber-400 via-orange-500 to-rose-500"
      : value === 2
        ? "from-cyan-400 via-blue-500 to-violet-500"
        : "from-violet-500 via-fuchsia-500 to-pink-500";

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[#020617]/90 px-4 backdrop-blur-xl">
      {isStarted && !reduceMotion && width > 0 ? (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={170}
          gravity={0.22}
          initialVelocityY={16}
          colors={["#fbbf24", "#fb7185", "#22d3ee", "#34d399", "#a78bfa"]}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
      <motion.div
        className={`pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-gradient-to-br ${accent} blur-3xl`}
        animate={reduceMotion ? undefined : { opacity: isStarted ? [0.16, 0.42, 0.18] : [0.1, 0.25, 0.1], scale: isStarted ? [0.85, 1.16, 0.92] : [0.9, 1.05, 0.9] }}
        transition={{ duration: isStarted ? 1.1 : 1.6, ease: "easeOut" }}
      />

      <div className="pointer-events-none absolute inset-0">
        <FaStar className="absolute left-[13%] top-[19%] text-xl text-yellow-300/60 sm:text-2xl" />
        <FaStar className="absolute right-[16%] top-[23%] text-base text-cyan-200/60 sm:text-xl" />
        <FaStar className="absolute bottom-[20%] left-[18%] text-sm text-pink-200/60 sm:text-lg" />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={String(value)}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.72, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.15, y: -12 }}
          transition={{ type: "spring", stiffness: 310, damping: 21, mass: 0.72 }}
          className="relative z-10 w-full max-w-sm text-center"
        >
          <div className="relative overflow-hidden border border-white/20 bg-slate-950/60 px-7 py-9 shadow-[0_28px_100px_rgba(0,0,0,0.52)] backdrop-blur-xl sm:px-12 sm:py-11">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.12),transparent_36%,rgba(255,255,255,0.04))]" />

            {!isStarted ? (
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.32em] text-white/60">Tayyorlaning</p>
                <motion.p
                  className={`mt-4 bg-gradient-to-r ${accent} bg-clip-text text-[132px] font-black leading-none text-transparent sm:text-[174px]`}
                  animate={reduceMotion ? undefined : { textShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 34px rgba(255,255,255,0.35)", "0 0 0 rgba(255,255,255,0)"] }}
                  transition={{ duration: 0.78, ease: "easeOut" }}
                >
                  {value}
                </motion.p>
                <p className="mt-4 text-sm font-medium text-white/70">O'yin boshlanmoqda</p>
              </div>
            ) : (
              <div className="relative">
                <motion.div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-white shadow-[0_0_48px_rgba(34,211,238,0.5)] sm:h-24 sm:w-24`}
                  initial={reduceMotion ? false : { rotate: -38, scale: 0.4 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 15 }}
                >
                  <FaRocket className="text-3xl sm:text-4xl" />
                </motion.div>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.34em] text-emerald-100/75">Start</p>
                <h2 className={`mt-2 bg-gradient-to-r ${accent} bg-clip-text text-4xl font-black text-transparent sm:text-5xl`}>
                  BOSHLANDI!
                </h2>
                <p className="mt-3 text-sm text-white/72">Omad, o'yin vaqti keldi.</p>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
