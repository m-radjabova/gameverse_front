import { generateGeminiJson, type GameDifficulty } from "../../apiClient/gemini";
import { getGradeRangeInstruction, getGradeRangeLabel, type GradeRange } from "../../utils/aiGeneration";
import { getAiQuestionLanguageInstruction, getAiTopicInstruction } from "../../utils/aiQuestionLanguage";

export type SupportedTeacherGameKey =
  | "quiz_battle"
  | "classic_arcade"
  | "wheel_of_fortune"
  | "math_race"
  | "math_chick"
  | "tug_of_war"
  | "baamboozle"
  | "jumanji"
  | "millionaire"
  | "truth_detector"
  | "treasure_hunt"
  | "reverse_thinking"
  | "frog_pond"
  | "pizza_master"
  | "mystery_egg"
  | "bingo";

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
  const rawItems = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? ["A", "B", "C", "D"].map((key) => (value as Record<string, unknown>)[key])
      : [];
  const items = rawItems.slice(0, expected).map((item) => {
    if (item && typeof item === "object") {
      const option = item as Record<string, unknown>;
      return String(option.text ?? option.value ?? option.label ?? "").trim();
    }
    return String(item ?? "").trim();
  });
  if (items.length !== expected || items.some((item) => !item)) return null;
  if (new Set(items.map((item) => item.toLowerCase())).size !== expected) return null;
  return items;
}

function getAnswerIndex(body: Record<string, unknown>, options: string[]): number {
  const candidates = [
    body.answerIndex,
    body.correctIndex,
    body.correctOptionIndex,
    body.correctAnswer,
    body.correct,
    body.answer,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isInteger(candidate) && candidate >= 0 && candidate < options.length) {
      return candidate;
    }

    const value = String(candidate ?? "").trim();
    const letter = value.match(/^(?:option\s*)?([a-d])$/i)?.[1]?.toUpperCase();
    if (letter) return letter.charCodeAt(0) - 65;

    const optionIndex = options.findIndex((option) => option.toLocaleLowerCase() === value.toLocaleLowerCase());
    if (value && optionIndex >= 0) return optionIndex;
  }

  return Number(body.answerIndex);
}

function isMathSubject(subject: string) {
  return /\b(math|matemat|алгебр|математ)\w*/iu.test(subject);
}

function isLanguageSubject(subject: string) {
  return /\b(ingliz|english|rus|russian|ona tili|language)\b/iu.test(subject);
}

function isRussianSubject(subject: string) {
  return /\b(rus|russian)\b/iu.test(subject);
}

function getQuestionText(gameKey: SupportedTeacherGameKey, item: unknown): string {
  if (!item || typeof item !== "object") return "";
  const body = item as Record<string, unknown>;
  const value =
    gameKey === "bingo" || gameKey === "classic_arcade" || gameKey === "tug_of_war" ? body.prompt :
    gameKey === "millionaire" ? body.text :
    gameKey === "truth_detector" ? body.claims :
    body.question;

  if (Array.isArray(value)) {
    return value
      .map((claim) => (claim && typeof claim === "object" ? String((claim as Record<string, unknown>).text ?? "") : ""))
      .join(" ");
  }

  return String(value ?? "");
}

function getAnswerOptions(gameKey: SupportedTeacherGameKey, item: unknown): string[] {
  if (!item || typeof item !== "object") return [];
  const body = item as Record<string, unknown>;
  if (Array.isArray(body.options)) return body.options.map((option) => String(option ?? "").trim());
  if (gameKey === "bingo") return ["optionA", "optionB", "optionC"].map((key) => String(body[key] ?? "").trim());
  if (gameKey === "millionaire" && body.options && typeof body.options === "object") {
    const options = body.options as Record<string, unknown>;
    return ["A", "B", "C", "D"].map((key) => String(options[key] ?? "").trim());
  }
  return [];
}

function isQuestionAskingForNumber(question: string) {
  return /\b(how many|how much|what year|which year|nechta|qancha|necha|qaysi yilda|сколько|какого года|в каком году|какое число)\b/iu.test(question);
}

function getMathQuestionText(gameKey: SupportedTeacherGameKey, item: unknown): string {
  return getQuestionText(gameKey, item);
}

function getQuestionItems(payload: unknown, expectedCount: number, depth = 0): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object" || depth >= 3) return null;

  const body = payload as Record<string, unknown>;
  for (const key of ["questions", "items", "results", "data", "result", "output"]) {
    const nestedItems = getQuestionItems(body[key], expectedCount, depth + 1);
    if (nestedItems) return nestedItems;
  }

  if (expectedCount === 1 && ["question", "prompt", "text", "claims"].some((key) => key in body)) {
    return [payload];
  }

  return null;
}

