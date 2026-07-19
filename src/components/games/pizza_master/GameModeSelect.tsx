import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaArrowRight, FaUser, FaUsers } from "react-icons/fa";
import useContextPro from "../../../hooks/useContextPro";
import pizzaMasterBadge from "./images/pizza-master-badge.png";
import { PIZZA_INGREDIENTS } from "./pizzaData";
import type { PizzaMode } from "./types";

type Props = { onSelect: (mode: PizzaMode, names?: [string, string]) => void };

export default function GameModeSelect({ onSelect }: Props) {
  const {
    state: { user },
  } = useContextPro();
  const registeredName = user?.username?.trim() || "";
  const [selectedMode, setSelectedMode] = useState<PizzaMode | null>(null);
  const [names, setNames] = useState<[string, string]>([registeredName, ""]);
  const firstPlayerName = names[0];

  useEffect(() => {
    if (selectedMode === "solo" && !firstPlayerName && registeredName) {
      setNames((prev) => [registeredName, prev[1]]);
    }
  }, [firstPlayerName, registeredName, selectedMode]);
  const gameStyle = (
    <style>{`
      .pm-screen {
        background:
          linear-gradient(rgba(255,245,220,0.055) 2px, transparent 2px),
          linear-gradient(90deg, rgba(255,245,220,0.055) 2px, transparent 2px),
          radial-gradient(circle at 50% 43%, rgba(255,125,36,0.22), transparent 34%),
          linear-gradient(180deg, #25130f 0%, #3a1e16 62%, #190b08 100%);
        background-size: 62px 62px, 62px 62px, auto, auto;
      }
      .pm-screen:after{content:"";position:absolute;z-index:0;left:0;right:0;bottom:0;height:16%;min-height:90px;max-height:170px;pointer-events:none;border-top:9px solid #160805;background:repeating-linear-gradient(88deg,#5a2d18 0 46px,#6d381f 46px 49px,#42200f 49px 92px,#774324 92px 96px);box-shadow:inset 0 8px 22px #0008,0 -10px 35px #0008}
      .pm-screen:before{content:"";position:absolute;z-index:0;left:0;right:0;top:54px;height:14px;pointer-events:none;background:repeating-linear-gradient(90deg,#8f221b 0 28px,#f4e3bd 28px 56px);box-shadow:0 5px 15px #0007}
      .pm-mode-shell{scrollbar-width:thin;scrollbar-color:rgba(251,146,60,.55) transparent}
      .pm-mode-shell::-webkit-scrollbar{width:7px}
      .pm-mode-shell::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(251,146,60,.55)}
      .pm-chip {
        border: 1px solid rgba(255,201,123,0.2);
        background: linear-gradient(180deg, rgba(255,210,142,0.12), rgba(68,28,16,0.14));
        box-shadow: 0 5px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18);
      }
      .pm-answer {
        border-width: 3px !important;
        box-shadow: 0 7px 0 rgba(0,0,0,0.28), 0 15px 26px rgba(0,0,0,0.24), inset 0 2px 0 rgba(255,255,255,0.12);
      }
      .pm-menu-card {
        border: 2px solid rgba(255,193,105,0.26);
        background: linear-gradient(180deg, rgba(68,34,22,0.97), rgba(25,12,9,0.98));
        box-shadow: 0 14px 0 rgba(0,0,0,0.28), 0 34px 70px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.14);
      }
      .pm-reward {
        border: 3px solid rgba(251, 191, 36, 0.4);
        background: linear-gradient(180deg, rgba(70,35,20,0.98), rgba(24,11,8,0.99));
        box-shadow: 0 18px 0 rgba(0,0,0,0.3), 0 0 90px rgba(251, 146, 60, 0.28), inset 0 2px 0 rgba(255,255,255,0.16);
      }
      @media (max-height: 850px) and (min-width: 768px) {
        .pm-mode-shell{padding-top:72px;padding-bottom:42px}
        .pm-mode-badge{width:72px;height:72px;margin-bottom:12px;border-radius:22px}
        .pm-mode-title{margin-top:6px;font-size:48px;line-height:1}
        .pm-mode-description{margin-top:10px;font-size:15px;line-height:1.55}
        .pm-mode-cards{margin-top:24px;gap:18px}
        .pm-menu-card{padding:22px 24px}
        .pm-card-icon{width:52px;height:52px}
        .pm-card-title{margin-top:14px}
        .pm-card-action{margin-top:14px}
      }
    `}</style>
  );

  if (selectedMode) {
    const isBattle = selectedMode === "battle";
    const start = () => onSelect(selectedMode, [names[0].trim() || (isBattle ? "Player 1" : "Siz"), names[1].trim() || "Player 2"]);
    return (
      <>
      {gameStyle}
      <div className="pm-screen pm-mode-shell fixed inset-0 z-50 flex items-start justify-center overflow-x-hidden overflow-y-auto px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-red-900/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500/10 rounded-full blur-[100px]" />
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="pm-reward relative z-10 my-auto w-full max-w-md overflow-hidden rounded-[32px] p-6 sm:p-8"
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
    <div className="pm-screen pm-mode-shell fixed inset-0 z-50 flex items-start justify-center overflow-x-hidden overflow-y-auto px-4 pb-20 pt-24 sm:pt-28">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-red-900/10" />
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-orange-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-red-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]" />
      
      <div className="absolute top-[15%] right-[12%] text-6xl text-orange-500/20 animate-bounce" style={{ animationDuration: "3s" }}>🍕</div>
      <div className="absolute bottom-[20%] left-[10%] text-5xl text-red-500/20 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>🍕</div>
      <div className="absolute top-[40%] left-[15%] text-4xl text-yellow-500/20 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }}>🌟</div>

      <div className="relative z-10 my-auto w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="pm-mode-badge mx-auto mb-6 grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white shadow-[0_20px_50px_rgba(239,68,68,0.4)] pizza-glow">
            <img src={pizzaMasterBadge} alt="Pizza Master" className="h-full w-full object-contain" />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-orange-400">Mazali bilim sinovi</p>
          <h1 className="pm-mode-title mt-3 text-5xl font-black tracking-tight text-white sm:text-7xl">
            Pizza <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Master</span>
          </h1>
          <p className="pm-mode-description mx-auto mt-4 max-w-xl text-base font-medium leading-7 text-gray-400 sm:text-lg">
            Har bir to'g'ri javob bilan pizzangizga yangi ingredient qo'shing va eng mazali natijaga erishing.
          </p>
        </motion.div>

        <div className="pm-mode-cards mx-auto mt-8 grid max-w-4xl gap-5 md:mt-10 md:grid-cols-2 md:gap-6">
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
      <div className={`pm-card-icon grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-2xl text-white shadow-lg`}>
        {icon}
      </div>
      <h2 className="pm-card-title mt-6 text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-gray-400 min-h-[3rem]">{text}</p>
      <span className="pm-chip pm-card-action mt-6 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black text-orange-200 transition-colors group-hover:text-yellow-100">
        Boshlash <FaArrowRight className="transition-transform group-hover:translate-x-2" />
      </span>
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.button>
  );
}
