import {
  FaArrowRight,
  FaClock,
  FaHeart,
  FaLayerGroup,
  FaRegHeart,
  FaRocket,
  FaUsers,
} from "react-icons/fa";
import { GiFlowerTwirl } from "react-icons/gi";

import { gameCards } from "../../pages/games/data";

type GameCardItem = (typeof gameCards)[number];

type Props = {
  game: GameCardItem;
  isDark?: boolean;
  isLiked: boolean;
  onLikeToggle: (gameId: string) => void;
  onOpen: (path: string) => void;
  priorityLabel?: string;
};

export default function GameShowcaseCard({
  game,
  isDark = false,
  isLiked,
  onLikeToggle,
  onOpen,
  priorityLabel,
}: Props) {
  const Icon = game.mainIcon;
  const CategoryIcon = game.categoryIcon;
  const LevelIcon = game.levelIcon;

  return (
    <article className="group relative h-full">
      <div className={`absolute -inset-0.5 rounded-[30px] bg-gradient-to-r ${game.gradient} opacity-10 blur-lg`} />

      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[30px] border p-5 backdrop-blur-md ${
          isDark
            ? "border-[#2b3146] bg-[#1a1a28]/88 shadow-[0_12px_36px_rgba(0,0,0,0.22)] hover:shadow-[0_18px_44px_rgba(255,107,138,0.12)]"
            : "border-white/70 bg-white/45 shadow-[0_12px_36px_rgba(166,100,102,0.08)] hover:shadow-[0_18px_44px_rgba(224,124,142,0.12)]"
        }`}
      >
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, ${
              isDark ? "#ff6b8a18" : game.gradient.includes("yellow") ? "#f7c66d20" : "#e07c8e14"
            } 2px, transparent 2px)`,
            backgroundSize: "38px 38px",
          }}
        />

        <div className={`relative mb-4 overflow-hidden rounded-[24px] border ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/80 bg-white/60"}`}>
          <img
            src={game.image}
            alt={game.title}
            className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-52"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <game.badgeIcon className="text-[11px] text-white" />
            <span className="text-[10px] font-bold tracking-[0.18em] text-white">{game.badge}</span>
          </div>

          <div className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} shadow-lg`}>
            <Icon className="text-lg text-white" />
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            <div className="rounded-2xl bg-white/18 px-2.5 py-2 backdrop-blur-sm sm:px-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">Kategoriya</p>
              <p className="mt-1 text-xs font-bold text-white sm:text-sm">{game.category}</p>
            </div>

            <button
              type="button"
              onClick={() => onLikeToggle(game.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm transition-all sm:gap-2 sm:px-3 sm:text-[10px] sm:tracking-[0.14em] ${
                isLiked ? "border-white bg-white text-[#ff6b8a]" : "border-white/35 bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {isLiked ? <FaHeart className="text-[11px]" /> : <FaRegHeart className="text-[11px]" />}
              {isLiked ? "Saqlangan" : "Like"}
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { icon: FaLayerGroup, value: game.players },
              { icon: FaClock, value: game.time },
              { icon: FaUsers, value: game.points },
            ].map((item) => (
              <span
                key={`${game.id}-${item.value}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold ${
                  isDark ? "border-[#2b3146] bg-[#1e1e2f] text-[#a1a1aa]" : "border-white/70 bg-white/70 text-[#8f6d70]"
                }`}
              >
                <item.icon className="text-[9px]" />
                {item.value}
              </span>
            ))}
            {priorityLabel ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-200">
                <FaHeart className="text-[9px]" />
                {priorityLabel}
              </span>
            ) : null}
          </div>

          <div className="min-h-[104px] sm:min-h-[118px]">
            <h3 className={`text-xl font-black sm:text-2xl ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>{game.title}</h3>
            <p
              className={`mt-2 text-sm leading-relaxed ${isDark ? "text-[#a1a1aa]" : "text-[#8f6d70]"}`}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {game.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/65"}`}>
              <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
                <CategoryIcon className="text-[11px]" />
                Yo'nalish
              </p>
              <p className={`mt-2 text-sm font-semibold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>{game.category}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-[#2b3146] bg-[#1e1e2f]" : "border-white/70 bg-white/65"}`}>
              <p className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`}>
                <LevelIcon className="text-[11px]" />
                Daraja
              </p>
              <p className={`mt-2 text-sm font-semibold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>{game.level}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpen(game.path)}
            className={`group/btn relative mt-auto w-full overflow-hidden rounded-2xl bg-gradient-to-r ${game.gradient} p-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 sm:hover:-translate-y-1`}
          >
            <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover/btn:translate-y-0" />
            <span className="relative flex items-center justify-center gap-2">
              <FaRocket className="text-sm" />
              O'yinni boshlash
              <FaArrowRight className="text-xs transition-transform group-hover/btn:translate-x-1" />
            </span>
          </button>
        </div>

        <div className="absolute bottom-3 right-3 opacity-10">
          <GiFlowerTwirl className={`text-xl bg-gradient-to-r ${game.gradient} bg-clip-text text-transparent`} />
        </div>
      </div>
    </article>
  );
}
