import type { IconType } from "react-icons";
import { useState } from "react";
import { FaArrowTrendUp, FaChevronDown } from "react-icons/fa6";
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
  dotClassName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dotClassName: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="flex items-center gap-2.5 text-sm font-semibold text-white/60">
        <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${dotClassName}`} />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
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
      className={`relative min-h-screen overflow-x-clip ${config.theme.page} text-white selection:bg-white/20 selection:text-white`}
    >
      {/* ════════════════════════════════════════════
         HERO — to'liq ekran
         ════════════════════════════════════════════ */}
      <section className="relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-slate-950">
        {/* Yuklanguncha rangli fon */}
        <div
          className={`absolute inset-0 -z-30 bg-gradient-to-br ${config.theme.accent} transition-opacity duration-700 ${imageReady ? "opacity-0" : "opacity-20"}`}
        />

        {/* Butun ekranni egallovchi rasm */}
        <img
          src={config.image}
          alt={config.imageAlt}
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageReady(true)}
          className={`absolute inset-0 -z-20 h-full w-full object-cover object-center transition-[opacity,transform] duration-[1600ms] ease-out motion-reduce:transition-none ${
            imageReady ? "scale-100 opacity-100" : "scale-[1.08] opacity-0"
          }`}
        />

        {/* Matnni o'qiladigan qilish uchun qatlamlar */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,6,23,0.7)_0%,rgba(2,6,23,0)_26%,rgba(2,6,23,0.1)_45%,rgba(2,6,23,0.94)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,0.7)_0%,rgba(2,6,23,0)_60%)]" />

        {/* Yuqori panel */}
        <header className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-7 lg:px-14">
          <span
            className={`inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r ${config.theme.accent} px-4 py-2 text-sm font-bold text-white shadow-lg`}
          >
            <BadgeIcon />
            {config.badge}
          </span>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-sm font-semibold text-white/85 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              O'ynashga tayyor
            </span>
            <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3.5 py-2 text-sm font-semibold text-white/85 backdrop-blur-md sm:inline-flex">
              <FaArrowTrendUp className={config.theme.text} />
              Jonli o'yin
            </span>
          </div>
        </header>

        <div className="flex-1" />

        {/* Pastki qism: sarlavha chapda, harakat o'ngda */}
        <div className="grid items-end gap-8 px-5 pb-8 sm:px-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)] lg:gap-14 lg:px-14 lg:pb-12">
          <h1 className="font-black leading-[0.86] tracking-[-0.055em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-[clamp(3.25rem,10vw,10rem)]">
            <span className="block text-white">{config.title[0]}</span>
            <span
              className={`block bg-gradient-to-r ${config.theme.accentSoft} bg-clip-text pb-[0.08em] text-transparent`}
            >
              {config.title[1]}
            </span>
          </h1>

          <div className="flex max-w-xl flex-col gap-6 lg:justify-self-end">
            <p className={`text-base leading-7 sm:text-lg sm:leading-8 ${config.theme.mutedText}`}>
              {config.description}
            </p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              <GamePagePlayButton
                to={config.playPath}
                colorClassName={config.theme.accent}
                modeSelectionEnabled={config.modeSelectionEnabled}
                showGameModeShowcase={false}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Ko'rsatkichlar — butun kenglikdagi lenta */}
        <dl className="grid grid-cols-2 border-t border-white/15 bg-black/40 backdrop-blur-xl sm:grid-cols-4">
          {config.metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className={`flex min-w-0 items-center gap-3.5 px-5 py-4 sm:px-8 lg:px-14 lg:py-5 ${
                  index % 2 ? "border-l border-white/15" : ""
                } ${index > 1 ? "border-t border-white/15 sm:border-t-0" : ""} ${
                  index > 0 ? "sm:border-l sm:border-white/15" : ""
                }`}
              >
                <Icon className={`shrink-0 text-xl ${config.theme.text}`} />
                <div className="min-w-0">
                  <dt className="truncate text-xs font-medium text-white/55">{metric.label}</dt>
                  <dd className="truncate text-base font-bold text-white sm:text-lg">{metric.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>

        {/* Pastga o'tish */}
        {hasLeaderboard ? (
          <a
            href="#reyting"
            aria-label="Reytingga o'tish"
            className="absolute bottom-[calc(theme(spacing.28)+1rem)] left-1/2 hidden h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-white/20 bg-black/35 text-white/80 backdrop-blur-md transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:grid"
          >
            <FaChevronDown className="animate-bounce motion-reduce:animate-none" />
          </a>
        ) : null}
      </section>

      {/* ════════════════════════════════════════════
         PASTKI BO'LIMLAR — to'liq kenglik
         ════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-14">
        {/* Orqa fondagi yorug'lik */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className={`absolute -right-40 top-20 h-[560px] w-[560px] rounded-full bg-gradient-to-br ${config.theme.accent} opacity-[0.1] blur-[130px]`}
          />
          <div
            className={`absolute -left-40 bottom-0 h-[520px] w-[520px] rounded-full bg-gradient-to-tr ${config.theme.accent} opacity-[0.07] blur-[140px]`}
          />
        </div>

        {hasLeaderboard ? (
          <RevealSection delay={0}>
            <section id="reyting" className="scroll-mt-6 py-16 lg:py-24">
              <SectionHeading
                eyebrow="Jonli natijalar"
                title="Eng yaxshi o'yinchilar"
                description="Reyting butun kenglikda ko'rinadi, shuning uchun natijalarni solishtirish va o'zingizni topish osonroq."
                dotClassName={config.theme.accent}
              />
              <div className="mt-8 lg:mt-10">
                <GameLeaderboardPanel
                  gameKey={config.gameKey}
                  title={`${game?.title ?? config.title.join(" ")} reytingi`}
                  limit={100}
                  singlePlayerOnly
                />
              </div>
            </section>
          </RevealSection>
        ) : null}

        <RevealSection delay={0}>
          <section
            className={`py-16 lg:py-24 ${hasLeaderboard ? "border-t border-white/10" : ""}`}
          >
            <GameFeedbackPanel gameKey={config.gameKey} />
          </section>
        </RevealSection>
      </div>
    </main>
  );
}