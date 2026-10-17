import { useEffect, useId, useState } from "react";
import Confetti from "react-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaRocket, FaStar } from "react-icons/fa6";

export type CountdownValue = 3 | 2 | 1 | "BOSHLANDI" | null;

type Props = {
  visible: boolean;
  value: CountdownValue;
};

type Theme = {
  a: string;
  b: string;
  c: string;
  glow: string;
  hint: string;
};

const THEMES: Record<"3" | "2" | "1" | "start", Theme> = {
  "3": { a: "#a78bfa", b: "#e879f9", c: "#f472b6", glow: "rgba(217,70,239,0.42)", hint: "O'yin boshlanmoqda" },
  "2": { a: "#22d3ee", b: "#3b82f6", c: "#8b5cf6", glow: "rgba(59,130,246,0.45)", hint: "Barmoqlar tayyormi?" },
  "1": { a: "#fde047", b: "#fb923c", c: "#f43f5e", glow: "rgba(249,115,22,0.5)", hint: "Hozir boshlanadi!" },
  start: { a: "#6ee7b7", b: "#22d3ee", c: "#38bdf8", glow: "rgba(34,211,238,0.5)", hint: "Omad, o'yin vaqti keldi." },
};

const RING_RADIUS = 92;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;
const STEP_SECONDS = 0.95;

// Tasodifiy emas, doimiy — har renderda joyi o'zgarmasligi uchun.
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  size: 3 + ((i * 7) % 4),
  delay: (i % 9) * 0.35,
  duration: 3.4 + (i % 5) * 0.7,
  drift: ((i * 13) % 50) - 25,
}));

const BURST_STARS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const distance = 150 + (i % 3) * 38;
  return { id: i, x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size: 14 + (i % 3) * 6 };
});

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

function getTheme(value: CountdownValue): Theme {
  if (value === "BOSHLANDI") return THEMES.start;
  if (value === 1) return THEMES["1"];
  if (value === 2) return THEMES["2"];
  return THEMES["3"];
}

