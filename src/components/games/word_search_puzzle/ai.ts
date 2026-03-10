import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";

export type WordSearchGeneratedWord = {
  word: string;
};

function buildWordSearchPrompt(topic: string, count: number, difficulty: GameDifficulty): string {
  const difficultyInstruction =
    difficulty === "easy"
      ? "So'zlar oson, keng tarqalgan va qisqa bo'lsin."
      : difficulty === "medium"
        ? "So'zlar o'rtacha qiyinlikda bo'lsin, uzunligi aralash bo'lsin."
        : difficulty === "hard"
          ? "So'zlar qiyinroq, kamroq ishlatiladigan yoki uzunroq bo'lsin."
          : "So'zlar aralash bo'lsin: oson, o'rta va qiyin darajadagi so'zlar balansli taqsimlansin.";

  return [
    `Word Search Puzzle o'yini uchun ${topic} mavzusida ${count} ta so'z yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    'JSON formati: [{"word":"PLANET"}]',
    "Talablar:",
    "- Har bir elementda faqat word maydoni bo'lsin.",
    "- So'zlar faqat katta lotin harflaridan iborat bo'lsin: A-Z.",
    "- Bo'sh joy, tire, apostrof, raqam va maxsus belgi ishlatilmasin.",
    "- Har bir so'z 3 dan 12 harfgacha bo'lsin.",
    "- So'zlar bir-biridan farqli bo'lsin, takror bo'lmasin.",
    "- Mavzuga mos bo'lsin.",
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function normalizeWord(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, "").trim();
}

function toValidatedWords(payload: unknown, expectedCount: number): string[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const unique = new Set<string>();

  for (const item of payload) {
    if (!item || typeof item !== "object") continue;
    const body = item as Partial<WordSearchGeneratedWord>;
    const normalized = normalizeWord(String(body.word ?? ""));
    if (normalized.length < 3 || normalized.length > 12) continue;
    unique.add(normalized);
  }

  const words = Array.from(unique);
  if (words.length === 0) {
    throw new Error("AI mos so'zlar qaytarmadi.");
  }

  if (words.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${words.length} ta so'z qaytardi.`);
  }

  return words.slice(0, expectedCount);
}

export async function generateWordSearchWords({
  topic,
  count,
  difficulty,
}: {
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
}): Promise<string[]> {
  const safeCount = Math.max(4, Math.min(16, Math.floor(count)));
  const safeTopic = topic?.trim() || "general knowledge";
  const safeDifficulty = difficulty ?? "medium";
  const prompt = buildWordSearchPrompt(safeTopic, safeCount, safeDifficulty);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedWords(parsed, safeCount);
}
