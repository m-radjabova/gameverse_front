import { useEffect, useMemo, useRef, useState } from "react";

type Student = {
  id: string;
  name: string;
  score: number;
};

type Props = {
  students: Student[];
  mustSpin: boolean;
  prizeNumber: number;
  onStopSpinning: () => void;
};

const SEGMENT_COLORS = ["#E11D48", "#F59E0B", "#0EA5E9", "#10B981", "#8B5CF6", "#F97316", "#14B8A6", "#EC4899"];

const SPIN_SECONDS = 5.5;
const C = 200; // svg centre
const R = 192; // wheel radius (viewBox units)

const polar = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180; // 0deg = 12 o'clock, clockwise
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
};

/**
 * Own wheel (no library). Segment i is centred at (i + 0.5) * seg degrees, clockwise from the top.
 * The pointer is at the top, so rotating by -(i + 0.5) * seg puts segment i exactly under the pointer.
 * This is why the announced winner always matches what the pointer shows.
 */
export default function StudentWheel({ students, mustSpin, prizeNumber, onStopSpinning }: Props) {
  const n = students.length;
  const seg = 360 / Math.max(n, 1);

  const [rotation, setRotation] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const rotRef = useRef(0);
  const spinningRef = useRef(false);

  // New set of students -> reset the wheel instantly (no animation)
  useEffect(() => {
    spinningRef.current = false;
    rotRef.current = 0;
    setAnimate(false);
    setRotation(0);
    setStoppedAt(null);
  }, [students]);

  useEffect(() => {
    if (!mustSpin || n === 0 || spinningRef.current) return;
    spinningRef.current = true;
    setStoppedAt(null);

    const jitter = (Math.random() - 0.5) * seg * 0.7; // stay well inside the segment, never on a border
    const target = -((prizeNumber + 0.5) * seg) + jitter;
    const cur = rotRef.current;
    const norm = (v: number) => ((v % 360) + 360) % 360;
    let delta = norm(target) - norm(cur);
    if (delta <= 0) delta += 360;
    const next = cur + delta + 360 * (5 + Math.floor(Math.random() * 2));

    rotRef.current = next;
    setAnimate(true);
    setRotation(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mustSpin]);

  const handleEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !spinningRef.current) return;
    spinningRef.current = false;
    setStoppedAt(prizeNumber);
    onStopSpinning();
  };

  const fontSize = n > 14 ? 14 : n > 10 ? 17 : n > 6 ? 21 : 26;
  const maxChars = Math.max(6, Math.floor(130 / (fontSize * 0.6)));

  const segments = useMemo(
    () =>
      students.map((s, i) => {
        const a0 = i * seg;
        const a1 = (i + 1) * seg;
        const p0 = polar(a0, R);
        const p1 = polar(a1, R);
        const large = seg > 180 ? 1 : 0;
        const isOddLast = n > 1 && n % SEGMENT_COLORS.length === 1 && i === n - 1;
        return {
          id: s.id,
          path: `M${C},${C} L${p0.x},${p0.y} A${R},${R} 0 ${large} 1 ${p1.x},${p1.y} Z`,
          color: isOddLast ? "#64748B" : SEGMENT_COLORS[i % SEGMENT_COLORS.length],
          mid: (i + 0.5) * seg,
          label: s.name.length > maxChars ? `${s.name.slice(0, maxChars - 1)}…` : s.name,
        };
      }),
    [students, seg, n, maxChars],
  );

  if (n === 0) return null;

  return (
    <div className="sw-size relative flex items-center justify-center">
      <style>{`
        .sw-size{--s:clamp(260px, calc(100vw - 72px), 520px)}
        @media (min-width:1024px){.sw-size{--s:clamp(300px, min(calc(100dvh - 300px), calc(100vw - 420px)), 860px)}}
        @media (prefers-reduced-motion: reduce){.sw-rotor{transition-duration:1.2s !important}}
      `}</style>

      <div className="absolute inset-4 rounded-full bg-amber-400/20 blur-3xl" />

      <div className="relative rounded-full bg-gradient-to-b from-amber-300 to-amber-600 p-3 shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        <div className="rounded-full bg-slate-950 p-1.5">
          <div className="overflow-hidden rounded-full" style={{ width: "var(--s)", height: "var(--s)" }}>
            <div
              className="sw-rotor h-full w-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: animate ? `transform ${SPIN_SECONDS}s cubic-bezier(.13,.67,.1,1)` : "none",
                willChange: "transform",
              }}
              onTransitionEnd={handleEnd}
            >
              <svg viewBox="0 0 400 400" className="h-full w-full">
                {segments.map((s, i) => (
                  <g key={s.id} opacity={stoppedAt !== null && stoppedAt !== i ? 0.35 : 1} style={{ transition: "opacity .4s" }}>
                    <path d={s.path} fill={s.color} stroke="#ffffff66" strokeWidth={1.5} />
                    <g transform={`rotate(${s.mid - 90} ${C} ${C})`}>
                      <text
                        x={C + R - 14}
                        y={C}
                        textAnchor="end"
                        dominantBaseline="central"
                        fill="#fff"
                        fontWeight={800}
                        fontSize={fontSize}
                        fontFamily="inherit"
                      >
                        {s.label}
                      </text>
                    </g>
                  </g>
                ))}
                <circle cx={C} cy={C} r={30} fill="#0f172a" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ring of lights */}
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,.7)]"
            style={{
              left: `calc(50% + ${Math.cos((i / 24) * Math.PI * 2) * 49.2}% - 5px)`,
              top: `calc(50% + ${Math.sin((i / 24) * Math.PI * 2) * 49.2}% - 5px)`,
              opacity: i % 2 ? 0.55 : 1,
            }}
          />
        ))}
      </div>

      {/* Pointer: the segment under its tip is ALWAYS the winner */}
      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 drop-shadow-[0_6px_10px_rgba(0,0,0,.6)]">
        <div className="h-0 w-0 border-x-[26px] border-t-[56px] border-x-transparent border-t-white" />
        <div className="absolute left-1/2 top-1 h-0 w-0 -translate-x-1/2 border-x-[19px] border-t-[42px] border-x-transparent border-t-rose-600" />
      </div>
    </div>
  );
}