export default function GameStartCountdownOverlay({ visible, value }: Props) {
  const reduceMotion = useReducedMotion();
  const { width, height } = useViewportSize();
  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  if (!visible || value === null) return null;

  const isStarted = value === "BOSHLANDI";
  const theme = getTheme(value);
  const textGradient = `linear-gradient(135deg, ${theme.a} 0%, ${theme.b} 55%, ${theme.c} 100%)`;
  const stepKey = String(value);
  const filledPips = isStarted ? 3 : 4 - (value as number);

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[#050816] px-4">
      {/* Ekran o'quvchilar uchun */}
      <div role="status" aria-live="assertive" className="sr-only">
        {isStarted ? "O'yin boshlandi" : `${value}`}
      </div>

      {isStarted && !reduceMotion && width > 0 ? (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={230}
          gravity={0.2}
          initialVelocityY={18}
          colors={["#fde047", "#fb7185", "#22d3ee", "#34d399", "#a78bfa", "#ffffff"]}
        />
      ) : null}

      {/* ───── Fon: har bosqichda rangi almashadigan yorug'lik ───── */}
      <AnimatePresence>
        <motion.div
          key={`glow-${stepKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          style={{ background: `radial-gradient(circle at 50% 46%, ${theme.glow} 0%, transparent 52%)` }}
        />
      </AnimatePresence>

      {/* Aylanuvchi nurlar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.div
          className="h-[190vmax] w-[190vmax] opacity-70"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.075) 0deg 5deg, transparent 5deg 16deg)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 34%)",
            maskImage: "radial-gradient(circle, black 0%, transparent 34%)",
          }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 70, ease: "linear", repeat: Infinity }}
        />
      </div>

      {/* Chetlarni qoraytiruvchi vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,6,23,0.85) 100%)" }}
      />

      {/* Yuqoriga ko'tariluvchi zarrachalar */}
      {!reduceMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute bottom-0 rounded-full"
              style={{
                left: `${particle.left}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: theme.a,
                boxShadow: `0 0 12px ${theme.a}`,
              }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: "-105vh", x: particle.drift, opacity: [0, 0.8, 0] }}
              transition={{ duration: particle.duration, delay: particle.delay, ease: "easeOut", repeat: Infinity }}
            />
          ))}
        </div>
      )}

      {/* Boshlanish payti: oq chaqnash */}
      {isStarted && !reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-white"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* ───── Markaziy qism ───── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Bosqich nuqtalari */}
        <div className="mb-5 flex items-center gap-2.5" aria-hidden="true">
          {[0, 1, 2].map((index) => {
            const filled = index < filledPips;
            return (
              <motion.span
                key={index}
                className="h-2.5 rounded-full"
                animate={{ width: filled ? 34 : 10, opacity: filled ? 1 : 0.28 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                style={{ background: filled ? textGradient : "#ffffff" }}
              />
            );
          })}
        </div>

        <p className="mb-6 text-base font-bold tracking-wide text-white/75 sm:text-lg">
          {isStarted ? "Hammasi tayyor" : "Tayyorlaning"}
        </p>

        {/* Halqa va raqam */}
        <div className="relative aspect-square w-[min(74vw,44svh,360px)]">
          {/* Har bosqichda tarqaluvchi to'lqin */}
          {!reduceMotion &&
            (isStarted ? [0, 0.18, 0.36] : [0]).map((delay) => (
              <motion.span
                key={`wave-${stepKey}-${delay}`}
                aria-hidden="true"
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: theme.a }}
                initial={{ scale: 0.7, opacity: 0.75 }}
                animate={{ scale: isStarted ? 2.6 : 1.9, opacity: 0 }}
                transition={{ duration: isStarted ? 1.1 : 0.9, delay, ease: "easeOut" }}
              />
            ))}

          {/* Halqa */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90 overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={theme.a} />
                <stop offset="0.55" stopColor={theme.b} />
                <stop offset="1" stopColor={theme.c} />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="5" />
            <motion.circle
              key={`ring-${stepKey}`}
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              style={{ filter: `drop-shadow(0 0 7px ${theme.a})` }}
              initial={{ strokeDashoffset: isStarted || reduceMotion ? 0 : 0 }}
              animate={{ strokeDashoffset: isStarted || reduceMotion ? 0 : RING_LENGTH }}
              transition={{ duration: STEP_SECONDS, ease: "linear" }}
            />
          </svg>

          {/* Ichki yorug' disk */}
          <div
            aria-hidden="true"
            className="absolute inset-[7%] rounded-full border border-white/10"
            style={{
              background: `radial-gradient(circle at 50% 35%, rgba(255,255,255,0.10), rgba(2,6,23,0.55) 70%)`,
              boxShadow: `inset 0 0 60px ${theme.glow}`,
            }}
          />

          {/* Raqam yoki raketa */}
          <AnimatePresence>
            {!isStarted ? (
              <motion.div
                key={`num-${stepKey}`}
                className="absolute inset-0 grid place-items-center"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2.1, filter: "blur(14px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.55, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 280, damping: 20, mass: 0.7 }}
              >
                {/* Aks-sado: tashqariga kengayuvchi kontur */}
                {!reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute font-black leading-none text-transparent"
                    style={{ fontSize: "clamp(6.5rem, min(34vw, 24svh), 11.5rem)", WebkitTextStroke: `2px ${theme.a}` }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 0.85, ease: "easeOut" }}
                  >
                    {value}
                  </motion.span>
                )}
                <span
                  className="relative bg-clip-text font-black leading-none tabular-nums text-transparent"
                  style={{
                    fontSize: "clamp(6.5rem, min(34vw, 24svh), 11.5rem)",
                    backgroundImage: textGradient,
                    filter: `drop-shadow(0 0 26px ${theme.glow})`,
                  }}
                >
                  {value}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="rocket"
                className="absolute inset-0 grid place-items-center"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 90, scale: 0.4 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 190, damping: 13 }}
              >
                {/* Chiqish alangasi */}
                {!reduceMotion && (
                  <motion.span
                    aria-hidden="true"
                    className="absolute left-1/2 top-[62%] h-[22%] w-[9%] -translate-x-1/2 rounded-full blur-md"
                    style={{ background: "linear-gradient(to bottom, #fde047, #fb923c, transparent)" }}
                    animate={{ scaleY: [0.7, 1.35, 0.8], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.35, repeat: Infinity }}
                  />
                )}
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                  style={{ filter: `drop-shadow(0 0 22px ${theme.a})` }}
                >
                  <FaRocket
                    className="-rotate-45"
                    style={{ width: "34%", height: "34%", minWidth: 84, minHeight: 84, color: "#ffffff" }}
                  />
                </motion.div>

                {/* Yulduzlar portlashi */}
                {!reduceMotion &&
                  BURST_STARS.map((star) => (
                    <motion.span
                      key={star.id}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2"
                      style={{ marginLeft: -star.size / 2, marginTop: -star.size / 2, color: theme.a }}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                      animate={{ x: star.x, y: star.y, scale: [0, 1.25, 0], opacity: [1, 1, 0], rotate: 200 }}
                      transition={{ duration: 1.1, delay: 0.12, ease: "easeOut" }}
                    >
                      <FaStar style={{ width: star.size, height: star.size }} />
                    </motion.span>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pastki matn */}
        <div className="mt-8 min-h-[7rem]">
          <AnimatePresence mode="wait">
            {!isStarted ? (
              <motion.p
                key={`hint-${stepKey}`}
                className="text-lg font-semibold text-white/85 sm:text-xl"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {theme.hint}
              </motion.p>
            ) : (
              <motion.div key="started-text" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.15 } } }}>
                <h2
                  className="flex justify-center text-[clamp(2.4rem,11vw,4.25rem)] font-black leading-none tracking-tight text-white"
                  style={{ textShadow: `0 0 34px ${theme.a}, 0 4px 0 rgba(0,0,0,0.25)` }}
                  aria-label="BOSHLANDI!"
                >
                  {"BOSHLANDI!".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      aria-hidden="true"
                      className="inline-block"
                      variants={{
                        hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.6 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 16 } },
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </h2>
                <motion.p
                  className="mt-4 text-lg font-semibold text-white/80"
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.45 } } }}
                >
                  {theme.hint}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}