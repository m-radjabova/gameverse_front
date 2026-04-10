import { generateGeminiJson, type GameDifficulty } from "../../apiClient/gemini";
import { getGradeRangeInstruction, getGradeRangeLabel, type GradeRange } from "../../utils/aiGeneration";

export type SupportedTeacherGameKey =
  | "quiz_battle"
  | "classic_arcade"
  | "wheel_of_fortune"
  | "math_race"
  | "math_chick"
  | "tug-of-war"
  | "baamboozle"
  | "jumanji"
  | "millionaire"
  | "truth_detector"
  | "treasure_hunt"
  | "reverse_thinking"
  | "frog-pond";

function difficultyInstruction(difficulty: GameDifficulty) {
  if (difficulty === "easy") return "Kontent oson bo'lsin, tez tushuniladigan va boshlang'ich darajaga mos bo'lsin.";
  if (difficulty === "medium") return "Kontent o'rtacha murakkablikda bo'lsin, biroz fikrlash talab qilsin.";
  if (difficulty === "hard") return "Kontent qiyinroq bo'lsin, chuqurroq bilim yoki kuchliroq mantiq talab qilsin.";
  return "Kontent aralash bo'lsin: easy, medium va hard darajalari balansli taqsimlansin.";
}

function normalizeDifficulty(value: unknown): "easy" | "medium" | "hard" | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "easy" || raw === "medium" || raw === "hard") return raw;
  return null;
}

function toStringArray(value: unknown, expected = 4): string[] | null {
  if (!Array.isArray(value)) return null;
  const items = value.slice(0, expected).map((item) => String(item ?? "").trim());
  if (items.length !== expected || items.some((item) => !item)) return null;
  if (new Set(items.map((item) => item.toLowerCase())).size !== expected) return null;
  return items;
}

