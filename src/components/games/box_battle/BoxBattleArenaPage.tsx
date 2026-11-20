import { useEffect, useMemo, useState } from "react";
import { getGameQuestionDifficulty, getGameSessionConfig } from "../../../hooks/gameSession";
import { fetchGameQuestions, fetchGameQuestionsByTeacher } from "../../../hooks/useGameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import BoxBattleArena, { type TeacherBoxQuestion } from "./BoxBattleArena";
import { preloadBoxBattleScene } from "./BoxBattle3DScene";

const GAME_KEY = "box_battle";
const GAME_ID = "box-battle";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toTeacherQuestions(items: unknown[]): TeacherBoxQuestion[] {
  const seen = new Set<string>();

  return items.flatMap((item) => {
    if (!isRecord(item)) return [];

    const prompt = String(item.prompt ?? item.question ?? "").trim();
    const rawOptions = Array.isArray(item.options) ? item.options : [];
    const options = rawOptions.map((o) => String(o ?? "").trim()).filter(Boolean);
    const correctIndex = item.correct_index ?? item.correctIndex ?? item.answerIndex;
    const optionIndex = Number(correctIndex);
    const optionAnswer =
      correctIndex != null && Number.isInteger(optionIndex) && rawOptions[optionIndex] != null
        ? String(rawOptions[optionIndex]).trim()
        : "";
    const answer = String(item.answer ?? item.answer_text ?? optionAnswer).trim();
    const key = `${prompt.toLocaleLowerCase()}__${answer.toLocaleLowerCase()}`;

    if (!prompt || !answer || seen.has(key)) return [];
    seen.add(key);

    // Ustozning o'z variantlari bo'lsa (javobni ham o'z ichiga olsa) — o'yin shularni ishlatadi
    const usableOptions = options.length >= 2 && options.includes(answer) ? options : undefined;
    return [{ prompt, answer, options: usableOptions }];
  });
}

const arenaDifficulty = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
} as const;

export default function BoxBattleArenaPage() {
  const {
    state: { user },
  } = useContextPro();
  const [teacherQuestions, setTeacherQuestions] = useState<TeacherBoxQuestion[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  const isTeacher = Boolean(
    user?.id && user.roles?.some((role: string) => role === "teacher" || role === "admin"),
  );
  const difficulty = useMemo(
    () => arenaDifficulty[getGameQuestionDifficulty(GAME_ID)],
    [],
  );
  const session = getGameSessionConfig(GAME_ID);
  const leftTeamName = session?.participantLabels[0]?.trim() || "1-Jamoa";
  const rightTeamName = session?.participantLabels[1]?.trim() || "2-Jamoa";

  useEffect(() => {
    let active = true;
    preloadBoxBattleScene();
    setQuestionsReady(false);
    setLoadError("");

    const load = async () => {
      if (!user?.id) {
        setTeacherQuestions([]);
        setQuestionsReady(true);
        return;
      }
      try {
        const items = isTeacher
          ? await fetchGameQuestionsByTeacher<unknown>(GAME_KEY, user?.id)
          : await fetchGameQuestions<unknown>(GAME_KEY);
        if (!active) return;
        if (items === null) {
          setLoadError("Teacher savollarini yuklab bo'lmadi. Hozir tayyor savollar bilan o'ynashingiz mumkin.");
          setTeacherQuestions([]);
          setQuestionsReady(true);
          return;
        }
        setTeacherQuestions(toTeacherQuestions(items));
        setQuestionsReady(true);
      } catch (error) {
        if (!active) return;
        console.error("Box Battle teacher savollarini yuklashda xatolik:", error);
        setLoadError("Teacher savollarini yuklab bo'lmadi. Hozir tayyor savollar bilan o'ynashingiz mumkin.");
        setTeacherQuestions([]);
        setQuestionsReady(true);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isTeacher, user?.id]);

  if (!questionsReady) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-4">
        <p className="rounded-2xl border border-white/15 bg-slate-950/70 px-6 py-4 font-semibold text-white" role="status">
          Teacher savollari yuklanmoqda...
        </p>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(145deg,#edf7ff_0%,#f5fbff_46%,#fff4dd_100%)] text-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(56,189,248,0.22),transparent_22%),radial-gradient(circle_at_86%_18%,rgba(244,114,182,0.14),transparent_24%),radial-gradient(circle_at_24%_82%,rgba(250,204,21,0.18),transparent_22%)]" />
      <main className="relative z-10 mx-auto max-w-[1540px] px-2 pb-5 pt-2 sm:px-3 sm:pb-8 sm:pt-3">
        {loadError ? (
          <p className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900" role="alert">
            {loadError}
          </p>
        ) : null}
        <BoxBattleArena
          gameTitle="Box Battle Arena"
          gameTone="from-cyan-500 to-fuchsia-500"
          leftTeamName={leftTeamName}
          rightTeamName={rightTeamName}
          initialDifficulty={difficulty}
          teacherQuestions={teacherQuestions}
          setupPath="/games/box-battle"
        />
      </main>
    </div>
  );
}
