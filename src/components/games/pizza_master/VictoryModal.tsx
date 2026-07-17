import { motion } from "framer-motion";
import Confetti from "react-confetti-boom";
import { FaClock, FaFire, FaMedal, FaRedo, FaSignOutAlt } from "react-icons/fa";
import coinImage from "./images/coin.png";
import giftBoxImage from "./images/gift-box.png";
import pizzaMasterBadge from "./images/pizza-master-badge.png";
import xpStarImage from "./images/xp-star.png";
import type { PizzaMode, PizzaPlayer } from "./types";

type Props = { player: PizzaPlayer; mode: PizzaMode; elapsed: number; onRestart: () => void; onFinish: () => void };

export default function VictoryModal({ player, mode, elapsed, onRestart, onFinish }: Props) {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
      <Confetti mode="boom" particleCount={150} colors={["#f97316", "#facc15", "#ef4444", "#22c55e", "#a855f7"]} />
      <motion.section
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="pm-reward relative w-full max-w-md overflow-hidden rounded-[34px] p-8 text-center"
      >
        {/* Top gradient line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-orange-400 to-emerald-500" />
        
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
        
        {/* Trophy/Pizza Icon */}
        <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-[32px] bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 p-3 text-white shadow-[0_10px_0_rgba(154,52,18,0.65),0_0_46px_rgba(251,191,36,0.45)]">
          <img src={giftBoxImage} alt="Mukofot" className="h-full w-full object-contain" />
          <img src={xpStarImage} alt="" className="absolute -right-1 -top-1 h-7 w-7 animate-bounce object-contain" />
        </div>

        <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-orange-400">
          {mode === "battle" ? "🏆 G'olib" : "🍕 Pizza Tayyor"}
        </p>
        <h2 className="mt-2 text-4xl font-black text-white">
          {mode === "battle" ? `${player.name} yutdi!` : "Ajoyib pizza!"}
        </h2>
        
        <div className="pm-chip mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2">
          <FaMedal className="text-yellow-400" />
          <span className="text-sm font-black text-yellow-300">Pizza Master</span>
          <img src={pizzaMasterBadge} alt="" className="h-5 w-5 object-contain" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Metric icon={<img src={xpStarImage} alt="" className="h-5 w-5 object-contain" />} label="XP" value={`${player.xp}`} />
          <Metric icon={<img src={coinImage} alt="" className="h-5 w-5 object-contain" />} label="Coin" value={`${player.coins}`} />
          <Metric icon={<FaClock className="text-blue-400" />} label="Vaqt" value={`${elapsed}s`} />
          <Metric icon={<FaFire className="text-red-400" />} label="Eng yaxshi combo" value={`${player.bestCombo}`} />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            onClick={onFinish}
            className="pm-answer flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-4 py-3 text-sm font-black text-white/80 transition-all hover:bg-white/10"
          >
            <FaSignOutAlt /> O'yinni tugatish
          </button>
          <button
            onClick={onRestart}
            className="pm-answer flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50"
          >
            <FaRedo /> Yana o'ynash
          </button>
        </div>
      </motion.section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="pm-chip rounded-2xl p-4 text-left">
      <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
        {icon} {label}
      </span>
      <strong className="mt-1 block text-2xl font-black text-white">{value}</strong>
    </div>
  );
}