function buildPrompt(gameKey: SupportedTeacherGameKey, topic: string, count: number, difficulty: GameDifficulty, gradeRange: GradeRange) {
  const safeTopic = topic.trim() || "umumiy bilim";
  const shared = [
    `Mavzu: ${safeTopic}.`,
    `Sinf oralig'i: ${getGradeRangeLabel(gradeRange)}.`,
    `- ${getGradeRangeInstruction(gradeRange)}`,
    `Soni: ${count}.`,
    `Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction(difficulty)}`,
    "Javob faqat JSON array bo'lsin, boshqa matn yozmang.",
    "Matn Uzbek (Latin) tilida bo'lsin.",
    "Savollar o'quvchilar uchun tushunarli, xavfsiz va maktab muhiti uchun mos bo'lsin.",
    "Takror savollar bo'lmasin.",
  ];

  switch (gameKey) {
    case "quiz_battle":
      return [
        `Quiz Battle uchun ${count} ta test savol yarating.`,
        'JSON: [{"question":"...","options":["...","...","...","..."],"answerIndex":0}]',
        "- Har bir savolda question, options, answerIndex bo'lsin.",
        "- options aniq 4 ta bo'lsin.",
        "- answerIndex 0 dan 3 gacha bo'lsin.",
        ...shared,
      ].join("\n");
    case "classic_arcade":
      return [
        `Classic Arcade uchun ${count} ta challenge savol yarating.`,
        'JSON: [{"prompt":"...","options":["...","...","...","..."],"correctIndex":0,"reason":"..."}]',
        "- Har bir savolda prompt, options, correctIndex, reason bo'lsin.",
        "- reason qisqa tushuntirish bo'lsin.",
        "- options aniq 4 ta bo'lsin.",
        ...shared,
      ].join("\n");
    case "wheel_of_fortune":
      return [
        `Wheel Of Fortune uchun ${count} ta test savol yarating.`,
        'JSON: [{"question":"...","options":["...","...","...","..."],"answerIndex":0,"category":"...","points":100}]',
        "- Har bir savolda question, options, answerIndex, category, points bo'lsin.",
        "- category mavzuga mos bo'lsin.",
        "- points 100, 200, 300 yoki 500 bo'lsin.",
        ...shared,
      ].join("\n");
    case "math_race":
      return [
        `Math Race uchun ${count} ta matematik misol yarating.`,
        'JSON: [{"question":"12 + 8 = ?","answer":20,"difficulty":"easy","points":10}]',
        "- Har bir elementda question, answer, difficulty, points bo'lsin.",
        "- answer butun son bo'lsin.",
        "- difficulty faqat easy, medium yoki hard bo'lsin.",
        "- points easy=10, medium=15, hard=20 qoidaga mos bo'lsin.",
        ...shared,
      ].join("\n");
    case "math_chick":
      return [
        `Math Chick uchun ${count} ta matematik savol yarating.`,
        'JSON: [{"question":"12 + 8 = ?","answer":20,"options":[18,20,22,24],"difficulty":"easy"}]',
        "- Har bir elementda question, answer, options, difficulty bo'lsin.",
        "- answer butun son bo'lsin.",
        "- options aniq 4 ta son bo'lsin.",
        "- options ichida answer bo'lishi shart.",
        "- difficulty faqat easy, medium yoki hard bo'lsin.",
        ...shared,
      ].join("\n");
    case "tug-of-war":
      return [
        `Tug Of War uchun ${count} ta matematik savol yarating.`,
        'JSON: [{"prompt":"12 + 8 = ?","answer":20,"level":"easy"}]',
        "- Har bir elementda prompt, answer, level bo'lsin.",
        "- answer butun son bo'lsin.",
        "- level faqat easy, medium yoki hard bo'lsin.",
        ...shared,
      ].join("\n");
    case "baamboozle":
      return [
        `Baamboozle uchun ${count} ta savol-javob yarating.`,
        'JSON: [{"question":"...","answer":"..."}]',
        "- Har bir elementda question va answer bo'lsin.",
        "- Javoblar qisqa va aniq bo'lsin.",
        ...shared,
      ].join("\n");
    case "frog-pond":
      return [
        `Frog Pond uchun ${count} ta 4 variantli test savol yarating.`,
        'JSON: [{"subject":"Matematika","question":"...","options":["...","...","...","..."],"answerIndex":0,"stage":1}]',
        "- Har bir elementda subject, question, options, answerIndex, stage bo'lsin.",
        "- options aniq 4 ta bo'lsin.",
        "- answerIndex 0 dan 3 gacha bo'lsin.",
        "- stage 1, 2 yoki 3 bo'lsin. Easy savollar stage=1, medium stage=2, hard stage=3 bo'lishi ma'qul.",
        ...shared,
      ].join("\n");
    case "jumanji":
      return [
        `Jumanji uchun ${count} ta test savol yarating.`,
        'JSON: [{"subject":"Matematika","question":"...","options":["...","...","...","..."],"correctAnswer":"...","difficulty":"easy","timeLimit":30}]',
        "- Har bir elementda subject, question, options, correctAnswer, difficulty, timeLimit bo'lsin.",
        "- subject quyidagilardan biri bo'lsin: Matematika, Ingliz tili, Ona tili, Tarix, Geografiya, Biologiya, Fizika, Kimyo, Aralash fanlar.",
        "- correctAnswer options ichidagi aynan bir qiymat bo'lsin.",
        "- timeLimit 20 dan 60 gacha bo'lsin.",
        ...shared,
      ].join("\n");
    case "millionaire":
      return [
        `Millionaire uchun ${count} ta test savol yarating.`,
        'JSON: [{"text":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","difficulty":"easy","category":"..."}]',
        "- Har bir elementda text, options, correct, difficulty, category bo'lsin.",
        "- correct faqat A, B, C yoki D bo'lsin.",
        "- difficulty faqat easy, medium yoki hard bo'lsin.",
        ...shared,
      ].join("\n");
    case "truth_detector":
      return [
        `Truth Detector uchun ${count} ta faktlar to'plami yarating.`,
        'JSON: [{"title":"...","difficulty":"easy","claims":[{"text":"...","truth":true},{"text":"...","truth":false},{"text":"...","truth":true}]}]',
        "- Har bir packda title, difficulty, claims bo'lsin.",
        "- claims uzunligi aniq 3 ta bo'lsin.",
        "- Har bir packda aynan 2 ta truth=true va 1 ta truth=false bo'lsin.",
        "- Yolg'on fakt ishonarli ko'rinsin, lekin aslida noto'g'ri bo'lsin.",
        ...shared,
      ].join("\n");
    case "treasure_hunt":
      return [
        `Treasure Hunt uchun ${count} ta savol yarating.`,
        'JSON: [{"title":"...","story":"...","question":"...","options":["...","...","...","..."],"answerIndex":0,"hint":"...","reward":120}]',
        "- Har bir elementda title, story, question, options, answerIndex, hint, reward bo'lsin.",
        "- story qisqa sarguzasht kontekst bo'lsin.",
        "- reward 50 dan 300 gacha son bo'lsin.",
        ...shared,
      ].join("\n");
    case "reverse_thinking":
      return [
        `Reverse Thinking uchun ${count} ta mantiqiy savol yarating.`,
        'JSON: [{"level":1,"question":"...","options":["...","...","...","..."],"correctAnswer":"...","explanation":"..."}]',
        "- Har bir elementda level, question, options, correctAnswer, explanation bo'lsin.",
        "- level 1 dan 5 gacha bo'lsin.",
        "- correctAnswer options ichidagi aynan bir variant bo'lsin.",
        "- explanation qisqa izoh bo'lsin.",
        ...shared,
      ].join("\n");
  }
}

