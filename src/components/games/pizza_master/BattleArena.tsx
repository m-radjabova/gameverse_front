import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaCheck, FaClock, FaCrown, FaFire, FaLock, FaPizzaSlice, FaStar, FaBolt } from "react-icons/fa";
import { GiPizzaCutter } from "react-icons/gi";
import coinImage from "./images/coin.png";
import PizzaCanvas from "./PizzaCanvas";
import { PIZZA_INGREDIENTS, PIZZA_MAX_CORRECT_ANSWERS } from "./pizzaData";
import xpStarImage from "./images/xp-star.png";
import type { PizzaPlayer, PizzaQuestion, PizzaSkillId } from "./types";

type Props = {
  players: PizzaPlayer[];
  answered: [boolean, boolean];
  question: PizzaQuestion;
  timeLeft: number;
  roundSeconds: number;
  frozenPlayers: [boolean, boolean];
  shuffledPlayers: [boolean, boolean];
  onUseSkill: (playerIndex: number, skill: PizzaSkillId) => void;
  onAnswer: (playerIndex: number, answer: number) => void;
  disabled: boolean;
};

const skillLabels: Record<PizzaSkillId, string> = {
  freeze: "Freeze",
  shuffle: "Shuffle",
  "extra-time": "+2s",
  "double-slice": "Double",
};

const skillDescriptions: Record<PizzaSkillId, string> = {
  freeze: "Raqib 1s bloklanadi",
  shuffle: "Raqib variantlari aralashadi",
  "extra-time": "Umumiy vaqt +2s",
  "double-slice": "Keyingi to'g'ri javob +1 progress",
};
const answerColors = [
  { bg: "#f97316", text: "A", shadow: "#c2410c" },
  { bg: "#22c55e", text: "B", shadow: "#15803d" },
  { bg: "#0ea5e9", text: "C", shadow: "#0369a1" },
  { bg: "#a855f7", text: "D", shadow: "#7e22ce" },
];

