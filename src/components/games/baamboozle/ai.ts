import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import { getGradeRangeInstruction, getGradeRangeLabel, type GradeRange } from "../../../utils/aiGeneration";

export type BaamboozleGeneratedQuestion = {
  question: string;
  answer: string;
};

function buildBaamboozlePrompt(subject: string, topic: string, count: number, difficulty: GameDifficulty, gradeRange: GradeRange): string {
  const difficultyInstruction =
    difficulty === "easy"
      ? "Savollar oson bo'lsin, javoblari qisqa va sodda bo'lsin."
      : difficulty === "medium"
        ? "Savollar o'rta darajada bo'lsin, o'quvchidan biroz fikrlash talab qilsin."
        : difficulty === "hard"
          ? "Savollar qiyin bo'lsin, chuqurroq bilim talab qilsin."
          : "Savollar oson, o'rta va qiyin darajada aralash bo'lsin.";

  return [
    `Baamboozle o'yini uchun Uzbek (Latin) tilida ${count} ta savol-javob yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    'JSON formati: [{"question":"...","answer":"..."}]',
    "Talablar:",
    "- Har bir elementda question va answer maydoni bo'lsin.",
    "- Savollar bir-biridan farqli bo'lsin, takror bo'lmasin.",
    "- Savol va javoblar dars uchun mos, qisqa va aniq bo'lsin.",
    "- Javoblar iloji boricha 1-6 so'z oralig'ida bo'lsin.",
    `- Mavzu: ${topic}.`,
    `- Fan/mavzu: ${subject}.`,
    `- Sinf oralig'i: ${getGradeRangeLabel(gradeRange)}.`,
    `- ${getGradeRangeInstruction(gradeRange)}`,
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function toValidatedBaamboozleQuestions(payload: unknown, expectedCount: number): BaamboozleGeneratedQuestion[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const questions = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Partial<BaamboozleGeneratedQuestion>;
      const question = String(body.question ?? "").trim();
      const answer = String(body.answer ?? "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is BaamboozleGeneratedQuestion => Boolean(item));

  if (questions.length === 0) {
    throw new Error("AI savollar qaytarmadi.");
  }

  if (questions.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${questions.length} ta savol qaytardi.`);
  }

  return questions.slice(0, expectedCount);
}

export async function generateBaamboozleQuestions({
  subject,
  topic,
  count,
  difficulty,
  gradeRange,
}: {
  subject?: string;
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
  gradeRange?: GradeRange;
}): Promise<BaamboozleGeneratedQuestion[]> {
  const safeCount = Math.max(4, Math.min(24, Math.floor(count)));
  const safeSubject = subject?.trim() || "Umumiy fan";
  const safeTopic = topic?.trim() || "umumiy mavzu";
  const safeDifficulty = difficulty ?? "medium";
  const safeGradeRange = gradeRange ?? "none";
  const prompt = buildBaamboozlePrompt(safeSubject, safeTopic, safeCount, safeDifficulty, safeGradeRange);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedBaamboozleQuestions(parsed, safeCount);
}
