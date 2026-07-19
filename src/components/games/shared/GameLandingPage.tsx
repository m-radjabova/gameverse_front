import type { IconType } from "react-icons";
import { useState } from "react";
import {
  FaArrowTrendUp,
  FaCirclePlay,
} from "react-icons/fa6";
import GameFeedbackPanel from "./GameFeedbackPanel";
import GameLeaderboardPanel from "./GameLeaderboardPanel";
import GamePagePlayButton from "./GamePagePlayButton";
import { supportsGameLeaderboard } from "../../../hooks/gameSession";
import { gameCards } from "../../../pages/games/data";
import { ReactBitsReveal } from "./ReactBitsMotion";

export type GameLandingMetric = {
  icon: IconType;
  label: string;
  value: string;
};

export type GameLandingFeature = {
  icon: IconType;
  title: string;
  description: string;
  stat: string;
};

export type GameLandingLevel = {
  icon: IconType;
  title: string;
  detail: string;
  meta: string;
  progress: number;
};

export type GameLandingHighlight = {
  icon: IconType;
  label: string;
  value: string;
};

export type GameLandingTheme = {
  accent: string;
  accentSoft: string;
  page: string;
  panel: string;
  border: string;
  text: string;
  mutedText: string;
  glow: string;
};

export type GameLandingPageConfig = {
  badge: string;
  badgeIcon: IconType;
  title: [string, string];
  description: string;
  image: string;
  imageAlt: string;
  playPath: string;
  gameKey: string;
  modeSelectionEnabled?: boolean;
  theme: GameLandingTheme;
  metrics: GameLandingMetric[];
  features: GameLandingFeature[];
  levels: GameLandingLevel[];
  highlights: GameLandingHighlight[];
};

type Props = {
  config: GameLandingPageConfig;
};

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ReactBitsReveal className={className} delay={delay}>
      {children}
    </ReactBitsReveal>
  );
}

/* ── Section heading ── */
function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 shadow-lg backdrop-blur-xl">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
        {eyebrow}
      </p>
      <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
        {description}
      </p>
    </div>
  );
}

