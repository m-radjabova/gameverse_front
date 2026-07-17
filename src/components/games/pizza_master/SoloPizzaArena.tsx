import { motion } from "framer-motion";
import { FaCheck, FaClock, FaFire, FaLock, FaPizzaSlice } from "react-icons/fa";
import coinImage from "./images/coin.png";
import chefImage from "./images/generated/pizza-chef.png";
import xpStarImage from "./images/xp-star.png";
import PizzaCanvas from "./PizzaCanvas";
import { CORRECT_ANSWERS_PER_INGREDIENT, PIZZA_INGREDIENTS, PIZZA_MAX_CORRECT_ANSWERS } from "./pizzaData";
import type { PizzaPlayer, PizzaQuestion } from "./types";

type Props = {
  player: PizzaPlayer;
  question: PizzaQuestion;
  timeLeft: number;
  roundSeconds: number;
  onAnswer: (index: number) => void;
  disabled: boolean;
};

const answerTones = [
  "from-amber-500/20 to-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/20 hover:shadow-[0_0_20px_rgba(251,146,60,0.3)]",
  "from-lime-500/20 to-emerald-500/20 border-lime-500/40 text-lime-300 hover:bg-lime-500/20 hover:shadow-[0_0_20px_rgba(132,204,22,0.3)]",
  "from-sky-500/20 to-cyan-500/20 border-sky-500/40 text-sky-300 hover:bg-sky-500/20 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]",
  "from-violet-500/20 to-fuchsia-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
];