function validateItems(gameKey: SupportedTeacherGameKey, payload: unknown, expectedCount: number) {
  if (!Array.isArray(payload)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi. Qayta urinib ko'ring.");
  }

  const items = payload
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Record<string, unknown>;

      switch (gameKey) {
        case "quiz_battle": {
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = Number(body.answerIndex);
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { question, options, answerIndex };
        }
        case "classic_arcade": {
          const prompt = String(body.prompt ?? "").trim();
          const options = toStringArray(body.options);
          const correctIndex = Number(body.correctIndex);
          const reason = String(body.reason ?? "").trim();
          if (!prompt || !options || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || !reason) return null;
          return { prompt, options, correctIndex, reason };
        }
        case "wheel_of_fortune": {
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = Number(body.answerIndex);
          const category = String(body.category ?? "").trim() || "AI";
          const pointsRaw = Number(body.points);
          const points = [100, 200, 300, 500].includes(pointsRaw) ? pointsRaw : 100;
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { question, options, answerIndex, category, points };
        }
        case "math_race": {
          const question = String(body.question ?? "").trim();
          const answer = Number(body.answer);
          const difficulty = normalizeDifficulty(body.difficulty);
          if (!question || !Number.isInteger(answer) || !difficulty) return null;
          const points = difficulty === "easy" ? 10 : difficulty === "medium" ? 15 : 20;
          return { question, answer, difficulty, points };
        }
        case "math_chick": {
          const question = String(body.question ?? "").trim();
          const answer = Number(body.answer);
          const difficulty = normalizeDifficulty(body.difficulty);
          const rawOptions = Array.isArray(body.options) ? body.options.slice(0, 4) : [];
          const options = rawOptions
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item));
          if (!question || !Number.isInteger(answer) || !difficulty || options.length !== 4) return null;
          if (!options.includes(answer)) return null;
          if (new Set(options).size !== 4) return null;
          return { question, answer, options, difficulty };
        }
        case "tug-of-war": {
          const prompt = String(body.prompt ?? "").trim();
          const answer = Number(body.answer);
          const level = normalizeDifficulty(body.level);
          if (!prompt || !Number.isInteger(answer) || !level) return null;
          return { prompt, answer, level };
        }
        case "baamboozle": {
          const question = String(body.question ?? "").trim();
          const answer = String(body.answer ?? "").trim();
          if (!question || !answer) return null;
          return { question, answer };
        }
        case "frog-pond": {
          const subject = String(body.subject ?? "").trim() || "AI savol";
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = Number(body.answerIndex);
          const stageRaw = Number(body.stage);
          const stage = Number.isFinite(stageRaw) ? Math.max(1, Math.min(3, Math.round(stageRaw))) : 1;
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { subject, question, options, answerIndex, answer: options[answerIndex], stage };
        }
        case "jumanji": {
          const subject = String(body.subject ?? "").trim();
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const correctAnswer = String(body.correctAnswer ?? "").trim();
          const difficulty = normalizeDifficulty(body.difficulty);
          const timeLimitRaw = Number(body.timeLimit);
          const timeLimit = Number.isFinite(timeLimitRaw) ? Math.max(20, Math.min(60, Math.round(timeLimitRaw))) : 30;
          if (!subject || !question || !options || !correctAnswer || !difficulty || !options.includes(correctAnswer)) return null;
          return { subject, question, options, correctAnswer, difficulty, timeLimit };
        }
        case "millionaire": {
          const text = String(body.text ?? "").trim();
          const difficulty = normalizeDifficulty(body.difficulty);
          const category = String(body.category ?? "").trim() || "AI";
          const optionsRaw = body.options;
          const correct = String(body.correct ?? "").trim().toUpperCase();
          if (!text || !difficulty || !["A", "B", "C", "D"].includes(correct)) return null;
          if (!optionsRaw || typeof optionsRaw !== "object" || Array.isArray(optionsRaw)) return null;
          const optionsObject = optionsRaw as Record<string, unknown>;
          const options = {
            A: String(optionsObject.A ?? "").trim(),
            B: String(optionsObject.B ?? "").trim(),
            C: String(optionsObject.C ?? "").trim(),
            D: String(optionsObject.D ?? "").trim(),
          };
          if (Object.values(options).some((value) => !value)) return null;
          return { text, options, correct, difficulty, category };
        }
        case "truth_detector": {
          const title = String(body.title ?? "").trim() || "AI faktlar to'plami";
          const difficulty = normalizeDifficulty(body.difficulty);
          const rawClaims = Array.isArray(body.claims) ? body.claims.slice(0, 3) : [];
          if (!difficulty || rawClaims.length !== 3) return null;
          const claims = rawClaims.map((claim) => ({
            text: String((claim as { text?: unknown })?.text ?? "").trim(),
            truth: Boolean((claim as { truth?: unknown })?.truth),
          }));
          if (claims.some((claim) => !claim.text)) return null;
          if (claims.filter((claim) => claim.truth).length !== 2) return null;
          return { title, difficulty, claims };
        }
        case "treasure_hunt": {
          const title = String(body.title ?? "").trim() || "AI sarguzasht";
          const story = String(body.story ?? "").trim();
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = Number(body.answerIndex);
          const hint = String(body.hint ?? "").trim();
          const rewardRaw = Number(body.reward);
          const reward = Number.isFinite(rewardRaw) ? Math.max(50, Math.min(300, Math.round(rewardRaw))) : 120;
          if (!story || !question || !options || !hint || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { title, story, question, options, answerIndex, hint, reward };
        }
        case "reverse_thinking": {
          const levelRaw = Number(body.level);
          const level = Number.isFinite(levelRaw) ? Math.max(1, Math.min(5, Math.round(levelRaw))) : 1;
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const correctAnswer = String(body.correctAnswer ?? "").trim();
          const explanation = String(body.explanation ?? "").trim();
          if (!question || !options || !correctAnswer || !explanation || !options.includes(correctAnswer)) return null;
          return { level, question, options, correctAnswer, explanation };
        }
      }
    })
    .filter(Boolean);

  if (items.length === 0) {
    throw new Error("AI mos savollar qaytarmadi.");
  }

  if (items.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta emas, ${items.length} ta element qaytardi.`);
  }

  return items.slice(0, expectedCount);
}

export async function generateTeacherPanelQuestions({
  gameKey,
  topic,
  count,
  difficulty,
  gradeRange,
}: {
  gameKey: SupportedTeacherGameKey;
  topic?: string;
  count: number;
  difficulty?: GameDifficulty;
  gradeRange?: GradeRange;
}) {
  const safeCount = Math.max(1, Math.min(20, Math.floor(count)));
  const safeDifficulty = difficulty ?? "medium";
  const safeGradeRange = gradeRange ?? "none";
  const prompt = buildPrompt(gameKey, topic ?? "", safeCount, safeDifficulty, safeGradeRange);
  const parsed = await generateGeminiJson(prompt);
  return validateItems(gameKey, parsed, safeCount);
}
