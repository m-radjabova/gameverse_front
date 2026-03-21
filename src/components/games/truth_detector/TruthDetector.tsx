import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaGamepad, FaRedo, FaRobot, FaSave, FaTimes, FaTrash, FaUsers } from "react-icons/fa";
import { PiDetective } from "react-icons/pi";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import { hasAnyRole } from "../../../utils/roles";
import { generateTruthDetectorPacks } from "./ai";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../../utils/aiGeneration";

type Difficulty = "easy" | "medium" | "hard";
type FakeLetter = "A" | "B" | "C";

type Claim = { id: string; text: string; truth: boolean };
type RoundPack = { id: string; title?: string; difficulty: Difficulty; claims: [Claim, Claim, Claim] };
type TeamId = "A" | "B";
type Team = { id: TeamId; name: string; score: number; pickIndex: number | null };
type PackDraft = { difficulty: Difficulty; claimA: string; claimB: string; claimC: string; fakeLetter: FakeLetter };

const TRUTH_DETECTOR_GAME_KEY = "truth_detector";

function safeParsePacks(jsonText: string): { ok: true; packs: RoundPack[] } | { ok: false; error: string } {
  try {
    const data = JSON.parse(jsonText);
    if (!Array.isArray(data)) return { ok: false, error: "JSON massiv bo'lishi kerak" };
    const packs: RoundPack[] = data.map((p: any, idx: number) => {
      const claims = Array.isArray(p?.claims) ? p.claims : [];
      if (claims.length !== 3) throw new Error(`Faktlar #${idx + 1}: 3 ta gap bo'lishi shart`);
      const normClaims = claims.map((c: any, i: number) => ({ id: String(c?.id ?? `${p?.id ?? idx}-c${i}`), text: String(c?.text ?? "").trim(), truth: Boolean(c?.truth) })) as [Claim, Claim, Claim];
      if (normClaims.some((c) => !c.text)) throw new Error(`Faktlar #${idx + 1}: matnlar bo'sh bo'lmasin`);
      if (normClaims.filter((c) => c.truth).length !== 2) throw new Error(`Faktlar #${idx + 1}: 2 TRUE va 1 FAKE bo'lishi kerak`);
      const diff = String(p?.difficulty ?? "easy").toLowerCase();
      const difficulty = (["easy", "medium", "hard"].includes(diff) ? diff : "easy") as Difficulty;
      return { id: String(p?.id ?? `pack-${idx}`), title: p?.title ? String(p.title) : undefined, difficulty, claims: normClaims };
    });
    if (!packs.length) return { ok: false, error: "Faktlar bo'sh" };
    return { ok: true, packs };
  } catch (e: any) {
    return { ok: false, error: e?.message || "JSON parse xato" };
  }
}

function difficultyForRound(round: number): Difficulty {
  if (round <= 4) return "easy";
  if (round <= 8) return "medium";
  return "hard";
}

const DEMO_PACKS: RoundPack[] = [
  { id: "e1", title: "Kundalik faktlar", difficulty: "easy", claims: [
    { id: "e1-1", text: "Quyosh sharqdan chiqadi.", truth: true },
    { id: "e1-2", text: "Bir hafta 8 kundan iborat.", truth: false },
    { id: "e1-3", text: "Suv qattiq, suyuq va gaz holatida bo'lishi mumkin.", truth: true },
  ] },
  { id: "e2", title: "Ovqat va hayot", difficulty: "easy", claims: [
    { id: "e2-1", text: "Asal to'g'ri saqlansa uzoq buzilmaydi.", truth: true },
    { id: "e2-2", text: "Sabzi ichidan ko'k bo'ladi.", truth: false },
    { id: "e2-3", text: "Banan tarkibida kaliy bor.", truth: true },
  ] },
  { id: "m1", title: "Texnologiya", difficulty: "medium", claims: [
    { id: "m1-1", text: "HTTP veb aloqa protokoli.", truth: true },
    { id: "m1-2", text: "JavaScript brauzerda ishlamaydi.", truth: false },
    { id: "m1-3", text: "QR kod shtrix-kod turi.", truth: true },
  ] },
  { id: "m2", title: "Koinot", difficulty: "medium", claims: [
    { id: "m2-1", text: "Oy ko'pincha Yerga bir xil tomonini ko'rsatadi.", truth: true },
    { id: "m2-2", text: "Yupiter Yerdan kichik.", truth: false },
    { id: "m2-3", text: "Mars Qizil sayyora deyiladi.", truth: true },
  ] },
  { id: "h1", title: "Mantiqiy savollar", difficulty: "hard", claims: [
    { id: "h1-1", text: "1 bayt 8 bitga teng.", truth: true },
    { id: "h1-2", text: "Barcha tub sonlar toq.", truth: false },
    { id: "h1-3", text: "0 juft son.", truth: true },
  ] },
];

