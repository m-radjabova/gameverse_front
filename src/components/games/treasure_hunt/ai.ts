import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import { getGradeRangeInstruction, getGradeRangeLabel, type GradeRange } from "../../../utils/aiGeneration";
import type { Riddle } from "./types";

type TreasureHuntGeneratedRiddle = Omit<Riddle, "id">;

function buildTreasureHuntPrompt(theme: string, count: number, difficulty: GameDifficulty, gradeRange: GradeRange): string {
  const isSingle = count === 1;
  const difficultyInstruction =
    difficulty === "easy"
      ? "Savollar oson darajada bo'lsin, javoblari juda murakkab bo'lmasin."
      : difficulty === "medium"
        ? "Savollar o'rta darajada bo'lsin, biroz fikrlash talab qilsin."
        : difficulty === "hard"
          ? "Savollar qiyin darajada bo'lsin, kuchliroq mantiq va bilim talab qilsin."
          : "Savollar turli qiyinlikda bo'lsin: oson, o'rta va qiyin aralash bo'lsin.";

  return [
    `Treasure Hunt o'yini uchun Uzbek (Latin) tilida ${count} ta savol to'plami yarating.`,
    "Javob faqat JSON bo'lsin, hech qanday qo'shimcha matn yozmang.",
    isSingle ? "JSON formati:" : "JSON formati: yuqoridan pastga faqat array qaytaring.",
    isSingle
      ? '{"title":"...","story":"...","question":"...","options":["...","...","...","..."],"answerIndex":0,"hint":"...","reward":120}'
      : '[{"title":"...","story":"...","question":"...","options":["...","...","...","..."],"answerIndex":0,"hint":"...","reward":120}]',
    "Talablar:",
    "- Har bir savolda options aniq 4 ta bo'lsin.",
    "- answerIndex 0-3 oralig'ida bo'lsin va to'g'ri javobga mos bo'lsin.",
    "- Matnlar bolalar uchun tushunarli va qisqa bo'lsin.",
    "- Savollar bir-biridan farqli bo'lsin, takror bo'lmasin.",
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Mavzu: ${theme}.`,
    `- Sinf oralig'i: ${getGradeRangeLabel(gradeRange)}.`,
    `- ${getGradeRangeInstruction(gradeRange)}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function toValidatedRiddle(payload: unknown): TreasureHuntGeneratedRiddle {
  if (!payload || typeof payload !== "object") {
    throw new Error("AI javobi yaroqsiz formatda keldi.");
  }

  const body = payload as Partial<TreasureHuntGeneratedRiddle>;
  const title = String(body.title ?? "").trim();
  const story = String(body.story ?? "").trim();
  const question = String(body.question ?? "").trim();
  const hint = String(body.hint ?? "").trim();
  const rewardNum = Number(body.reward);
  const reward = Number.isFinite(rewardNum) && rewardNum >= 10 ? Math.round(rewardNum) : 120;
  const optionsRaw = Array.isArray(body.options) ? body.options.slice(0, 4).map((x) => String(x).trim()) : [];

  if (!title || !story || !question || !hint || optionsRaw.length !== 4 || optionsRaw.some((x) => !x)) {
    throw new Error("AI yetarli maydonlarni qaytarmadi. Qayta urinib ko'ring.");
  }

  const options = optionsRaw as [string, string, string, string];
  const answerIndexNum = Number(body.answerIndex);
  const answerIndex = Number.isInteger(answerIndexNum) && answerIndexNum >= 0 && answerIndexNum <= 3 ? answerIndexNum : 0;

  return { title, story, question, options, answerIndex, hint, reward };
}

function toValidatedRiddles(payload: unknown, expectedCount: number): TreasureHuntGeneratedRiddle[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const riddles = payload.map((item) => toValidatedRiddle(item));
  if (riddles.length === 0) {
    throw new Error("AI savollar qaytarmadi.");
  }
  if (riddles.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${riddles.length} ta savol qaytardi.`);
  }

  return riddles.slice(0, expectedCount);
}

export async function generateTreasureHuntRiddle(topic?: string): Promise<TreasureHuntGeneratedRiddle> {
  const theme = topic?.trim() || "general knowledge";
  const [riddle] = await generateTreasureHuntRiddles({ topic: theme, count: 1 });
  return riddle;
}

export async function generateTreasureHuntRiddles({
  topic,
  count,
  difficulty,
  gradeRange,
}: {
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
  gradeRange?: GradeRange;
}): Promise<TreasureHuntGeneratedRiddle[]> {
  const safeCount = Math.max(1, Math.min(20, Math.floor(count)));
  const theme = topic?.trim() || "umumiy bilim";
  const safeDifficulty = difficulty ?? "medium";
  const safeGradeRange = gradeRange ?? "none";
  const prompt = buildTreasureHuntPrompt(theme, safeCount, safeDifficulty, safeGradeRange);
  const parsed = await generateGeminiJson(prompt);
  return safeCount === 1 ? [toValidatedRiddle(parsed)] : toValidatedRiddles(parsed, safeCount);
}
