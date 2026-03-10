import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import type { Question } from "./types";

type GeneratedJumanjiQuestion = Omit<Question, "id">;

function buildJumanjiPrompt(subject: string, count: number, difficulty: GameDifficulty): string {
  const subjectInstruction =
    subject === "Aralash fanlar"
      ? "Savollar Matematika, Ingliz tili, Ona tili, Tarix, Geografiya, Biologiya va Informatika fanlaridan aralash bo'lsin."
      : `Savollar asosan ${subject} fanidan bo'lsin.`;

  const difficultyInstruction =
    difficulty === "easy"
      ? "Savollar oson bo'lsin, tushunarli va tez topiladigan bo'lsin."
      : difficulty === "medium"
        ? "Savollar o'rta darajada bo'lsin, biroz fikrlash talab qilsin."
        : difficulty === "hard"
          ? "Savollar qiyin bo'lsin, chuqurroq bilim talab qilsin."
          : "Savollar aralash bo'lsin: easy, medium va hard darajalari balansli taqsimlansin.";

  return [
    `Jumanji o'yini uchun Uzbek (Latin) tilida ${count} ta test savol yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    'JSON formati: [{"subject":"Matematika","question":"...","options":["...","...","...","..."],"correctAnswer":"...","difficulty":"easy","timeLimit":30}]',
    "Talablar:",
    "- Har bir savolda subject, question, options, correctAnswer, difficulty, timeLimit bo'lsin.",
    "- options aniq 4 ta bo'lsin.",
    "- correctAnswer optionlardan bittasiga aynan mos bo'lsin.",
    "- difficulty faqat easy, medium yoki hard bo'lsin.",
    "- timeLimit 20 dan 60 gacha son bo'lsin.",
    "- Savollar bir-biridan farqli bo'lsin.",
    "- Matnlar o'quvchilar uchun tushunarli bo'lsin.",
    `- Fan talabi: ${subject}.`,
    `- ${subjectInstruction}`,
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function normalizeTimeLimit(raw: number, difficulty: Question["difficulty"]): number {
  if (Number.isFinite(raw) && raw >= 20 && raw <= 60) return Math.round(raw);
  if (difficulty === "easy") return 30;
  if (difficulty === "medium") return 35;
  return 45;
}

function toValidatedJumanjiQuestions(payload: unknown, expectedCount: number): GeneratedJumanjiQuestion[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const questions = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Partial<GeneratedJumanjiQuestion>;
      const subject = String(body.subject ?? "").trim();
      const question = String(body.question ?? "").trim();
      const correctAnswer = String(body.correctAnswer ?? "").trim();
      const difficultyRaw = String(body.difficulty ?? "").trim().toLowerCase();
      const difficulty =
        difficultyRaw === "easy" || difficultyRaw === "medium" || difficultyRaw === "hard"
          ? difficultyRaw
          : null;
      const optionsRaw = Array.isArray(body.options)
        ? body.options.slice(0, 4).map((item) => String(item).trim())
        : [];
      const options = optionsRaw.length === 4 ? optionsRaw : null;

      if (!subject || !question || !correctAnswer || !difficulty || !options) return null;
      if (options.some((option) => !option)) return null;
      if (!options.includes(correctAnswer)) return null;

      return {
        subject,
        question,
        options,
        correctAnswer,
        difficulty,
        timeLimit: normalizeTimeLimit(Number(body.timeLimit), difficulty),
      } satisfies GeneratedJumanjiQuestion;
    })
    .filter((item): item is GeneratedJumanjiQuestion => Boolean(item));

  if (questions.length === 0) {
    throw new Error("AI savollar qaytarmadi.");
  }

  if (questions.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${questions.length} ta savol qaytardi.`);
  }

  return questions.slice(0, expectedCount);
}

export async function generateJumanjiQuestions({
  subject,
  count,
  difficulty,
}: {
  subject?: string;
  count: number;
  difficulty?: GameDifficulty;
}): Promise<GeneratedJumanjiQuestion[]> {
  const safeCount = Math.max(4, Math.min(24, Math.floor(count)));
  const safeSubject = subject?.trim() || "Aralash fanlar";
  const safeDifficulty = difficulty ?? "medium";
  const prompt = buildJumanjiPrompt(safeSubject, safeCount, safeDifficulty);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedJumanjiQuestions(parsed, safeCount);
}
