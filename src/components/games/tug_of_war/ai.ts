import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import { getGradeRangeInstruction, getGradeRangeLabel, type GradeRange } from "../../../utils/aiGeneration";

type TugOfWarProblem = {
  prompt: string;
  answer: number;
  level: "easy" | "medium" | "hard";
};

function buildTugOfWarPrompt(topic: string, count: number, difficulty: GameDifficulty, gradeRange: GradeRange) {
  const difficultyInstruction =
    difficulty === "easy"
      ? "Misollar sodda bo'lsin: qo'shish, ayirish yoki engil ko'paytirish."
      : difficulty === "medium"
        ? "Misollar o'rtacha bo'lsin: aralash amallar va biroz kattaroq sonlar ishlatilsin."
        : difficulty === "hard"
          ? "Misollar qiyin bo'lsin: murakkabroq ko'paytirish, bo'lish yoki aralash hisoblash bo'lsin."
          : "Misollar easy, medium va hard bo'lib aralash taqsimlansin.";

  return [
    `Tug Of War o'yini uchun ${count} ta matematik savol yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa izoh yozmang.",
    'JSON formati: [{"prompt":"18 ÷ 3 = ?","answer":6,"level":"easy"}]',
    "Talablar:",
    "- Har bir elementda prompt, answer, level maydoni bo'lsin.",
    "- level faqat easy, medium yoki hard bo'lsin.",
    "- answer butun son bo'lsin.",
    "- prompt qisqa matematik misol bo'lsin va ? bilan tugasin.",
    "- Misollar bir-biridan farq qilsin.",
    `- Mavzu: ${topic}.`,
    `- Sinf oralig'i: ${getGradeRangeLabel(gradeRange)}.`,
    `- ${getGradeRangeInstruction(gradeRange)}`,
    `- Qiyinlik talabi: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function toValidatedProblems(payload: unknown, expectedCount: number): TugOfWarProblem[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const problems = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const body = item as Partial<TugOfWarProblem>;
      const prompt = String(body.prompt ?? "").trim();
      const answer = Number(body.answer);
      const levelRaw = String(body.level ?? "").trim().toLowerCase();
      const level =
        levelRaw === "easy" || levelRaw === "medium" || levelRaw === "hard"
          ? levelRaw
          : null;

      if (!prompt || !Number.isInteger(answer) || !level) {
        return null;
      }

      return { prompt, answer, level } satisfies TugOfWarProblem;
    })
    .filter((item): item is TugOfWarProblem => Boolean(item));

  if (problems.length === 0) {
    throw new Error("AI savollar qaytarmadi.");
  }

  if (problems.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${problems.length} ta savol qaytardi.`);
  }

  return problems.slice(0, expectedCount);
}

export async function generateTugOfWarProblems({
  topic,
  count,
  difficulty,
  gradeRange,
}: {
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
  gradeRange?: GradeRange;
}) {
  const safeCount = Math.max(2, Math.min(12, Math.floor(count)));
  const safeTopic = topic?.trim() || "umumiy matematika";
  const safeDifficulty = difficulty ?? "medium";
  const safeGradeRange = gradeRange ?? "none";
  const prompt = buildTugOfWarPrompt(safeTopic, safeCount, safeDifficulty, safeGradeRange);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedProblems(parsed, safeCount);
}