/* ── Main component ── */
export default function GameLandingPage({ config }: Props) {
  const BadgeIcon = config.badgeIcon;
  const gamePath = config.playPath.replace(/\/play$/, "");
  const game = gameCards.find((item) => item.id === config.gameKey || item.path === gamePath);
  const hasLeaderboard = Boolean(game && supportsGameLeaderboard(game.id, game.players));
  const [imageReady, setImageReady] = useState(false);

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden ${config.theme.page} text-white selection:bg-white/20 selection:text-white`}
    >
      {/* ── Background grid + vector lines ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_78%)]" />
        <div className={`absolute -right-32 -top-32 h-[620px] w-[620px] rounded-full bg-gradient-to-br ${config.theme.accent} opacity-[0.12] blur-[120px]`} />
        <div className={`absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full bg-gradient-to-tr ${config.theme.accent} opacity-[0.08] blur-[130px]`} />
        <div className={`absolute right-[8%] top-[16%] h-72 w-72 rounded-full border border-dashed ${config.theme.border} opacity-30`} />
      </div>

      <div className="mx-auto w-full max-w-[1480px] px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-20">
        {/* ════════════════════════════════════════════
           HERO SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={0}>
          <section className={`group relative isolate min-h-[720px] overflow-hidden rounded-[2rem] border ${config.theme.border} bg-slate-950 shadow-[0_35px_110px_rgba(0,0,0,0.48)] sm:min-h-[780px] sm:rounded-[2.5rem] lg:min-h-[calc(100vh-7rem)]`}>
            {/* The blurred cover fills the frame; the sharp layer keeps the whole artwork visible. */}
            <div className={`absolute inset-0 bg-gradient-to-br ${config.theme.accent} transition-opacity duration-700 ${imageReady ? "opacity-0" : "opacity-[0.12]"}`}/>
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_48%)] transition-opacity duration-500 ${imageReady ? "opacity-0" : "animate-pulse opacity-100"}`}/>
            <img src={config.image} alt="" aria-hidden="true" loading="lazy" decoding="async" fetchPriority="low" className={`absolute inset-[-5%] h-[110%] w-[110%] scale-110 object-cover blur-2xl saturate-150 transition-opacity duration-700 ${imageReady ? "opacity-55" : "opacity-0"}`}/>
            <img src={config.image} alt={config.imageAlt} loading="lazy" decoding="async" onLoad={() => setImageReady(true)} className={`absolute inset-0 h-full w-full object-contain transition-[opacity,transform] duration-700 ease-out ${imageReady ? "opacity-100" : "opacity-0"} group-hover:scale-[1.015]`}/>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.84)_0%,rgba(2,6,23,0.18)_28%,rgba(2,6,23,0.18)_58%,rgba(2,6,23,0.92)_100%)]"/>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.62),transparent_38%,transparent_68%,rgba(2,6,23,0.35))]"/>
            <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${config.theme.glow} to-transparent opacity-80`}/>

            <div className="relative z-10 flex min-h-[720px] flex-col p-5 sm:min-h-[780px] sm:p-8 lg:min-h-[calc(100vh-7rem)] lg:p-10">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${config.theme.accent} px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-xl`}><BadgeIcon/>{config.badge}</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white/75 backdrop-blur-xl"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]"/> O'ynashga tayyor</span>
                  </div>
                  <h1 className="mt-5 max-w-4xl text-[clamp(2.6rem,6.5vw,6.5rem)] font-black leading-[0.84] tracking-[-0.06em] drop-shadow-[0_8px_28px_rgba(0,0,0,0.65)]">
                    <span className="block text-white">{config.title[0]}</span>
                    <span className={`mt-2 block bg-gradient-to-r ${config.theme.accentSoft} bg-clip-text pb-3 text-transparent`}>{config.title[1]}</span>
                  </h1>
                </div>
                <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/70 backdrop-blur-xl sm:inline-flex"><FaArrowTrendUp className={config.theme.text}/> Jonli o'yin</span>
              </header>

              <div className="flex flex-1 items-center justify-center py-8 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:py-0">
                <div className="relative flex flex-col items-center">
                  <span className={`absolute h-44 w-44 rounded-full bg-gradient-to-br ${config.theme.accent} opacity-25 blur-3xl transition-transform duration-500 group-hover:scale-125`}/>
                  <span className="relative mb-4 grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"><FaCirclePlay className={`text-3xl ${config.theme.text}`}/></span>
                  <GamePagePlayButton to={config.playPath} colorClassName={config.theme.accent} modeSelectionEnabled={config.modeSelectionEnabled} showGameModeShowcase={false} className="relative w-full sm:w-auto"/>
                  <span className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 drop-shadow-lg">Boshlash uchun bosing</span>
                </div>
              </div>

              <footer className="mt-auto grid gap-5 lg:grid-cols-[minmax(260px,1fr)_minmax(540px,1.25fr)] lg:items-end">
                <div className="max-w-xl rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-xl backdrop-blur-xl sm:p-5">
                  <p className={`text-sm font-medium leading-6 sm:text-base sm:leading-7 ${config.theme.mutedText}`}>{config.description}</p>
                </div>
                <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55 backdrop-blur-xl sm:grid-cols-4">
                  {config.metrics.map((metric,index)=>{const Icon=metric.icon;return <div key={metric.label} className={`min-w-0 p-3.5 sm:p-4 ${index>0?"sm:border-l sm:border-white/10":""} ${index%2?"border-l border-white/10":""} ${index>1?"border-t border-white/10 sm:border-t-0":""}`}><dt className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.1em] text-white/45"><Icon className={config.theme.text}/><span className="truncate">{metric.label}</span></dt><dd className="mt-1.5 truncate text-xs font-black text-white sm:text-sm">{metric.value}</dd></div>})}
                </dl>
              </footer>
            </div>
          </section>
        </RevealSection>

        {hasLeaderboard ? (
          <RevealSection delay={280}>
            <section className="border-t border-white/[0.07] py-10 lg:py-14">
              <SectionHeading
                eyebrow="Jonli natijalar"
                title="Eng yaxshi o'yinchilar"
                description="Reyting alohida keng maydonda ko'rinadi, shuning uchun natijalarni solishtirish va topish osonroq."
              />
              <GameLeaderboardPanel
                gameKey={config.gameKey}
                title={`${game?.title ?? config.title.join(" ")} reytingi`}
                limit={100}
                singlePlayerOnly
              />
            </section>
          </RevealSection>
        ) : null}

        {/* ════════════════════════════════════════════
           FEEDBACK SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={300}>
          <section className="border-t border-white/[0.07] pt-10 lg:pt-14">
            <GameFeedbackPanel gameKey={config.gameKey} />
          </section>
        </RevealSection>
      </div>

    </main>
  );
}
