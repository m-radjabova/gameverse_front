import { motion } from "framer-motion";
import { useState } from "react";
import { FaArrowRight, FaUser, FaUsers } from "react-icons/fa";
import pizzaMasterBadge from "./images/pizza-master-badge.png";
import { PIZZA_INGREDIENTS } from "./pizzaData";
import type { PizzaMode } from "./types";

type Props = { onSelect: (mode: PizzaMode, names?: [string, string]) => void };

export default function GameModeSelect({ onSelect }: Props) {
  const [selectedMode, setSelectedMode] = useState<PizzaMode | null>(null);
  const [names, setNames] = useState<[string, string]>(["", ""]);
  const gameStyle = (
    <style>{`
      .pm-screen {
        background:
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
          radial-gradient(circle at 20% 15%, rgba(249, 115, 22, 0.22), transparent 30%),
          radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.18), transparent 32%),
          linear-gradient(180deg, #160f2f 0%, #231447 45%, #160c25 100%);
        background-size: 42px 42px, 42px 42px, auto, auto, auto;
      }
      .pm-chip {
        border: 2px solid rgba(255,255,255,0.16);
        background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
        box-shadow: 0 5px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18);
      }
      .pm-answer {
        border-width: 3px !important;
        box-shadow: 0 7px 0 rgba(0,0,0,0.28), 0 15px 26px rgba(0,0,0,0.24), inset 0 2px 0 rgba(255,255,255,0.12);
      }
      .pm-menu-card {
        border: 3px solid rgba(255,255,255,0.14);
        background: linear-gradient(180deg, rgba(46, 35, 90, 0.95), rgba(18, 16, 46, 0.96));
        box-shadow: 0 14px 0 rgba(0,0,0,0.28), 0 34px 70px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.14);
      }
      .pm-reward {
        border: 4px solid rgba(251, 191, 36, 0.34);
        background: linear-gradient(180deg, rgba(48, 34, 84, 0.98), rgba(20, 15, 44, 0.98));
        box-shadow: 0 18px 0 rgba(0,0,0,0.3), 0 0 90px rgba(251, 146, 60, 0.28), inset 0 2px 0 rgba(255,255,255,0.16);
      }
    `}</style>
  );

  if (selectedMode) {
    const isBattle = selectedMode === "battle";
    const start = () => onSelect(selectedMode, [names[0].trim() || (isBattle ? "Player 1" : "Siz"), names[1].trim() || "Player 2"]);
    return (
      <>
      {gameStyle}
      <div className="pm-screen fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-red-900/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-[100px]" />
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="pm-reward relative mx-4 w-full max-w-md overflow-hidden rounded-[32px] p-8"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-2xl text-white mx-auto shadow-lg shadow-orange-500/30">
            {isBattle ? <FaUsers /> : <FaUser />}
          </div>
          <p className="mt-5 text-center text-xs font-black uppercase tracking-[0.2em] text-orange-400">O'yinga tayyorgarlik</p>
          <h1 className="mt-2 text-center text-3xl font-black text-white">{isBattle ? "O'yinchilar ismi" : "Ismingizni kiriting"}</h1>
          <p className="mt-2 text-center text-sm text-gray-400">{isBattle ? "Ismlarni kiriting va Pizza Battle boshlanadi." : "Natijangiz leaderboardda shu ism bilan chiqadi."}</p>
          <div className="mt-6 space-y-3">
            <input
              autoFocus
              value={names[0]}
              onChange={(event) => setNames((prev) => [event.target.value, prev[1]])}
              onKeyDown={(event) => event.key === "Enter" && start()}
              placeholder={isBattle ? "1-o'yinchi ismi" : "Ismingiz"}
              className="pm-chip w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white outline-none transition-all focus:border-orange-500 focus:bg-white/15 placeholder:text-gray-500"
            />
            {isBattle && (
              <input
                value={names[1]}
                onChange={(event) => setNames((prev) => [prev[0], event.target.value])}
                onKeyDown={(event) => event.key === "Enter" && start()}
                placeholder="2-o'yinchi ismi"
                className="pm-chip w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white outline-none transition-all focus:border-emerald-500 focus:bg-white/15 placeholder:text-gray-500"
              />
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMode(null)}
              className="pm-answer rounded-2xl border border-white/20 px-4 py-3 text-sm font-black text-white/70 transition-all hover:bg-white/5"
            >
              Orqaga
            </button>
            <button
              onClick={start}
              className="pm-answer rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50"
            >
              Boshlash
            </button>
          </div>
        </motion.section>
      </div>
      </>
    );
  }

  return (
    <>
    {gameStyle}
    <div className="pm-screen fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-red-900/10" />
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" />
      
      <div className="absolute top-[15%] right-[12%] text-6xl text-orange-500/20 animate-bounce" style={{ animationDuration: "3s" }}>🍕</div>
      <div className="absolute bottom-[20%] left-[10%] text-5xl text-red-500/20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>🍕</div>
      <div className="absolute top-[40%] left-[15%] text-4xl text-yellow-500/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>🌟</div>

      <div className="relative w-full max-w-5xl mx-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white shadow-[0_20px_50px_rgba(239,68,68,0.4)] pizza-glow">
            <img src={pizzaMasterBadge} alt="Pizza Master" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">Mazali bilim sinovi</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-7xl">
            Pizza <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Master</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-gray-400 sm:text-lg">
            Har bir to'g'ri javob bilan pizzangizga yangi ingredient qo'shing va eng mazali natijaga erishing.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <ModeCard
            icon={<FaUser />}
            title="Solo Mode"
            text={`O'zingizning pizzangizni ${PIZZA_INGREDIENTS.length} ta ingredient bilan to'ldiring.`}
            accent="from-orange-500 to-red-500"
            onClick={() => setSelectedMode("solo")}
          />
          <ModeCard
            icon={<FaUsers />}
            title="Pizza Battle"
            text="Bir qurilmada do'stingiz bilan navbatma-navbat bellashing."
            accent="from-emerald-500 to-lime-500"
            onClick={() => setSelectedMode("battle")}
          />
        </div>
      </div>
    </div>
    </>
  );
}

function ModeCard({ icon, title, text, accent, onClick }: { icon: React.ReactNode; title: string; text: string; accent: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="pm-menu-card group relative overflow-hidden rounded-[32px] p-8 text-left transition-all duration-300 hover:border-orange-400/50 hover:shadow-[0_18px_0_rgba(0,0,0,0.28),0_0_52px_rgba(251,146,60,0.22)]"
    >
      <div className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${accent} opacity-10`} />
      <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <h2 className="mt-6 text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-400 min-h-[3rem]">{text}</p>
      <span className="pm-chip mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black text-orange-200 transition-colors group-hover:text-yellow-100">
        Boshlash <FaArrowRight className="transition-transform group-hover:translate-x-2" />
      </span>
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.button>
  );
}
