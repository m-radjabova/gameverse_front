import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";

export type ClassicArcadeGeneratedChallenge = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  reason: string;
};

function buildClassicArcadePrompt(topic: string, count: number, difficulty: GameDifficulty): string {
  const difficultyInstruction =
    difficulty === "easy"
      ? "Challenge'lar oson bo'lsin, javoblari sodda va tez topiladigan bo'lsin."
      : difficulty === "medium"
        ? "Challenge'lar o'rta darajada bo'lsin, biroz fikrlash talab qilsin."
        : difficulty === "hard"
          ? "Challenge'lar qiyin bo'lsin, kuchliroq mantiq yoki bilim talab qilsin."
          : "Challenge'lar aralash bo'lsin: oson, o'rta va qiyin challenge'lar balansli taqsimlansin.";

  return [
    `Classic Arcade o'yini uchun Uzbek (Latin) tilida ${count} ta 'odd one out' challenge yarating.`,
    "Javob faqat JSON array bo'lsin, boshqa hech narsa yozmang.",
    'JSON formati: [{"prompt":"...","options":["...","...","...","..."],"correctIndex":0,"reason":"..."}]',
    "Talablar:",
    "- Har bir challenge'da aniq 4 ta variant bo'lsin.",
    "- correctIndex 0 dan 3 gacha bo'lsin.",
    "- Faqat bitta variant to'g'ri bo'lsin.",
    "- reason qisqa va aniq izoh bo'lsin.",
    "- Savollar bir-biridan farqli bo'lsin, takror bo'lmasin.",
    "- Matnlar dars uchun mos, tushunarli va qisqa bo'lsin.",
    `- Mavzu: ${topic}.`,
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
  ].join("\n");
}

function toValidatedClassicArcadeChallenges(
  payload: unknown,
  expectedCount: number,
): ClassicArcadeGeneratedChallenge[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const challenges = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Partial<ClassicArcadeGeneratedChallenge>;
      const prompt = String(body.prompt ?? "").trim();
      const reason = String(body.reason ?? "").trim();
      const rawOptions = Array.isArray(body.options) ? body.options.slice(0, 4).map((value) => String(value).trim()) : [];
      const options = rawOptions.length === 4 ? (rawOptions as [string, string, string, string]) : null;
      const correctIndexNumber = Number(body.correctIndex);
      const correctIndex =
        Number.isInteger(correctIndexNumber) && correctIndexNumber >= 0 && correctIndexNumber <= 3
          ? correctIndexNumber
          : -1;

      if (!prompt || !reason || !options || options.some((option) => !option)) return null;
      if (new Set(options.map((option) => option.toLowerCase())).size !== 4) return null;
      if (correctIndex < 0) return null;

      return {
        prompt,
        options,
        correctIndex,
        reason,
      };
    })
    .filter((item): item is ClassicArcadeGeneratedChallenge => Boolean(item));

  if (challenges.length === 0) {
    throw new Error("AI challenge qaytarmadi.");
  }

  if (challenges.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${challenges.length} ta challenge qaytardi.`);
  }

  return challenges.slice(0, expectedCount);
}

export async function generateClassicArcadeChallenges({
  topic,
  count,
  difficulty,
}: {
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
}): Promise<ClassicArcadeGeneratedChallenge[]> {
  const safeCount = Math.max(1, Math.min(15, Math.floor(count)));
  const safeTopic = topic?.trim() || "general knowledge";
  const safeDifficulty = difficulty ?? "medium";
  const prompt = buildClassicArcadePrompt(safeTopic, safeCount, safeDifficulty);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedClassicArcadeChallenges(parsed, safeCount);
}
