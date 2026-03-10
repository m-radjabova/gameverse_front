import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import type { Difficulty, MathQuestion } from "./types";

type GeneratedMathQuestion = Omit<MathQuestion, "id">;

function buildMathRacePrompt(count: number, difficulty: GameDifficulty): string {
  const difficultyInstruction =
    difficulty === "easy"
      ? "Misollar oson bo'lsin: sodda qo'shish, ayirish, ko'paytirish yoki bo'lish."
      : difficulty === "medium"
        ? "Misollar o'rtacha bo'lsin: biroz kattaroq sonlar va aralash amallar ishlatilsin."
        : difficulty === "hard"
          ? "Misollar qiyin bo'lsin: kattaroq sonlar yoki murakkabroq hisoblash talab qilinsin."
          : "Misollar aralash bo'lsin: easy, medium va hard darajalari balansli taqsimlansin.";

  return [
    `Math Race o'yini uchun ${count} ta matematik misol yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    'JSON formati: [{"question":"12 + 7 = ?","answer":19,"difficulty":"easy","points":10}]',
    "Talablar:",
    "- Har bir elementda question, answer, difficulty, points maydoni bo'lsin.",
    "- difficulty faqat easy, medium yoki hard bo'lsin.",
    "- answer butun son bo'lsin.",
    "- question qisqa matematik misol bo'lsin va '=' yoki '?' bilan tugasin.",
    "- points easy uchun 10, medium uchun 15, hard uchun 20 bo'lsin.",
    "- Misollar bir-biridan farqli bo'lsin.",
    `- Qiyinlik talabi: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function pointsForDifficulty(difficulty: Difficulty): number {
  if (difficulty === "easy") return 10;
  if (difficulty === "medium") return 15;
  return 20;
}

function toValidatedMathQuestions(payload: unknown, expectedCount: number): GeneratedMathQuestion[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const questions = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Partial<GeneratedMathQuestion>;
      const question = String(body.question ?? "").trim();
      const answerNumber = Number(body.answer);
      const difficultyRaw = String(body.difficulty ?? "").trim().toLowerCase();
      const difficulty =
        difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
          ? difficultyRaw
          : null;

      if (!question || !Number.isInteger(answerNumber) || !difficulty) return null;

      return {
        question,
        answer: answerNumber,
        difficulty,
        points: pointsForDifficulty(difficulty),
      } satisfies GeneratedMathQuestion;
    })
    .filter((item): item is GeneratedMathQuestion => Boolean(item));

  if (questions.length === 0) {
    throw new Error("AI misollar qaytarmadi.");
  }

  if (questions.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${questions.length} ta misol qaytardi.`);
  }

  return questions.slice(0, expectedCount);
}

export async function generateMathRaceQuestions({
  count,
  difficulty,
}: {
  count: number;
  difficulty?: GameDifficulty;
}): Promise<GeneratedMathQuestion[]> {
  const safeCount = Math.max(2, Math.min(20, Math.floor(count)));
  const safeDifficulty = difficulty ?? "medium";
  const prompt = buildMathRacePrompt(safeCount, safeDifficulty);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedMathQuestions(parsed, safeCount);
}