const EMPTY_PACK_DRAFT: PackDraft = { difficulty: "easy", claimA: "", claimB: "", claimC: "", fakeLetter: "A" };
const AI_PACK_COUNT_OPTIONS = [1, 3, 5, 8] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rtacha" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;

function TruthDetector() {
  const { state } = useContextPro();
  const canManageQuestions = hasAnyRole(state.user, ["teacher", "admin"]);
  const skipInitialRemoteSaveRef = useRef(true);
  const nextRoundTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<"setup" | "play">("setup");
  const [teamAInput, setTeamAInput] = useState("1-jamoa");
  const [teamBInput, setTeamBInput] = useState("2-jamoa");
  const [teams, setTeams] = useState<Team[]>([]);
  const [round, setRound] = useState(1);
  const [teacherPacks, setTeacherPacks] = useState<RoundPack[]>([]);
  const [usedPackIds, setUsedPackIds] = useState<Set<string>>(new Set());
  const [currentPack, setCurrentPack] = useState<RoundPack | null>(null);
  const [reveal, setReveal] = useState(false);
  const [msg, setMsg] = useState("");

  const [draft, setDraft] = useState<PackDraft>(EMPTY_PACK_DRAFT);
  const [teacherMsg, setTeacherMsg] = useState("");
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiPackCount, setAiPackCount] = useState<number>(3);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const allPacks = useMemo(() => [...DEMO_PACKS, ...teacherPacks], [teacherPacks]);
  const desiredDiff = useMemo(() => difficultyForRound(round), [round]);
  const allTeamsPicked = useMemo(() => teams.length === 2 && teams.every((t) => t.pickIndex !== null), [teams]);
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  useEffect(() => {
    let alive = true;
    (async () => {
      const remotePacks = await fetchGameQuestions<RoundPack>(TRUTH_DETECTOR_GAME_KEY);
      if (!alive) return;
      if (remotePacks?.length) {
        const parsed = safeParsePacks(JSON.stringify(remotePacks));
        if (parsed.ok) setTeacherPacks(parsed.packs);
      }
      setRemoteLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!remoteLoaded || !canManageQuestions) return;
    if (skipInitialRemoteSaveRef.current) { skipInitialRemoteSaveRef.current = false; return; }
    const t = window.setTimeout(async () => {
      const ok = await saveGameQuestions<RoundPack>(TRUTH_DETECTOR_GAME_KEY, teacherPacks, state.user?.id);
      setTeacherMsg(ok ? "Faktlar backendga saqlandi." : "Saqlashda xato bo'ldi.");
    }, 500);
    return () => window.clearTimeout(t);
  }, [teacherPacks, remoteLoaded, canManageQuestions, state.user?.id]);

  useEffect(() => () => { if (nextRoundTimerRef.current) window.clearTimeout(nextRoundTimerRef.current); }, []);

  useEffect(() => {
    if (!reveal || phase !== "play") return;
    if (nextRoundTimerRef.current) window.clearTimeout(nextRoundTimerRef.current);
    nextRoundTimerRef.current = window.setTimeout(() => nextRound(), 2200);
    return () => { if (nextRoundTimerRef.current) window.clearTimeout(nextRoundTimerRef.current); };
  }, [reveal, phase]);

  function pickPack(nextDiff: Difficulty, avoid: Set<string>): RoundPack {
    const candidates = allPacks.filter((p) => p.difficulty === nextDiff && !avoid.has(p.id));
    if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
    const fallback = allPacks.filter((p) => !avoid.has(p.id));
    if (fallback.length) return fallback[Math.floor(Math.random() * fallback.length)];
    return allPacks[Math.floor(Math.random() * allPacks.length)];
  }

  function startGame() {
    const teamA = teamAInput.trim() || "1-jamoa";
    const teamB = teamBInput.trim() || "2-jamoa";
    if (teamA.toLowerCase() === teamB.toLowerCase()) return setMsg("Ikkala jamoa nomi har xil bo'lsin.");

    const initialTeams: Team[] = [
      { id: "A", name: teamA, score: 0, pickIndex: null },
      { id: "B", name: teamB, score: 0, pickIndex: null },
    ];

    const used = new Set<string>();
    const pack = pickPack("easy", used);
    used.add(pack.id);

    setTeams(initialTeams);
    setUsedPackIds(used);
    setCurrentPack(pack);
    setRound(1);
    setReveal(false);
    setMsg("");
    setPhase("play");
  }

  function pick(teamId: TeamId, claimIndex: number) {
    if (phase !== "play" || reveal) return;
    setTeams((prev) => prev.map((team) => team.id === teamId ? { ...team, pickIndex: claimIndex } : team));
  }

  function revealAnswers() {
    if (phase !== "play" || !currentPack) return;
    if (teams.some((t) => t.pickIndex === null)) return setMsg("Avval 2 ta jamoa ham A/B/C tanlasin.");

    const fakeIdx = currentPack.claims.findIndex((c) => c.truth === false);
    const winners = teams.filter((t) => t.pickIndex === fakeIdx).map((t) => t.name);

    setReveal(true);
    setTeams((prev) => prev.map((t) => ({ ...t, score: t.score + (t.pickIndex === fakeIdx ? 1 : 0) })));
    setMsg(
      winners.length
        ? `FAKE: ${["A", "B", "C"][fakeIdx]}. Ball oldi: ${winners.join(", ")}.`
        : `FAKE: ${["A", "B", "C"][fakeIdx]}. Bu raundda hech kim topolmadi.`
    );
  }

  function nextRound() {
    if (phase !== "play" || !currentPack) return;
    const nextRoundNum = round + 1;
    const used = new Set(usedPackIds);
    const pack = pickPack(difficultyForRound(nextRoundNum), used);
    used.add(pack.id);
    setUsedPackIds(used);
    setCurrentPack(pack);
    setRound(nextRoundNum);
    setReveal(false);
    setMsg("");
    setTeams((prev) => prev.map((t) => ({ ...t, pickIndex: null })));
  }

  function resetAll() {
    setPhase("setup");
    setTeams([]);
    setRound(1);
    setUsedPackIds(new Set());
    setCurrentPack(null);
    setReveal(false);
    setMsg("");
    setTeamAInput("1-jamoa");
    setTeamBInput("2-jamoa");
  }

  function addTeacherPack() {
    const a = draft.claimA.trim();
    const b = draft.claimB.trim();
    const c = draft.claimC.trim();

    if (!a || !b || !c) return setTeacherMsg("3 ta faktni to'liq kiriting.");
    if (new Set([a, b, c].map((x) => x.toLowerCase())).size < 3) return setTeacherMsg("A, B, C gaplar bir xil bo'lmasin.");

    const fakeIdx = draft.fakeLetter === "A" ? 0 : draft.fakeLetter === "B" ? 1 : 2;
    const stamp = Date.now();

    const pack: RoundPack = {
      id: `teacher-${stamp}-${Math.random().toString(36).slice(2, 7)}`,
      title: `Faktlar to'plami`,
      difficulty: draft.difficulty,
      claims: [
        { id: `a-${stamp}`, text: a, truth: fakeIdx !== 0 },
        { id: `b-${stamp}`, text: b, truth: fakeIdx !== 1 },
        { id: `c-${stamp}`, text: c, truth: fakeIdx !== 2 },
      ],
    };

    setTeacherPacks((prev) => [...prev, pack]);
    setDraft(EMPTY_PACK_DRAFT);
    setTeacherMsg("Faktlar qo'shildi. Avtomatik saqlanadi.");
  }

  function removeTeacherPack(packId: string) {
    setTeacherPacks((prev) => prev.filter((p) => p.id !== packId));
    setTeacherMsg("Faktlar o'chirildi.");
  }

  async function generateAiPacks() {
    if (isGeneratingAi) return;

    try {
      setIsGeneratingAi(true);
      setTeacherMsg("");
      const generated = await generateTruthDetectorPacks({
        topic: aiTopic,
        count: aiPackCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });

      const stamp = Date.now();
      const mapped: RoundPack[] = generated.map((pack, index) => ({
        id: `ai-${stamp}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        title: pack.title?.trim() || `AI faktlar #${index + 1}`,
        difficulty: pack.difficulty,
        claims: pack.claims.map((claim, claimIndex) => ({
          id: `ai-${stamp}-${index}-c${claimIndex}`,
          text: claim.text,
          truth: claim.truth,
        })) as [Claim, Claim, Claim],
      }));

      setTeacherPacks((prev) => [...prev, ...mapped]);
      setTeacherMsg(`AI ${mapped.length} ta faktlar to'plamini qo'shdi.`);
    } catch (error) {
      setTeacherMsg(error instanceof Error ? error.message : "AI fakt yaratishda xato bo'ldi.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  const fakeIndex = useMemo(() => (currentPack ? currentPack.claims.findIndex((c) => !c.truth) : -1), [currentPack]);
  const leaders = useMemo(() => {
    if (!teams.length) return [];
    const max = Math.max(...teams.map((t) => t.score));
    return teams.filter((t) => t.score === max).map((t) => t.name);
  }, [teams]);

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy": return "Oson";
      case "medium": return "O'rtacha";
      case "hard": return "Qiyin";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PiDetective className="text-3xl text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Truth Detector</h1>
            </div>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-300/80">2 ta jamoa o'ynaydi. 2 ta rost, 1 ta yolg'onni topgan jamoa +1 ball oladi.</p>
            <p className="text-xs text-indigo-500/80 dark:text-indigo-400/80 mt-1">Faktlar to'plami: {allPacks.length} (o'qituvchi: {teacherPacks.length})</p>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-200 shadow-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-2"><FaRedo /> Reset</button>
          </div>
        </div>

        {canManageQuestions && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 p-5 shadow-xl">
            <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-1">O'qituvchi uchun fakt qo'shish</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-300 mb-3">1) 3 ta fakt yozing. 2) Qaysi biri yolg'onligini belgilang. 3) Saqlang.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={draft.difficulty} onChange={(e) => setDraft((p) => ({ ...p, difficulty: e.target.value as Difficulty }))} className="px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100">
                <option value="easy">Daraja: Oson</option>
                <option value="medium">Daraja: O'rtacha</option>
                <option value="hard">Daraja: Qiyin</option>
              </select>
              <select value={draft.fakeLetter} onChange={(e) => setDraft((p) => ({ ...p, fakeLetter: e.target.value as FakeLetter }))} className="px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100">
                <option value="A">Yolg'on: 1-fakt</option>
                <option value="B">Yolg'on: 2-fakt</option>
                <option value="C">Yolg'on: 3-fakt</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <input value={draft.claimA} onChange={(e) => setDraft((p) => ({ ...p, claimA: e.target.value }))} placeholder="1-fakt" className="px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-300/70" />
              <input value={draft.claimB} onChange={(e) => setDraft((p) => ({ ...p, claimB: e.target.value }))} placeholder="2-fakt" className="px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-300/70" />
              <input value={draft.claimC} onChange={(e) => setDraft((p) => ({ ...p, claimC: e.target.value }))} placeholder="3-fakt" className="px-4 py-2 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-300/70" />
            </div>

            <div className="mt-4 rounded-2xl border-2 border-cyan-300/60 bg-cyan-50/70 p-4 dark:border-cyan-700 dark:bg-cyan-950/20">
              <div className="mb-3 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <FaRobot />
                <p className="text-sm font-bold">AI FAKT GENERATSIYASI</p>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <textarea
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Mavzu: hayvonlar, kosmos, tarix..."
                  className="min-h-[92px] px-4 py-2 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 bg-white/80 dark:bg-slate-900/50 text-slate-900 dark:text-cyan-100 placeholder-cyan-500/70 dark:placeholder-cyan-300/60 md:col-span-2 xl:col-span-2"
                />
                <select
                  value={aiGradeRange}
                  onChange={(e) => setAiGradeRange(e.target.value as GradeRange)}
                  className="px-4 py-2 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 bg-white/80 dark:bg-slate-900/50 text-slate-900 dark:text-cyan-100"
                >
                  {GRADE_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={aiPackCount}
                  onChange={(e) => setAiPackCount(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 bg-white/80 dark:bg-slate-900/50 text-slate-900 dark:text-cyan-100"
                >
                  {AI_PACK_COUNT_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count} ta to'plam
                    </option>
                  ))}
                </select>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                  className="px-4 py-2 rounded-xl border-2 border-cyan-200 dark:border-cyan-700 bg-white/80 dark:bg-slate-900/50 text-slate-900 dark:text-cyan-100"
                >
                  {AI_DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => void generateAiPacks()}
                  disabled={!hasGeminiKey || isGeneratingAi}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {isGeneratingAi ? `${aiPackCount} ta yaratilmoqda...` : `AI bilan ${aiPackCount} ta yaratish`}
                </button>
              </div>
              <p className="mt-3 text-xs text-cyan-700/80 dark:text-cyan-200/80">
                AI har bir to'plam uchun 3 ta fact yaratadi: 2 tasi rost, 1 tasi yolg'on. Sinf oralig'i berilsa fakt murakkabligi ham moslashadi.
              </p>
            </div>

            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={addTeacherPack} className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"><FaSave className="inline mr-2" />Faktlarni qo'shish</button>
              {teacherMsg && <p className="text-sm py-2 text-indigo-700 dark:text-indigo-300">{teacherMsg}</p>}
            </div>

            {teacherPacks.length > 0 && (
              <div className="mt-4 space-y-2">
                {teacherPacks.map((pack) => (
                  <div key={pack.id} className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/20 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-indigo-900 dark:text-indigo-100">{pack.title || "Faktlar to'plami"}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-300">{getDifficultyText(pack.difficulty)} | {pack.claims.map((c) => c.text).join(" | ")}</p>
                    </div>
                    <button onClick={() => removeTeacherPack(pack.id)} className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"><FaTrash /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === "setup" && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-indigo-900 dark:text-indigo-100"><FaUsers /><h2 className="text-2xl font-black">2 TA JAMOA</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={teamAInput} onChange={(e) => setTeamAInput(e.target.value)} placeholder="1-jamoa nomi" className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-300/70" />
              <input value={teamBInput} onChange={(e) => setTeamBInput(e.target.value)} placeholder="2-jamoa nomi" className="w-full px-4 py-3 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 placeholder-indigo-400 dark:placeholder-indigo-300/70" />
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={startGame} className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold ml-auto"><FaGamepad className="inline mr-2" />BOSHLASH</button>
            </div>

            {msg && <div className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-500/15 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 font-semibold">{msg}</div>}
          </div>
        )}

        {phase === "play" && currentPack && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-sm text-indigo-500 dark:text-indigo-400">Raund</p><p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">#{round}</p></div>
                <div><p className="text-sm text-indigo-500 dark:text-indigo-400">Daraja</p><p className="font-bold text-indigo-900 dark:text-indigo-100">{getDifficultyText(desiredDiff)}</p></div>
              </div>

              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-between">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-100">{team.name} {team.pickIndex === null ? "" : `(Tanlov: ${["A", "B", "C"][team.pickIndex]})`}</span>
                    <span className="font-bold text-indigo-700 dark:text-indigo-300">{team.score}</span>
                  </div>
                ))}
              </div>

              {!reveal && (
                <div className="mt-4 p-3 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/20 space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{team.name}</span>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((claimIdx) => (
                          <button
                            key={claimIdx}
                            onClick={() => pick(team.id, claimIdx)}
                            className={`px-3 py-1 rounded-lg ${team.pickIndex === claimIdx ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-600"}`}
                          >
                            {["A", "B", "C"][claimIdx]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {leaders.length > 0 && <p className="mt-3 text-sm text-yellow-700 dark:text-yellow-300">Yetakchi: {leaders.join(", ")}</p>}
              {msg && <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300 font-semibold">{msg}</p>}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-indigo-300 dark:border-indigo-700 p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">{currentPack.title || "Qaysi biri yolg'on?"}</h2>
              <p className="text-sm text-indigo-500 dark:text-indigo-400 mb-4">Har jamoa A/B/C dan bittasini yolg'on deb tanlaydi.</p>

              <div className="space-y-3">
                {currentPack.claims.map((c, idx) => {
                  const letter = ["A", "B", "C"][idx];
                  const isFake = idx === fakeIndex;
                  return (
                    <div key={c.id} className={`p-4 rounded-xl border-2 ${reveal && isFake ? "border-red-400 bg-red-50 dark:bg-red-500/15" : reveal ? "border-green-400 bg-green-50 dark:bg-green-500/15" : "border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"}`}>
                      <div className="font-semibold text-indigo-900 dark:text-indigo-100">{letter}. {c.text}</div>
                      {reveal && <div className="mt-2 text-sm font-bold">{isFake ? <span className="text-red-600"><FaTimes className="inline mr-1" />FAKE</span> : <span className="text-green-600"><FaCheck className="inline mr-1" />TRUE</span>}</div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={revealAnswers} disabled={reveal || !allTeamsPicked} className="py-3 rounded-xl bg-indigo-600 text-white font-bold disabled:opacity-50"><FaEye className="inline mr-2" />NATIJANI KO'RSAT</button>
                <button onClick={nextRound} disabled={!reveal} className="py-3 rounded-xl bg-emerald-500 text-white font-bold disabled:opacity-50"><FaEyeSlash className="inline mr-2" />KEYINGI RAUND</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TruthDetector;
