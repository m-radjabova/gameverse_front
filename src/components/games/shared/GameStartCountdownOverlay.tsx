import { FaBolt, FaRocket, FaStar } from "react-icons/fa";

export type CountdownValue = 3 | 2 | 1 | "BOSHLANDI" | null;

type Props = {
  visible: boolean;
  value: CountdownValue;
};

const accentByValue: Record<Exclude<CountdownValue, null>, string> = {
  3: "from-fuchsia-500 via-violet-500 to-cyan-500",
  2: "from-cyan-500 via-sky-500 to-indigo-500",
  1: "from-amber-400 via-orange-500 to-rose-500",
  BOSHLANDI: "from-emerald-400 via-green-400 to-cyan-400",
};

export default function GameStartCountdownOverlay({ visible, value }: Props) {
  if (!visible || value === null) return null;

  const isStarted = value === "BOSHLANDI";
  const accent = accentByValue[value];

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#030712]/84 backdrop-blur-2xl">
      <div className="absolute inset-0">
        <div className={`absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r ${accent} opacity-20 blur-3xl`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_44%)]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1.2px, transparent 0)", backgroundSize: "36px 36px" }} />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <FaStar className="absolute left-[14%] top-[18%] text-xl text-yellow-300/70 animate-pulse sm:text-2xl" />
        <FaStar className="absolute right-[18%] top-[20%] text-lg text-pink-300/60 animate-pulse" />
        <FaBolt className="absolute bottom-[20%] left-[18%] text-xl text-cyan-300/70 animate-bounce" />
        <FaRocket className="absolute bottom-[18%] right-[16%] text-xl text-violet-300/70 animate-pulse sm:text-2xl" />
      </div>

      <div className="relative flex h-full items-center justify-center px-4">
        <div className={`absolute h-[240px] w-[240px] rounded-full border border-white/15 ${isStarted ? "animate-ping" : "animate-pulse"} sm:h-[320px] sm:w-[320px]`} />
        <div className={`absolute h-[310px] w-[310px] rounded-full border ${isStarted ? "border-emerald-300/30" : "border-white/10"} animate-pulse sm:h-[420px] sm:w-[420px]`} />

        <div className="relative animate-[countdownPop_.38s_ease-out]">
          <div className={`absolute -inset-3 rounded-[2.25rem] bg-gradient-to-r ${accent} opacity-25 blur-2xl`} />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 px-7 py-8 text-center shadow-[0_25px_100px_rgba(0,0,0,0.45)] sm:px-12 sm:py-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_40%,rgba(255,255,255,0.08))]" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/25" />

            {!isStarted ? (
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.45em] text-white/65">
                  Tayyorlaning
                </p>
                <div className="relative mt-4">
                  <div
                    className={`absolute inset-0 mx-auto h-28 w-28 rounded-full bg-gradient-to-r ${accent} opacity-35 blur-2xl sm:h-36 sm:w-36`}
                  />
                  <div
                    className="relative text-[110px] font-black leading-none text-white sm:text-[170px]"
                    style={{ textShadow: "0 0 18px rgba(255,255,255,0.65), 0 0 42px rgba(34,211,238,0.28), 0 8px 30px rgba(0,0,0,0.45)" }}
                  >
                    {value}
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/72 sm:text-base">
                  O'yin birozdan keyin boshlanadi
                </p>
              </div>
            ) : (
              <div className="relative min-w-[280px] sm:min-w-[360px]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/35 bg-emerald-400/15 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.35)] sm:h-20 sm:w-20">
                  <FaRocket className="text-2xl sm:text-3xl" />
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.45em] text-emerald-100/80">
                  Start
                </p>
                <div className="mt-3 bg-gradient-to-r from-emerald-200 via-cyan-200 to-green-200 bg-clip-text text-transparent">
                  <p className="text-4xl font-black sm:text-6xl">
                    BOSHLANDI!
                  </p>
                </div>
                <p className="mt-3 text-sm text-white/75 sm:text-base">
                  Jarayon ishga tushmoqda...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
