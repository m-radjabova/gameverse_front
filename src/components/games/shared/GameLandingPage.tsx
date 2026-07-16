import type { IconType } from "react-icons";
import {
  FaArrowTrendUp,
  FaCheck,
  FaCirclePlay,
  FaLayerGroup,
  FaStar,
} from "react-icons/fa6";
import GameFeedbackPanel from "./GameFeedbackPanel";
import GameLeaderboardPanel from "./GameLeaderboardPanel";
import GamePagePlayButton from "./GamePagePlayButton";
import { DIRECT_PLAY_GAME_PATHS } from "./directPlayGames";
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
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/50 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/55 sm:text-base sm:leading-7">
        {description}
      </p>
    </div>
  );
}

function GameVectorDecorations({ config }: Props) {
  const BadgeIcon = config.badgeIcon;
  const FirstMetricIcon = config.metrics[0]?.icon;
  const SecondMetricIcon = config.metrics[1]?.icon;

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block" aria-hidden="true">
      <div className={`absolute -left-10 top-12 flex h-32 w-32 rotate-[-14deg] items-center justify-center border ${config.theme.border} bg-white/[0.025] text-white/[0.07]`}>
        <BadgeIcon className="text-7xl" />
      </div>
      <div className={`absolute left-[31%] top-0 h-24 w-px bg-gradient-to-b from-transparent ${config.theme.glow} to-transparent opacity-50`} />
      <div className={`absolute left-[calc(31%-46px)] top-24 flex h-10 w-10 items-center justify-center border ${config.theme.border} bg-slate-950/30 ${config.theme.text} shadow-xl backdrop-blur-sm`}>
        <FaStar className="animate-[spin_9s_linear_infinite] text-sm" />
      </div>
      {FirstMetricIcon ? (
        <div className={`absolute bottom-10 left-[8%] flex h-14 w-14 rotate-12 items-center justify-center border ${config.theme.border} bg-white/[0.025] ${config.theme.text}`}>
          <FirstMetricIcon className="text-2xl" />
        </div>
      ) : null}
      {SecondMetricIcon ? (
        <div className={`absolute right-[28%] top-7 flex h-12 w-12 -rotate-6 items-center justify-center border ${config.theme.border} bg-white/[0.025] ${config.theme.text}`}>
          <SecondMetricIcon className="text-xl" />
        </div>
      ) : null}
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col gap-3 opacity-30">
        <span className="h-1.5 w-16 bg-white/20" />
        <span className={`ml-5 h-1.5 w-28 bg-gradient-to-r ${config.theme.accent}`} />
        <span className="h-1.5 w-20 bg-white/20" />
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function GameLandingPage({ config }: Props) {
  const BadgeIcon = config.badgeIcon;
  const gamePath = config.playPath.replace(/\/play$/, "");
  const hasLeaderboard = !DIRECT_PLAY_GAME_PATHS.has(gamePath);

  return (
    <main
      className={`relative min-h-screen overflow-x-hidden ${config.theme.page} text-white selection:bg-white/20 selection:text-white`}
    >
      {/* ── Background grid + vector lines ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className={`absolute -right-20 top-0 h-[430px] w-[430px] rotate-45 border-l border-b ${config.theme.border} opacity-50`} />
        <div className={`absolute -left-24 bottom-24 h-72 w-72 rotate-12 border border-dashed ${config.theme.border} opacity-35`} />
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-16">
        {/* ════════════════════════════════════════════
           HERO SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={0}>
          <section className="relative isolate grid gap-6 border-b border-white/[0.07] pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] lg:items-stretch lg:gap-8 lg:pb-14 xl:gap-10">
            <GameVectorDecorations config={config} />
            {/* ── Game details panel ── */}
            <div className={`order-2 flex flex-col justify-center rounded-2xl border ${config.theme.border} ${config.theme.panel} p-5 shadow-2xl shadow-black/20 sm:p-7 lg:order-2 lg:p-8`}>
              <div className={`mb-5 h-1 w-24 bg-gradient-to-r ${config.theme.accent}`} />
              {/* Badge row */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${config.theme.accent} px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-white shadow-lg shadow-black/20`}
                >
                  <BadgeIcon className="text-sm" />
                  {config.badge}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-white/50">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  </span>
                  O'ynashga tayyor
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-4xl xl:text-5xl">
                <span className="text-white">{config.title[0]}</span>{" "}
                <span
                  className={`bg-gradient-to-r ${config.theme.accentSoft} bg-clip-text text-transparent`}
                >
                  {config.title[1]}
                </span>
              </h1>

              {/* Description */}
              <p
                className={`mt-5 max-w-xl text-base font-medium leading-7 sm:text-lg sm:leading-8 ${config.theme.mutedText}`}
              >
                {config.description}
              </p>

              <div className="mt-6 grid divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {config.highlights.slice(0, 3).map((highlight) => {
                  const Icon = highlight.icon;

                  return (
                    <div key={highlight.label} className="flex items-center justify-between gap-4 py-3 first:pt-3 last:pb-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${config.theme.accent}`}>
                          <Icon className="text-sm text-white" />
                        </span>
                        <span className="truncate text-xs font-bold uppercase tracking-[0.07em] text-white/55">
                          {highlight.label}
                        </span>
                      </span>
                      <span className={`shrink-0 text-sm font-black ${config.theme.text}`}>
                        {highlight.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="mt-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                  {config.metrics.map((metric, i) => {
                    const Icon = metric.icon;
                    return (
                      <div
                        key={metric.label}
                        className="min-w-0 transition-all duration-300 hover:translate-x-0.5"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <dt className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
                          <Icon className={config.theme.text} />
                          <span className="truncate">{metric.label}</span>
                        </dt>
                        <dd className="mt-1 text-sm font-black text-white sm:text-base">
                          {metric.value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              {/* CTA */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <GamePagePlayButton
                  to={config.playPath}
                  colorClassName={config.theme.accent}
                  modeSelectionEnabled={config.modeSelectionEnabled}
                  showGameModeShowcase={false}
                />
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/50">
                  <FaCirclePlay className={config.theme.text} />
                  Bir necha daqiqada boshlang
                </span>
              </div>
            </div>

            {/* ── Large game poster ── */}
            <div className="order-1 lg:order-1">
              <div className="group relative min-h-[380px] overflow-hidden rounded-2xl border border-white/[0.10] bg-black/30 shadow-2xl shadow-black/35 sm:min-h-[500px] lg:min-h-full lg:rounded-[1.25rem]">
                <div className={`absolute left-4 top-4 z-10 h-10 w-10 border-l-2 border-t-2 ${config.theme.text}`} />
                <div className={`absolute bottom-4 right-4 z-10 h-10 w-10 border-b-2 border-r-2 ${config.theme.text}`} />
                <img
                  src={config.image}
                  alt={config.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.38),transparent_52%),linear-gradient(0deg,rgba(3,7,18,0.45),transparent_38%)]" />

                {/* Live badge */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:bg-slate-950/80">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                  </span>
                  <FaArrowTrendUp className={config.theme.text} />
                  Jonli rejim
                </div>

                <div className="absolute right-5 top-5 hidden items-center gap-2 lg:flex">
                  {config.features.slice(0, 2).map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <span key={feature.title} className="flex h-9 w-9 items-center justify-center border border-white/20 bg-slate-950/40 text-white/80 backdrop-blur-md">
                        <Icon className="text-sm" />
                      </span>
                    );
                  })}
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/50">O'yin maydoni</p>
                    <p className="mt-1 text-lg font-black text-white sm:text-xl">Boshlashga tayyormisiz?</p>
                  </div>
                  <FaCirclePlay className={`shrink-0 text-3xl ${config.theme.text}`} />
                </div>
              </div>
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
                title={`${config.badge} reytingi`}
                limit={100}
              />
            </section>
          </RevealSection>
        ) : null}

        {/* ════════════════════════════════════════════
           FEATURES SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={100}>
          <section className="py-10 lg:py-14">
            <SectionHeading
              eyebrow="O'yin jarayoni"
              title="Nima uchun aynan shu o'yin?"
              description="Qoidalar tushunarli, natija tez ko'rinadi va har bir harakat o'yin tempiga ta'sir qiladi."
            />
            <div className="mt-8 grid divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07] bg-white/[0.02] md:grid-cols-3 md:divide-x md:divide-y-0">
              {config.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group relative px-5 py-7 transition-all duration-300 hover:bg-white/[0.03] first:rounded-t-2xl last:rounded-b-2xl md:px-7 md:py-8 md:first:rounded-l-2xl md:first:rounded-tr-none md:last:rounded-r-2xl md:last:rounded-bl-none"
                  >
                    {/* Hover shine */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent_60%)]" />
                    </div>

                    <div className="relative flex items-start justify-between gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.theme.accent} text-lg shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                      >
                        <Icon />
                      </span>
                      <span className="text-5xl font-black leading-none text-white/[0.06] transition-all duration-300 group-hover:text-white/[0.10]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="relative mt-5 text-lg font-black text-white">
                      {feature.title}
                    </h3>
                    <p className="relative mt-2 min-h-12 text-sm leading-6 text-white/55">
                      {feature.description}
                    </p>
                    <p
                      className={`relative mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-black uppercase tracking-[0.06em] ${config.theme.text} transition-all duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.06]`}
                    >
                      <FaCheck className="text-[10px]" />
                      {feature.stat}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </RevealSection>

        {/* ════════════════════════════════════════════
           LEVELS SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={200}>
          <section className="border-t border-white/[0.07] py-10 lg:py-14">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Qiyinchilik darajasi"
                title="O'zingizga mos tempni tanlang"
                description="Boshlash uchun yengil darajadan o'ting yoki bevosita katta sinovga kiring."
              />
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white/45 backdrop-blur-sm">
                <FaLayerGroup />
                3 xil daraja
              </span>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {config.levels.map((level, index) => {
                const Icon = level.icon;
                return (
                  <article
                    key={level.title}
                    className={`group relative overflow-hidden rounded-2xl border ${config.theme.border} ${config.theme.panel} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20`}
                  >
                    {/* Hover glow */}
                    <div
                      className={`pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r ${config.theme.accent} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-[0.08]`}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/45">
                          <span
                            className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${config.theme.accent}`}
                          />
                          Daraja 0{index + 1}
                        </span>
                        <Icon
                          className={`text-2xl ${config.theme.text} transition-all duration-300 group-hover:scale-110`}
                        />
                      </div>

                      <h3 className="mt-6 text-2xl font-black text-white">
                        {level.title}
                      </h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-white/60">
                        {level.detail}
                      </p>

                      <div className="mt-8 flex items-center justify-between gap-3 text-xs font-bold">
                        <span className="text-white/40">{level.meta}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 ${config.theme.text}`}
                        >
                          <FaStar className="text-[10px]" />
                          {level.progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${config.theme.accent} transition-all duration-1000 ease-out`}
                          style={{ width: `${level.progress}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </RevealSection>

        {/* ════════════════════════════════════════════
           FEEDBACK SECTION
           ════════════════════════════════════════════ */}
        <RevealSection delay={300}>
          <section className="border-t border-white/[0.07] pt-10 lg:pt-14">
            <GameFeedbackPanel gameKey={config.gameKey} />
          </section>
        </RevealSection>
      </div>

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