export default function SoloPizzaArena({ player, question, timeLeft, roundSeconds, onAnswer, disabled }: Props) {
  const xpTarget = PIZZA_MAX_CORRECT_ANSWERS * 100;
  const xpPercent = Math.min(100, (player.xp / xpTarget) * 100);
  const currentIngredient = PIZZA_INGREDIENTS[player.ingredients];
  const ingredientStep = player.correctAnswers % CORRECT_ANSWERS_PER_INGREDIENT;
  const isChefChallenge = question.difficulty === "chef";

  return (
    <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-4 gap-4">
      {/* Top HUD */}
      <div className="pm-hud flex items-center justify-between gap-3 rounded-[28px] px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-fuchsia-500 text-xl text-white shadow-[0_8px_0_rgba(127,29,29,0.55),0_0_28px_rgba(249,115,22,0.45)]">
            <FaPizzaSlice />
          </div>
          <div>
            <p className="text-lg font-black text-white">PIZZA <span className="text-orange-400">MASTER</span></p>
            <p className="text-xs font-bold text-orange-400/70">{isChefChallenge ? "CHEF CHALLENGE" : "SOLO MODE"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HudMetric icon={<img src={xpStarImage} alt="" className="h-5 w-5 object-contain" />} label="XP" value={`${player.xp} / ${xpTarget}`} tone="text-yellow-400" progress={xpPercent} />
          <HudMetric icon={<img src={coinImage} alt="" className="h-5 w-5 object-contain" />} label="Coins" value={`${player.coins}`} tone="text-orange-400" />
          <HudMetric icon={<FaFire />} label="Combo" value={`x${player.combo}`} tone="text-red-400" />
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30">
            <FaClock className={`${timeLeft < 5 ? "text-red-400 animate-pulse" : "text-orange-400"}`} />
            <span className={`text-lg font-black font-mono ${timeLeft < 5 ? "text-red-400" : "text-white"}`}>{`00:${String(timeLeft).padStart(2, "0")}`}</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 grid gap-4 lg:grid-cols-[220px_1fr_1fr] min-h-0">
        {/* Left Sidebar - Ingredients */}
        <aside className="pm-card overflow-auto rounded-[28px] p-4 backdrop-blur">
          <h2 className="text-center text-lg font-black text-white/80 uppercase tracking-wider mb-4">Ingredientlar</h2>
          <div className="space-y-2">
            {PIZZA_INGREDIENTS.map((ingredient, index) => {
              const unlocked = index < player.ingredients;
              return (
                <div key={ingredient.id} className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-500 ${
                  unlocked ? "bg-orange-500/15 border-2 border-orange-400/30 shadow-[0_6px_0_rgba(0,0,0,0.18)]" : "bg-white/6 border-2 border-white/8"
                }`}>
                  <span className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                    unlocked
                      ? "bg-gradient-to-br from-yellow-400 to-red-500 text-white shadow-[0_6px_0_rgba(127,29,29,0.35),0_0_15px_rgba(251,146,60,0.3)]"
                      : "bg-white/10 text-white/30"
                  }`}>
                    <img src={ingredient.image} alt="" className="h-7 w-7 object-contain" />
                  </span>
                  <span className={`flex-1 text-sm font-bold ${unlocked ? "text-white" : "text-white/30"}`}>
                    {ingredient.name}
                    <span className="mt-0.5 block text-[10px] font-black text-white/35">{ingredient.power}</span>
                  </span>
                  <span className={`grid h-7 w-7 place-items-center rounded-full transition-all ${
                    unlocked ? "bg-lime-500 text-white shadow-[0_0_10px_rgba(132,204,22,0.4)]" : "bg-white/10 text-white/30"
                  }`}>
                    {unlocked ? <FaCheck className="text-xs" /> : <FaLock className="text-xs" />}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pm-chip mt-4 rounded-2xl p-3 text-center">
            <p className="text-xs font-black text-orange-300">+ Har to'g'ri javob: 100 XP</p>
            <p className="mt-1 text-[10px] font-bold text-white/50">Har ingredient uchun {CORRECT_ANSWERS_PER_INGREDIENT} ta misol</p>
            {player.lastEvent && <p className="mt-2 text-[10px] font-black text-lime-300">{player.lastEvent}</p>}
          </div>
        </aside>

        {/* Center - Pizza Display */}
        <section className="pm-stage relative flex flex-col items-center justify-center overflow-hidden rounded-[30px] p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400" />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]" />
          <p className="pm-chip absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-orange-200 backdrop-blur">
            {currentIngredient ? `${currentIngredient.name} ${ingredientStep}/${CORRECT_ANSWERS_PER_INGREDIENT}` : "Pizza Complete"}
          </p>
          <div className="relative z-10 w-full max-w-[400px]">
            <PizzaCanvas unlocked={player.ingredients} />
          </div>
          <div className="mt-4 flex max-w-full flex-wrap justify-center gap-2">
            {PIZZA_INGREDIENTS.map((ingredient, index) => (
              <div
                key={ingredient.id}
                className={`grid h-10 w-10 place-items-center rounded-2xl border-2 transition-all duration-500 ${
                  index < player.ingredients
                    ? "border-lime-400 bg-lime-400/20 shadow-[0_0_12px_rgba(132,204,22,0.4)]"
                    : "border-dashed border-white/20 bg-transparent"
                }`}
              >
                <img src={ingredient.image} alt="" className={`h-6 w-6 object-contain transition-opacity ${index < player.ingredients ? "opacity-100" : "opacity-25 grayscale"}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Right - Question Panel */}
        <section className="pm-card relative flex flex-col rounded-[30px] p-6 backdrop-blur">
          <div className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-xl px-8 py-2 text-lg font-black text-white shadow-lg ${
            isChefChallenge ? "bg-gradient-to-r from-fuchsia-500 to-red-500 shadow-fuchsia-500/30" : "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-500/30"
          }`}>
            {isChefChallenge ? "Chef Challenge" : "Savol"}
          </div>
          <p className="mt-6 text-center text-xs font-black uppercase tracking-wider text-orange-400">
            {player.name} javob beradi
          </p>
          <h2 className="my-6 text-center text-3xl font-black text-white sm:text-4xl">
            {question.prompt}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 flex-1">
            {question.options.map((option, index) => (
              <motion.button
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={option}
                disabled={disabled}
                onClick={() => onAnswer(index)}
                className={`pm-answer min-h-16 rounded-2xl border-2 bg-gradient-to-br text-2xl font-black transition-all duration-200 ${
                  disabled ? "opacity-40 cursor-not-allowed" : "hover:shadow-lg"
                } ${answerTones[index]}`}
              >
                {option}
              </motion.button>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-3 pt-6">
            <FaClock className={`text-2xl ${timeLeft < 5 ? "text-red-400 animate-pulse" : "text-orange-400"}`} />
            <div className="h-4 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeLeft < 5 ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-yellow-400"
                }`}
                style={{ width: `${(timeLeft / roundSeconds) * 100}%` }}
              />
            </div>
            <span className={`min-w-10 text-sm font-mono font-black ${timeLeft < 5 ? "text-red-400" : "text-white"}`}>{timeLeft}s</span>
          </div>
        </section>
      </div>

      {/* Bottom Progress + Chef */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="pm-card rounded-[26px] p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-white/80 uppercase tracking-wider">Pizza Progress</h2>
            <span className="text-2xl font-black text-orange-400">{Math.round((player.correctAnswers / PIZZA_MAX_CORRECT_ANSWERS) * 100)}%</span>
          </div>
          <div
            className="relative grid gap-2"
            style={{ gridTemplateColumns: `repeat(${PIZZA_INGREDIENTS.length}, minmax(0, 1fr))` }}
          >
            {PIZZA_INGREDIENTS.map((ingredient, index) => (
              <div key={ingredient.id} className="relative z-10 text-center">
                <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full border-2 transition-all duration-500 ${
                  index < player.ingredients
                    ? "border-lime-500 bg-lime-500/20 text-lime-400 shadow-[0_0_15px_rgba(132,204,22,0.3)]"
                    : "border-white/10 bg-white/5 text-white/30"
                }`}>
                  {index < player.ingredients ? <img src={ingredient.image} alt="" className="h-9 w-9 object-contain" /> : <FaLock />}
                </div>
                <p className="mt-2 text-[10px] font-bold text-gray-500">{ingredient.name}</p>
                {!index || index >= player.ingredients ? null : <p className="text-[9px] font-black text-lime-400">2/2</p>}
              </div>
            ))}
            <div className="absolute left-[5%] right-[5%] top-6 h-1 bg-white/10" />
            <div
              className="absolute left-[5%] top-6 h-1 bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${Math.min(90, (player.correctAnswers / PIZZA_MAX_CORRECT_ANSWERS) * 90)}%` }}
            />
          </div>
        </section>

        <section className="pm-card relative overflow-hidden rounded-[26px] p-4">
          <img src={chefImage} alt="Pizza oshpazi" className="absolute -bottom-2 left-2 h-36 w-32 object-contain object-bottom opacity-80" />
          <div className="ml-28 flex h-full items-center min-h-[100px]">
            <p className="text-lg font-black leading-7 text-orange-200">
              To'g'ri javob bering va pizzani tayyorlang!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function HudMetric({ icon, label, value, tone, progress }: { icon: React.ReactNode; label: string; value: string; tone: string; progress?: number }) {
  return (
    <div className="pm-chip flex items-center gap-2 rounded-2xl px-3 py-2">
      <span className={`text-lg ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <div className="flex justify-between gap-2 text-xs font-black">
          <span className="text-white/50">{label}</span>
          <span className="text-white">{value}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
