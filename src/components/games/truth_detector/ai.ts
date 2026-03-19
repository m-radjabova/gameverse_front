import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";

export type TruthDetectorGeneratedPack = {
  title?: string;
  difficulty: "easy" | "medium" | "hard";
  claims: [
    { text: string; truth: boolean },
    { text: string; truth: boolean },
    { text: string; truth: boolean },
  ];
};

type TruthDetectorPackCandidate = {
  title: string | undefined;
  difficulty: "easy" | "medium" | "hard";
  claims: TruthDetectorGeneratedPack["claims"];
} | null;

function buildTruthDetectorPrompt(topic: string, count: number, difficulty: GameDifficulty): string {
  const difficultyInstruction =
    difficulty === "easy"
      ? "Faktlar sodda, tez tushunarli va maktab o'quvchilari uchun yengil bo'lsin."
      : difficulty === "medium"
        ? "Faktlar o'rtacha murakkablikda bo'lsin, biroz fikrlash talab qilsin."
        : difficulty === "hard"
          ? "Faktlar qiyinroq va chalg'ituvchi bo'lsin, lekin tekshiriladigan va mantiqan toza bo'lsin."
          : "Faktlar aralash bo'lsin: oson, o'rta va qiyin packlar balansli chiqsin.";

  return [
    `Truth Detector o'yini uchun Uzbek (Latin) tilida ${count} ta faktlar to'plami yarating.`,
    "Har bir to'plamda aniq 3 ta claim bo'lsin: 2 tasi rost, 1 tasi yolg'on.",
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    'JSON formati: [{"title":"...","difficulty":"easy","claims":[{"text":"...","truth":true},{"text":"...","truth":false},{"text":"...","truth":true}]}]',
    "Talablar:",
    "- claims uzunligi doim 3 bo'lsin.",
    "- Har bir pack ichida aynan 2 ta truth=true va 1 ta truth=false bo'lsin.",
    "- Yolg'on fact ishonarli ko'rinsin, lekin aslida noto'g'ri bo'lsin.",
    "- Faktlar bir-biridan farqli bo'lsin, takror bo'lmasin.",
    "- Matnlar qisqa, aniq va sinf uchun mos bo'lsin.",
    "- Factlar zararli, siyosiy yoki noaniq bo'lmasin.",
    `- Mavzu: ${topic}.`,
    `- Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction}`,
    `- Soni: ${count}.`,
    difficulty === "mixed"
      ? "- difficulty maydonida easy, medium, hard qiymatlari packlar orasida aralash taqsimlansin."
      : `- Har bir pack difficulty maydoni "${difficulty}" bo'lsin.`,
  ].join("\n");
}

function normalizeDifficulty(value: string): "easy" | "medium" | "hard" | null {
  if (value === "easy" || value === "medium" || value === "hard") return value;
  return null;
}

function toValidatedTruthDetectorPacks(payload: unknown, expectedCount: number): TruthDetectorGeneratedPack[] {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat bo'lib kelmadi.");
  }

  const packs = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as {
        title?: unknown;
        difficulty?: unknown;
        claims?: Array<{ text?: unknown; truth?: unknown }>;
      };

      const difficulty = normalizeDifficulty(String(body.difficulty ?? "").trim().toLowerCase());
      const title = String(body.title ?? "").trim();
      const rawClaims = Array.isArray(body.claims) ? body.claims.slice(0, 3) : [];
      if (!difficulty || rawClaims.length !== 3) return null;

      const claims = rawClaims
        .map((claim) => ({
          text: String(claim?.text ?? "").trim(),
          truth: Boolean(claim?.truth),
        }))
        .filter((claim) => claim.text.length > 0);

      if (claims.length !== 3) return null;
      if (claims.filter((claim) => claim.truth).length !== 2) return null;
      if (new Set(claims.map((claim) => claim.text.toLowerCase())).size !== 3) return null;

      return {
        title: title || undefined,
        difficulty,
        claims: claims as TruthDetectorGeneratedPack["claims"],
      };
    })
    .filter((item): item is Exclude<TruthDetectorPackCandidate, null> => item !== null);

  if (packs.length === 0) {
    throw new Error("AI fact pack qaytarmadi.");
  }

  if (packs.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${packs.length} ta to'plam qaytardi.`);
  }

  return packs.slice(0, expectedCount);
}

export async function generateTruthDetectorPacks({
  topic,
  count,
  difficulty,
}: {
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
}): Promise<TruthDetectorGeneratedPack[]> {
  const safeCount = Math.max(1, Math.min(10, Math.floor(count)));
  const safeTopic = topic?.trim() || "general knowledge";
  const safeDifficulty = difficulty ?? "medium";
  const prompt = buildTruthDetectorPrompt(safeTopic, safeCount, safeDifficulty);
  const parsed = await generateGeminiJson(prompt);
  return toValidatedTruthDetectorPacks(parsed, safeCount);
}