function buildPrompt(gameKey: SupportedTeacherGameKey, topic: string, subject: string, count: number, difficulty: GameDifficulty, gradeRange: GradeRange) {
  const safeTopic = topic.trim() || "umumiy bilim";
  const safeSubject = subject.trim() || "Matematika";
  const shared = [
    `Fan: ${safeSubject}.`,
    `Mavzu: ${safeTopic}.`,
    `Sinf oralig'i: ${getGradeRangeLabel(gradeRange)}.`,
    `- ${getGradeRangeInstruction(gradeRange)}`,
    `Soni: ${count}.`,
    `Qiyinlik: ${difficulty}.`,
    `- ${difficultyInstruction(difficulty)}`,
    `Faqat ${count} ta elementdan iborat JSON array qaytaring. Markdown, izoh yoki qo'shimcha matn yozmang; arrayni obyekt ichiga joylamang.`,
    getAiQuestionLanguageInstruction(safeSubject),
    getAiTopicInstruction(safeTopic),
    `Tanlangan fan aynan ${safeSubject}; mavzu va savollar boshqa fanga o'tib ketmasin.`,
    "TEST VARIANTLARI: barcha variantlar savolga bevosita javob bersin, bir xil turdagi va aniq bo'lsin. To'g'ri javob ham variantlardan aynan bittasiga mos kelsin.",
    "Variantlarni to'liq va tushunarli yozing; mavhum, aloqasiz yoki faqat raqamdan iborat variant bermang. Raqamli variantni faqat savol son, miqdor yoki yilni so'raganda ishlating.",
    ...(isLanguageSubject(safeSubject)
      ? ["Til va grammatika savollarida variantlar grammatik atama yoki so'zning to'liq shakli bo'lsin; raqamli variant ishlatmang, agar savol sonni aniq so'ramasa."]
      : []),
    ...(isRussianSubject(safeSubject)
      ? ['Rus tili grammatikasida kelishik so\'ralsa, javob variantlarini "Именительный падеж", "Родительный падеж", "Дательный падеж" kabi to\'liq atamalar bilan yozing.']
      : []),
    ...(isMathSubject(safeSubject)
      ? [
          "MATEMATIKA FORMATI: barcha sonlarni so'z bilan emas, raqamlar bilan yozing.",
          "Arifmetik amallarda faqat raqamlar va belgilarni ishlating: masalan, \"12 + 8 = ?\"; \"o'n ikki qo'shuv sakkiz\" kabi yozmang.",
          "Har bir savol matnida kamida bitta raqam bo'lsin. Hisoblash savollarida sonlar va amallar aniq, yechimi to'g'ri bo'lsin.",
          "Hisoblashga oid javob va variantlar son ko'rinishida bo'lsin; sonlarni so'z bilan yozmang.",
        ]
      : []),
    "Savollar o'quvchilar uchun tushunarli, xavfsiz va maktab muhiti uchun mos bo'lsin.",
    "Takror savollar bo'lmasin.",
  ];

  switch (gameKey) {
    case "bingo":
      return [
        `Bingo uchun ${count} ta 3 variantli test savol yarating.`,
        'JSON: [{"emoji":"❓","title":"Mavzu","type":"quiz","prompt":"...","optionA":"...","optionB":"...","optionC":"...","correct":"A"}]',
        "- Har bir elementda emoji, title, type, prompt, optionA, optionB, optionC va correct bo'lsin.",
        "- type doim quiz, correct esa A, B yoki C bo'lsin.",
        ...shared,
      ].join("\n");
    case "quiz_battle":
      return [
        `Quiz Battle uchun ${count} ta test savol yarating.`,
        'JSON: [{"question":"...","options":["...","...","...","..."],"answerIndex":0}]',
        "- Har bir savolda question, options, answerIndex bo'lsin.",
        "- options aniq 4 ta bo'lsin.",
        "- answerIndex 0 dan 3 gacha bo'lsin.",
        ...shared,
      ].join("\n");
    case "pizza_master":
      return [
        `Pizza Master uchun ${count} ta 4 variantli test savol yarating.`,
        'JSON: [{"question":"9 x 7 = ?","options":["54","63","72","81"],"answerIndex":1}]',
        "- Har bir savolda question, options, answerIndex bo'lsin.",
        "- options aniq 4 ta bo'lsin.",
        "- answerIndex 0 dan 3 gacha bo'lsin.",
        ...shared,
      ].join("\n");
    case "mystery_egg":
      return [
        `Mystery Egg uchun ${count} ta 4 variantli test savol yarating.`,
        'JSON: [{"subject":"Matematika","question":"9 x 7 = ?","options":["54","63","72","81"],"answerIndex":1,"level":1}]',
        "- Har bir savolda subject, question, options, answerIndex va level bo'lsin.",
        "- options aniq 4 ta, answerIndex 0 dan 3 gacha bo'lsin.",
        "- level 1 dan 9 gacha bo'lsin; easy=1-3, medium=4-6, hard=7-9 darajalarga moslansin.",
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
    case "tug_of_war":
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
    case "frog_pond":
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
        "- subject tanlangan fan bilan aynan bir xil bo'lsin.",
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

function validateItems(gameKey: SupportedTeacherGameKey, payload: unknown, expectedCount: number, subject: string) {
  const questionItems = getQuestionItems(payload, expectedCount);
  if (!questionItems) throw new Error("AI savollarni kerakli formatda qaytarmadi. Yana bir marta urinib ko'ring.");

  if (
    isLanguageSubject(subject) &&
    questionItems.slice(0, expectedCount).some((item) => {
      const options = getAnswerOptions(gameKey, item);
      const question = getQuestionText(gameKey, item);
      return options.length > 0 && options.every((option) => /^\d+(?:[.,]\d+)?$/u.test(option)) && !isQuestionAskingForNumber(question);
    })
  ) {
    throw new Error("Til savoli variantlari raqam bo'lib qoldi. Savolni aniqroq yozib, qayta generatsiya qiling.");
  }

  if (isMathSubject(subject) && questionItems.slice(0, expectedCount).some((item) => !/\d/u.test(getMathQuestionText(gameKey, item)))) {
    throw new Error("Matematika savollari raqamlar bilan yozilmadi. Qayta urinib ko'ring.");
  }

  const items = questionItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Record<string, unknown>;

      switch (gameKey) {
        case "bingo": {
          const emoji = String(body.emoji ?? "❓").trim() || "❓";
          const title = String(body.title ?? "Savol").trim() || "Savol";
          const prompt = String(body.prompt ?? "").trim();
          const optionA = String(body.optionA ?? "").trim();
          const optionB = String(body.optionB ?? "").trim();
          const optionC = String(body.optionC ?? "").trim();
          const correct = String(body.correct ?? "").trim().toUpperCase();
          if (!prompt || !optionA || !optionB || !optionC || !["A", "B", "C"].includes(correct)) return null;
          return { emoji, title, type: "quiz", prompt, optionA, optionB, optionC, correct };
        }
        case "quiz_battle": {
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { question, options, answerIndex };
        }
        case "pizza_master": {
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { question, options, answerIndex };
        }
        case "mystery_egg": {
          const subject = String(body.subject ?? "").trim() || "Aralash fanlar";
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
          const levelRaw = Number(body.level);
          const level = Number.isFinite(levelRaw) ? Math.max(1, Math.min(9, Math.round(levelRaw))) : 1;
          if (!question || !options || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return null;
          return { subject, question, options, answerIndex, level };
        }
        case "classic_arcade": {
          const prompt = String(body.prompt ?? "").trim();
          const options = toStringArray(body.options);
          const correctIndex = options ? getAnswerIndex(body, options) : Number(body.correctIndex);
          const reason = String(body.reason ?? "").trim();
          if (!prompt || !options || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || !reason) return null;
          return { prompt, options, correctIndex, reason };
        }
        case "wheel_of_fortune": {
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
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
        case "tug_of_war": {
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
        case "frog_pond": {
          const subject = String(body.subject ?? "").trim() || "AI savol";
          const question = String(body.question ?? "").trim();
          const options = toStringArray(body.options);
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
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
          const answerIndex = options ? getAnswerIndex(body, options) : Number(body.answerIndex);
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
    throw new Error("AI savollarni to'g'ri tuza olmadi. Mavzu yoki fanni tekshirib, yana urinib ko'ring.");
  }

  if (items.length < expectedCount) {
    throw new Error(`AI ${expectedCount} ta savoldan ${items.length} tasinigina tayyorladi. Kamroq savol tanlab, qayta urinib ko'ring.`);
  }

  return items.slice(0, expectedCount);
}

export async function generateTeacherPanelQuestions({
  gameKey,
  topic,
  subject,
  count,
  difficulty,
  gradeRange,
}: {
  gameKey: SupportedTeacherGameKey;
  topic?: string;
  subject?: string;
  count: number;
  difficulty?: GameDifficulty;
  gradeRange?: GradeRange;
}) {
  const safeCount = Math.max(1, Math.min(20, Math.floor(count)));
  if (!topic?.trim()) {
    throw new Error("AI savollar aynan mos bo'lishi uchun mavzuni kiriting.");
  }
  const safeDifficulty = difficulty ?? "medium";
  const safeGradeRange = gradeRange ?? "none";
  const safeSubject = subject?.trim() || "Matematika";
  const prompt = buildPrompt(gameKey, topic ?? "", safeSubject, safeCount, safeDifficulty, safeGradeRange);
  const parsed = await generateGeminiJson(prompt);

  try {
    return validateItems(gameKey, parsed, safeCount, safeSubject);
  } catch {
    const retryPrompt = [
      prompt,
      "Oldingi javob kerakli formatga mos kelmadi. Qaytadan tuzing.",
      `Aynan ${safeCount} ta savol qaytaring. Har bir savolda yuqoridagi JSON namunasidagi barcha majburiy maydonlarni kiriting.`,
      "Test javobini raqamli indeks, A/B/C/D harfi yoki variant matni orqali bersangiz ham, u variantlardan aynan bittasiga mos bo'lsin.",
      "JSON arraydan boshqa hech qanday matn chiqarmang.",
    ].join("\n");
    const retried = await generateGeminiJson(retryPrompt);
    try {
      return validateItems(gameKey, retried, safeCount, safeSubject);
    } catch {
      throw new Error("AI savollarni to'g'ri formatda tayyorlay olmadi. Mavzuni tekshirib yoki savollar sonini kamaytirib, yana urinib ko'ring.");
    }
  }
}