export default function BattleArena({
  players,
  answered,
  question,
  timeLeft,
  roundSeconds,
  frozenPlayers,
  shuffledPlayers,
  onUseSkill,
  onAnswer,
  disabled,
}: Props) {
  const [comboEffect, setComboEffect] = useState<number | null>(null);
  const prevIngredients = useRef([0, 0]);

  useEffect(() => {
    players.forEach((p, i) => {
      if (p.ingredients > prevIngredients.current[i]) {
        setComboEffect(i);
        setTimeout(() => setComboEffect(null), 1200);
      }
      prevIngredients.current[i] = p.ingredients;
    });
  }, [players]);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 gap-3 relative" style={{background: "linear-gradient(180deg, #0f0c29, #302b63, #24243e)"}}>
      {/* 3D Cartoon Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating cartoon clouds */}
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-[10%] left-[5%] text-5xl select-none opacity-20">☁️</motion.div>
        <motion.div animate={{ x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 1 }} className="absolute top-[15%] right-[10%] text-4xl select-none opacity-20">☁️</motion.div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute bottom-[25%] left-[8%] text-3xl select-none opacity-15">⭐</motion.div>
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-[30%] right-[5%] text-3xl select-none opacity-15">✨</motion.div>
        
        {/* 3D floating pizza slices */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-[40%] left-[3%] text-6xl select-none opacity-10"
        >
          🍕
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7, delay: 2 }}
          className="absolute top-[50%] right-[3%] text-6xl select-none opacity-10"
        >
          🍕
        </motion.div>

        {/* Colorful cartoon orbs */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full" style={{background: "radial-gradient(circle, rgba(251,146,60,0.15), transparent)", filter: "blur(60px)"}} />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full" style={{background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)", filter: "blur(60px)"}} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full" style={{background: "radial-gradient(circle, rgba(168,85,247,0.1), transparent)", filter: "blur(70px)"}} />
      </div>

      {/* Top HUD - 3D Cartoon Card */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="pm-hud relative z-10 flex items-center justify-between gap-3 rounded-[30px] px-5 py-4 backdrop-blur-xl"
        style={{
          background: undefined,
          border: undefined,
          boxShadow: undefined,
        }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-orange-500/30 rounded-xl blur-lg" />
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl text-xl text-white"
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                boxShadow: "0 4px 15px rgba(249,115,22,0.4), inset 0 2px 0 rgba(255,255,255,0.3)",
              }}
            >
              <FaPizzaSlice />
            </div>
          </motion.div>
          <div>
            <p className="text-xl font-black text-white tracking-tight" style={{textShadow: "0 2px 4px rgba(0,0,0,0.3)"}}>
              PIZZA <span style={{background: "linear-gradient(135deg, #fbbf24, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>MASTER</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{color: "rgba(251,146,60,0.7)"}}>
              {question.difficulty === "chef" ? "Chef Challenge · 2 Players" : "Battle Mode · 2 Players"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CartoonBadge icon={<img src={xpStarImage} alt="" className="h-5 w-5 object-contain" />} value={`${players[0].xp + players[1].xp} XP`} />
          <CartoonBadge icon={<img src={coinImage} alt="" className="h-5 w-5 object-contain" />} value={`${players[0].coins + players[1].coins}`} />
          <motion.div
            animate={timeLeft < 5 ? { scale: [1, 1.12, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{
              background: timeLeft < 5 ? "linear-gradient(135deg, rgba(239,68,68,0.3), rgba(220,38,38,0.2))" : "linear-gradient(135deg, rgba(251,146,60,0.2), rgba(234,88,12,0.1))",
              border: `2px solid ${timeLeft < 5 ? "rgba(239,68,68,0.4)" : "rgba(251,146,60,0.3)"}`,
              boxShadow: timeLeft < 5 ? "0 0 25px rgba(239,68,68,0.2)" : "none",
            }}
          >
            <FaClock style={{color: timeLeft < 5 ? "#ef4444" : "#fb923c"}} />
            <span className="text-xl font-black font-mono tracking-wider" style={{color: timeLeft < 5 ? "#ef4444" : "white"}}>
              {String(timeLeft).padStart(2, "0")}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Battle Arena */}
      <div className="flex-1 grid gap-3 lg:grid-cols-2 min-h-0 relative">
        {/* VS Divider - 3D Cartoon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", damping: 10, stiffness: 150 }}
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex-col items-center"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl" style={{background: "linear-gradient(135deg, #f97316, #ef4444)", opacity: 0.5}} />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white"
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                boxShadow: "0 8px 40px rgba(249,115,22,0.5), inset 0 3px 0 rgba(255,255,255,0.4)",
                border: "3px solid rgba(255,255,255,0.2)",
                textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              VS
            </div>
            {/* Sparkle effects */}
            <motion.div
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="absolute -top-2 -right-2 text-xl"
            >
              ✨
            </motion.div>
          </div>
          <motion.p
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-3 text-[10px] font-black uppercase tracking-[0.25em]"
            style={{color: "rgba(251,146,60,0.6)"}}
          >
            ⚡ Bir vaqtda javob
          </motion.p>
        </motion.div>

        <PlayerSide player={players[0]} playerIndex={0} answered={answered[0]} question={question} timeLeft={timeLeft} roundSeconds={roundSeconds} frozen={frozenPlayers[0]} shuffled={shuffledPlayers[0]} onUseSkill={onUseSkill} onAnswer={onAnswer} disabled={disabled} tone="red" comboEffect={comboEffect === 0} />
        <PlayerSide player={players[1]} playerIndex={1} answered={answered[1]} question={question} timeLeft={timeLeft} roundSeconds={roundSeconds} frozen={frozenPlayers[1]} shuffled={shuffledPlayers[1]} onUseSkill={onUseSkill} onAnswer={onAnswer} disabled={disabled} tone="blue" comboEffect={comboEffect === 1} />
      </div>

      {/* Bottom Progress - Cartoon */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15, delay: 0.2 }}
        className="pm-card relative z-10 rounded-[30px] p-5 backdrop-blur-xl"
        style={{
          background: undefined,
          border: undefined,
          boxShadow: undefined,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GiPizzaCutter className="text-2xl" style={{color: "#fb923c"}} />
            <p className="text-sm font-black uppercase tracking-[0.15em]" style={{color: "rgba(255,255,255,0.6)"}}>Ingredient Order</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border-2" style={{background: "linear-gradient(135deg, #ef4444, #dc2626)", borderColor: "rgba(239,68,68,0.4)"}} />
              <div className="w-7 h-7 rounded-full border-2" style={{background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderColor: "rgba(59,130,246,0.4)"}} />
            </div>
            <div className="w-28 h-3 rounded-full overflow-hidden" style={{background: "rgba(255,255,255,0.1)"}}>
              <motion.div
                animate={{ width: `${(Math.max(players[0].correctAnswers, players[1].correctAnswers) / PIZZA_MAX_CORRECT_ANSWERS) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #f97316, #ef4444, #a855f7)",
                  boxShadow: "0 0 15px rgba(249,115,22,0.3)",
                }}
              />
            </div>
          </div>
        </div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${PIZZA_INGREDIENTS.length}, minmax(0, 1fr))` }}
        >
          {PIZZA_INGREDIENTS.map((item, i) => {
            const unlocked = i < Math.max(players[0].ingredients, players[1].ingredients);
            return (
              <motion.div key={item.id} whileHover={{ y: -4 }} className="text-center">
                <motion.div
                  animate={unlocked ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border-2 transition-all duration-500"
                  style={{
                    background: unlocked ? "linear-gradient(135deg, rgba(132,204,22,0.3), rgba(16,185,129,0.2))" : "rgba(255,255,255,0.05)",
                    borderColor: unlocked ? "rgba(132,204,22,0.5)" : "rgba(255,255,255,0.1)",
                    boxShadow: unlocked ? "0 0 25px rgba(132,204,22,0.3)" : "none",
                  }}
                >
                  {unlocked ? <FaCheck className="text-sm" style={{color: "#a3e635"}} /> : <FaLock className="text-sm" style={{color: "rgba(255,255,255,0.2)"}} />}
                </motion.div>
                <p className="mt-1.5 text-[10px] font-bold transition-colors" style={{color: unlocked ? "#a3e635" : "rgba(255,255,255,0.3)"}}>
                  {item.name}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function PlayerSide({ player, playerIndex, answered, question, timeLeft, roundSeconds, frozen, shuffled, onUseSkill, onAnswer, disabled, tone, comboEffect }: {
  player: PizzaPlayer; playerIndex: number; answered: boolean;
  question: PizzaQuestion; timeLeft: number; roundSeconds: number; frozen: boolean; shuffled: boolean;
  onUseSkill: (playerIndex: number, skill: PizzaSkillId) => void;
  onAnswer: (playerIndex: number, answer: number) => void;
  disabled: boolean; tone: "red" | "blue"; comboEffect: boolean;
}) {
  const isRed = tone === "red";
  const mainColor = isRed ? "#ef4444" : "#3b82f6";
  const lightColor = isRed ? "#fca5a5" : "#93c5fd";
  const darkColor = isRed ? "#b91c1c" : "#1d4ed8";
  const bgGrad = isRed
    ? "linear-gradient(180deg, rgba(239,68,68,0.15), rgba(185,28,28,0.05))"
    : "linear-gradient(180deg, rgba(59,130,246,0.15), rgba(29,78,216,0.05))";
  const optionOrder = shuffled ? [2, 0, 3, 1] : [0, 1, 2, 3];
  const isBlocked = disabled || frozen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15, type: "spring" }}
      className="relative flex flex-col overflow-hidden rounded-[30px] p-4 sm:p-5"
      style={{
        background: bgGrad,
        border: `3px solid ${isRed ? "rgba(248,113,113,0.32)" : "rgba(96,165,250,0.32)"}`,
        boxShadow: `0 12px 0 rgba(0,0,0,0.24), 0 28px 54px rgba(0,0,0,0.32), inset 0 2px 0 ${isRed ? "rgba(248,113,113,0.28)" : "rgba(96,165,250,0.28)"}`,
      }}
    >
      {/* 3D Cartoon Shine */}
      <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-3xl" style={{
        background: `linear-gradient(180deg, ${isRed ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)"}, transparent)`,
      }} />
      
      {/* Combo Effect */}
      <AnimatePresence>
        {comboEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1.3, y: -20 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          >
            <div className="text-7xl font-black" style={{
              background: "linear-gradient(135deg, #fbbf24, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(251,191,36,0.6)",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            }}>
              +1
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar - Cartoon 3D style */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-2xl blur-md" style={{background: mainColor, opacity: 0.3}} />
            <div
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${mainColor}, ${darkColor})`,
                boxShadow: `0 4px 15px ${mainColor}40, inset 0 2px 0 ${lightColor}60`,
              }}
            >
              <FaCrown className={player.ingredients >= Math.ceil(PIZZA_INGREDIENTS.length / 2) ? "text-yellow-300" : "text-white/60"} />
            </div>
          </motion.div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-white" style={{textShadow: "0 2px 4px rgba(0,0,0,0.3)"}}>
                {player.name}
              </p>
              <motion.span
                animate={answered ? { scale: [1, 1.3, 1] } : {}}
                className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: answered ? "rgba(255,255,255,0.1)" : `${mainColor}30`,
                  color: answered ? "rgba(255,255,255,0.4)" : lightColor,
                  border: answered ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${mainColor}50`,
                }}
              >
                {answered ? "Tayyor" : frozen ? "Freeze" : shuffled ? "Shuffle" : "Javob"}
              </motion.span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <motion.span
                animate={player.combo > 0 ? { scale: [1, 1.15, 1] } : {}}
                className="flex items-center gap-1.5 text-sm"
              >
                <FaStar style={{color: "#fbbf24", filter: "drop-shadow(0 0 5px rgba(251,191,36,0.5))"}} />
                <span style={{color: "#fde68a", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.2)"}}>{player.xp} XP</span>
              </motion.span>
              <motion.span
                animate={player.combo > 0 ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 text-sm"
              >
                <FaFire style={{color: player.combo >= 3 ? "#fb923c" : "#9a3412"}} />
                <span style={{color: player.combo >= 3 ? "#fdba74" : "#c2410c", fontWeight: 700}}>x{player.combo}</span>
              </motion.span>
            </div>
          </div>
        </div>
        <div className="text-4xl font-black select-none" style={{color: `${mainColor}30`}}>
          {isRed ? "P1" : "P2"}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid min-h-[280px] gap-4 lg:grid-cols-[minmax(210px,0.9fr)_minmax(0,1.1fr)]">
        {/* Pizza Display */}
        <div className="pm-stage flex min-h-[235px] flex-col items-center justify-center rounded-[26px] px-3 py-2">
          <motion.div
            animate={comboEffect ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <PizzaCanvas unlocked={player.ingredients} label={`${player.name} pizzasi`} compact />
          </motion.div>
          <div
            className="mt-2 grid w-full gap-1"
            style={{ gridTemplateColumns: `repeat(${PIZZA_INGREDIENTS.length}, minmax(0, 1fr))` }}
          >
            {PIZZA_INGREDIENTS.map((item, i) => (
              <motion.div
                key={item.id}
                animate={i < player.ingredients ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="h-2.5 rounded-full transition-all duration-500"
                style={{
                  background: i < player.ingredients
                    ? "linear-gradient(90deg, #fb923c, #fbbf24)"
                    : "rgba(255,255,255,0.1)",
                  boxShadow: i < player.ingredients ? "0 0 12px rgba(251,191,36,0.5)" : "none",
                }}
              />
            ))}
          </div>
          <div className="mt-3 min-h-[42px] w-full">
            {player.skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {player.skills.slice(0, 4).map((skill, index) => (
                  <button
                    key={`${skill}-${index}`}
                    disabled={disabled || answered}
                    onClick={() => onUseSkill(playerIndex, skill)}
                    className="pm-answer rounded-xl border border-orange-400/30 bg-orange-500/15 px-2 py-1.5 text-[10px] font-black text-orange-100 transition hover:bg-orange-500/25 disabled:opacity-40"
                    title={skillDescriptions[skill]}
                  >
                    {skillLabels[skill]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-[10px] font-bold text-white/25">Combo x3 da skill ochiladi</p>
            )}
          </div>
        </div>

        {/* Question Panel - 3D Cartoon Card */}
        <motion.div
          animate={answered ? { opacity: 0.4, y: 5 } : { opacity: 1, y: 0 }}
          className="pm-card rounded-[26px] p-4 backdrop-blur"
          style={{
            background: answered ? "rgba(0,0,0,0.2)" : undefined,
            border: answered ? "2px solid rgba(255,255,255,0.05)" : undefined,
            boxShadow: answered ? "none" : undefined,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FaBolt style={{color: lightColor}} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{color: "rgba(251,146,60,0.7)"}}>
              {question.difficulty === "chef" ? "Chef Challenge" : "Savol"}
            </p>
          </div>
          <h2 className="text-center text-2xl font-black text-white mb-4 leading-tight" style={{textShadow: "0 2px 4px rgba(0,0,0,0.3)"}}>
            {question.prompt}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {optionOrder.map((originalIndex, visualIndex) => {
              const option = question.options[originalIndex];
              const c = answerColors[visualIndex];
              return (
                <motion.button
                  whileHover={!answered && !isBlocked ? { scale: 1.05, y: -3 } : {}}
                  whileTap={!answered && !isBlocked ? { scale: 0.95 } : {}}
                  key={`${option}-${originalIndex}`}
                  disabled={answered || isBlocked}
                  onClick={() => onAnswer(playerIndex, originalIndex)}
                  className="pm-answer relative min-h-14 overflow-hidden rounded-2xl text-xl font-black transition-all duration-200"
                  style={{
                    background: answered || isBlocked ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${c.bg}30, ${c.bg}10)`,
                    border: `2px solid ${answered || isBlocked ? "rgba(255,255,255,0.1)" : `${c.bg}50`}`,
                    color: answered || isBlocked ? "rgba(255,255,255,0.3)" : `${c.bg}`,
                    boxShadow: answered || isBlocked ? "none" : `0 4px 0 ${c.shadow}, 0 8px 20px rgba(0,0,0,0.2)`,
                    textShadow: answered || isBlocked ? "none" : "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700" style={{background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"}} />
                  {option}
                </motion.button>
              );
            })}
          </div>
          {player.lastEvent && (
            <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-center text-[10px] font-black text-lime-200">
              {player.lastEvent}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <FaClock className="text-sm" style={{color: timeLeft < 5 ? "#ef4444" : "#fb923c"}} />
            <div className="h-2.5 flex-1 rounded-full overflow-hidden" style={{background: "rgba(255,255,255,0.1)"}}>
              <motion.div
                animate={{ width: `${(timeLeft / roundSeconds) * 100}%` }}
                className="h-full rounded-full"
                style={{
                  background: timeLeft < 5
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : "linear-gradient(90deg, #f97316, #fbbf24)",
                  boxShadow: timeLeft < 5 ? "0 0 15px rgba(239,68,68,0.5)" : "none",
                }}
              />
            </div>
            <motion.span
              animate={timeLeft < 5 ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="text-sm font-mono font-bold"
              style={{color: timeLeft < 5 ? "#ef4444" : "white"}}
            >
              {timeLeft}s
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Ingredient Progress - Cartoon */}
      <motion.div
        animate={comboEffect ? { boxShadow: ["0 0 0px rgba(251,146,60,0)", "0 0 30px rgba(251,146,60,0.3)", "0 0 0px rgba(251,146,60,0)"] } : {}}
        transition={{ duration: 0.8 }}
        className="pm-chip mt-3 rounded-2xl p-3 backdrop-blur"
        style={{
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{color: "rgba(255,255,255,0.4)"}}>Ingredientlar</p>
          <motion.span
            animate={player.ingredients > 0 ? { scale: [1, 1.2, 1] } : {}}
            className="text-sm font-black"
            style={{
              background: "linear-gradient(135deg, #fb923c, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {player.correctAnswers}/{PIZZA_MAX_CORRECT_ANSWERS} savol
          </motion.span>
        </div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${PIZZA_INGREDIENTS.length}, minmax(0, 1fr))` }}
        >
          {PIZZA_INGREDIENTS.map((item, i) => {
            return (
              <div key={item.id} className="text-center">
                <motion.span
                  animate={i < player.ingredients ? { y: [0, -4, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="grid place-items-center text-lg transition-all duration-500"
                  style={{
                    color: i < player.ingredients ? "#fb923c" : "rgba(255,255,255,0.15)",
                    filter: i < player.ingredients ? "drop-shadow(0 0 12px rgba(251,146,60,0.6))" : "none",
                  }}
                >
                  {i < player.ingredients ? <img src={item.image} alt="" className="h-6 w-6 object-contain" /> : <FaLock className="text-xs" />}
                </motion.span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 h-2.5 rounded-full overflow-hidden" style={{background: "rgba(255,255,255,0.1)"}}>
          <motion.div
            animate={{ width: `${(player.correctAnswers / PIZZA_MAX_CORRECT_ANSWERS) * 100}%` }}
            transition={{ duration: 0.5, type: "spring" }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #f97316, #ef4444, #fbbf24)",
              boxShadow: "0 0 15px rgba(251,146,60,0.3)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function CartoonBadge({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <motion.span
      whileHover={{ scale: 1.08, y: -2 }}
      className="pm-chip inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-black backdrop-blur"
      style={{
        color: "rgba(255,255,255,0.8)",
      }}
    >
      {icon}{value}
    </motion.span>
  );
}
