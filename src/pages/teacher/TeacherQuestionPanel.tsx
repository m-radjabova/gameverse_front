import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FaArrowRight,
  FaBolt,
  FaBookOpen,
  FaBrain,
  FaCheck,
  FaChevronRight,
  FaClock,
  FaCrown,
  FaEdit,
  FaExclamationCircle,
  FaGem,
  FaGraduationCap,
  FaHistory,
  FaLayerGroup,
  FaListUl,
  FaPlus,
  FaRegLightbulb,
  FaRobot,
  FaSave,
  FaSearch,
  FaStar,
  FaSyncAlt,
  FaThLarge,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { MdAutoAwesome } from "react-icons/md";
import { generateTeacherPanelQuestions, type SupportedTeacherGameKey } from "./teacherQuestionPanelAi";
import type { GameDifficulty } from "../../apiClient/gemini";
import useContextPro from "../../hooks/useContextPro";
import useGameQuestions from "../../hooks/useGameQuestions";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../utils/aiGeneration";
import { gameCards } from "../games/data";
import useHomeTheme from "../../hooks/useHomeTheme";

/* ════════════════════════════════════════════
   Types
   ════════════════════════════════════════════ */

type GameRegistryItem = {
  gameKey: string;
  title: string;
  path: string;
  emoji: string;
  accent: string;
  template: unknown;
  description?: string;
};

type EditorMode = "manual" | "ai";
type WorkspaceView = "dashboard" | "questions" | "create";
type GameFilter = "all" | "filled" | "empty";

type QuestionActivity = {
  gameKey: string;
  addedCount: number;
  updatedAt: string;
};

/* ════════════════════════════════════════════
   Constants
   ════════════════════════════════════════════ */

const DEFAULT_ACCENT = "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]";
const RECOMMENDED_QUESTIONS = 10;
const LIST_PAGE_SIZE = 30;

const GAME_TEMPLATES: Record<string, unknown> = {
  quiz_battle: { question: "", options: ["", "", "", ""], answerIndex: 0, difficulty: "easy" },
  classic_arcade: { prompt: "", options: ["", "", "", ""], correctIndex: 0, reason: "", difficulty: "easy" },
  wheel_of_fortune: { question: "", options: ["", "", "", ""], answerIndex: 0, category: "", points: 100, difficulty: "easy" },
  math_race: { question: "", answer: 0, difficulty: "easy", points: 10 },
  math_chick: { question: "", answer: 0, options: ["", "", "", ""], difficulty: "easy" },
  tug_of_war: { prompt: "", answer: 0, level: "easy" },
  baamboozle: { question: "", answer: "", difficulty: "easy" },
  jumanji: { subject: "Matematika", question: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "easy", timeLimit: 30 },
  millionaire: { text: "", options: { A: "", B: "", C: "", D: "" }, correct: "A", difficulty: "easy", category: "" },
  truth_detector: {
    title: "Faktlar to'plami",
    difficulty: "easy",
    claims: [
      { id: "a-1", text: "", truth: true },
      { id: "b-1", text: "", truth: false },
      { id: "c-1", text: "", truth: true },
    ],
  },
  treasure_hunt: { title: "", story: "", question: "", options: ["", "", "", ""], answerIndex: 0, hint: "", reward: 120, difficulty: "easy" },
  reverse_thinking: { level: 1, question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
  frog_pond: { subject: "Matematika", question: "", options: ["", "", "", ""], answerIndex: 0, stage: 1 },
  pizza_master: { subject: "Matematika", question: "", options: ["", "", "", ""], answerIndex: 0, difficulty: "easy" },
  mystery_egg: { subject: "Matematika", question: "", options: ["", "", "", ""], answerIndex: 0, level: 1 },
  bingo: { emoji: "❓", title: "Savol", type: "quiz", prompt: "", optionA: "", optionB: "", optionC: "", correct: "A", difficulty: "easy" },
};

const GAME_EMOJIS: Record<string, string> = {
  quiz_battle: "⚡",
  classic_arcade: "🧠",
  wheel_of_fortune: "🎡",
  math_race: "🏎️",
  math_chick: "🐥",
  tug_of_war: "🪢",
  baamboozle: "🎲",
  jumanji: "🌿",
  millionaire: "💰",
  truth_detector: "🕵️",
  treasure_hunt: "🗺️",
  reverse_thinking: "🔄",
  frog_pond: "🐸",
  pizza_master: "🍕",
  mystery_egg: "🥚",
  bingo: "🎯",
};

// Faqat standart (tema) rangidan farq qiladigan o'yinlar yoziladi.
const GAME_ACCENTS: Record<string, string> = {
  math_chick: "from-amber-400 to-sky-400",
  frog_pond: "from-emerald-400 to-sky-400",
  pizza_master: "from-orange-500 to-red-500",
  mystery_egg: "from-violet-500 to-lime-400",
  bingo: "from-indigo-500 to-fuchsia-500",
};

function cardIdToGameKey(id: string): string {
  return id.replaceAll("-", "_");
}

const GAME_REGISTRY: GameRegistryItem[] = gameCards
  .filter((card) => GAME_TEMPLATES[cardIdToGameKey(card.id)] !== undefined)
  .map((card) => {
    const gameKey = cardIdToGameKey(card.id);
    return {
      gameKey,
      title: card.title,
      path: card.path,
      emoji: GAME_EMOJIS[gameKey] ?? "🎮",
      accent: GAME_ACCENTS[gameKey] ?? DEFAULT_ACCENT,
      template: GAME_TEMPLATES[gameKey] ?? {},
      description: card.description,
    };
  });

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function teacherActivityStorageKey(teacherId?: string) {
  return `gameverse.teacher-question-activity.${teacherId ?? "anonymous"}`;
}

function readQuestionActivity(teacherId?: string): QuestionActivity[] {
  try {
    const value = localStorage.getItem(teacherActivityStorageKey(teacherId));
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is QuestionActivity =>
            item && typeof item.gameKey === "string" && Number.isFinite(item.addedCount) && typeof item.updatedAt === "string",
        )
      : [];
  } catch {
    return [];
  }
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Hozirgina" : date.toLocaleString("uz-UZ", { dateStyle: "medium", timeStyle: "short" });
}

const LABELS_UZ: Record<string, string> = {
  id: "ID",
  question: "Savol",
  text: "Matn",
  prompt: "Savol matni",
  title: "Sarlavha",
  story: "Hikoya",
  hint: "Yordam",
  reward: "Mukofot",
  points: "Ball",
  answer: "Javob",
  answerIndex: "To'g'ri variant",
  correctIndex: "To'g'ri variant",
  correctAnswer: "To'g'ri javob",
  correct: "To'g'ri javob",
  difficulty: "Qiyinlik",
  category: "Kategoriya",
  subject: "Fan",
  level: "Daraja",
  timeLimit: "Vaqt limiti (soniya)",
  stage: "Bosqich",
  options: "Variantlar",
  claims: "Faktlar",
  truth: "Rost",
  claimA: "1-fakt",
  claimB: "2-fakt",
  claimC: "3-fakt",
  reason: "Izoh",
  explanation: "Izoh",
  type: "Turi",
  emoji: "Emoji",
  optionA: "A variant",
  optionB: "B variant",
  optionC: "C variant",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Oson",
  medium: "O'rtacha",
  hard: "Qiyin",
  mixed: "Aralash",
};

const BADGE_STYLES: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-500",
  medium: "bg-amber-500/15 text-amber-500",
  hard: "bg-rose-500/15 text-rose-500",
};

const SUBJECT_OPTIONS = [
  "Matematika",
  "Ingliz tili",
  "Rus tili",
  "Ona tili",
  "Tarix",
  "Geografiya",
  "Biologiya",
  "Fizika",
  "Kimyo",
  "Adabiyot",
  "Informatika",
  "Aralash fanlar",
];

const AI_COUNT_OPTIONS = [1, 3, 5, 10, 15, 20] as const;
const MYSTERY_EGG_LEVEL_OPTIONS = [
  { value: 1, label: "1 — Forest Egg (Oson)", detail: "Sehrli o'rmon" },
  { value: 2, label: "2 — Ocean Egg (O'rta)", detail: "Moviy qa'r" },
  { value: 3, label: "3 — Volcano Egg (O'rta)", detail: "Olovli cho'qqi" },
  { value: 4, label: "4 — Ice Egg (Qiyin)", detail: "Muz saroyi" },
  { value: 5, label: "5 — Thunder Egg (Qiyin)", detail: "Chaqmoq vodiysi" },
  { value: 6, label: "6 — Sakura Egg (Qiyin)", detail: "Gullar bog'i" },
  { value: 7, label: "7 — Galaxy Egg (Ekspert)", detail: "Sirli koinot" },
  { value: 8, label: "8 — Royal Egg (Ekspert)", detail: "Qirollik siri" },
  { value: 9, label: "9 — Rainbow Egg (Ekspert)", detail: "Afsonaviy final" },
] as const;

/** Asosiy maydonlar sifatida ko'rsatiladigan kalitlar; "Qo'shimcha maydonlar"da takrorlanmaydi. */
const HANDLED_KEYS = new Set([
  "title", "story", "subject", "category", "difficulty", "level", "stage",
  "question", "prompt", "text", "options", "correctAnswer", "correct",
  "hint", "explanation", "reward", "points", "timeLimit", "answer",
  "correctOptionIndex", "claims", "id", "answerIndex", "correctIndex",
]);

const aiCountPlaceholder = "__COUNT__";

function getAiPanelContent(gameKey: string) {
  if (gameKey === "baamboozle") {
    return {
      heading: "Savol-javoblarni avtomatik yaratish",
      description: "Mavzu, savollar soni va qiyinlikni tanlang. AI Baamboozle uchun qisqa savol va aniq javoblar qo'shadi.",
      topicLabel: "Mavzu yoki fan",
      topicPlaceholder: "Masalan: hayvonlar, tarixiy sanalar, ingliz tili so'zlari...",
      buttonLabel: `AI bilan ${aiCountPlaceholder} ta savol-javob qo'shish`,
      loadingLabel: `${aiCountPlaceholder} ta savol-javob yaratilmoqda...`,
      footnote: `"Aralash" tanlansa, oson, o'rtacha va qiyin savollar birga yaratiladi.`,
    };
  }

  return {
    heading: "Savollarni avtomatik yaratish",
    description: "Mavzu, savollar soni va qiyinlikni tanlang. AI yangi savollarni shu o'yin ro'yxatiga qo'shadi.",
    topicLabel: "Mavzu",
    topicPlaceholder: "Masalan: kasrlar, geografiya, hayvonlar...",
    buttonLabel: `AI bilan ${aiCountPlaceholder} ta savol qo'shish`,
    loadingLabel: `${aiCountPlaceholder} ta savol yaratilmoqda...`,
    footnote: `"Aralash" tanlansa, oson, o'rtacha va qiyin savollar birga yaratiladi.`,
  };
}

const normalizeAnswerText = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u201B\u2032\u02BC]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("uz");

/* ════════════════════════════════════════════
   Validation / normalization (mantiq o'zgarmagan)
   ════════════════════════════════════════════ */

function validateDraftItem(gameKey: string, draftValue: unknown) {
  if (!draftValue || typeof draftValue !== "object") return "Savol formati noto'g'ri.";
  const value = draftValue as Record<string, unknown>;

  if (gameKey === "math_chick") {
    const question = String(value.question ?? "").trim();
    const answer = Number(value.answer);
    const rawOptions = Array.isArray(value.options) ? value.options : [];
    const options = rawOptions
      .map((item) => Number(String(item ?? "").trim()))
      .filter((item) => Number.isInteger(item));

    if (!question) return "Math Chick uchun savol matnini kiriting.";
    if (!Number.isInteger(answer)) return "Math Chick uchun to'g'ri javob son bo'lishi kerak.";
    if (options.length !== 4) return "Math Chick uchun aniq 4 ta variant kiriting.";
    if (!options.includes(answer)) return "Math Chick variantlari ichida to'g'ri javob bo'lishi kerak.";
    if (new Set(options).size !== 4) return "Math Chick variantlari takrorlanmasin.";
    return "";
  }

  if (gameKey === "jumanji") {
    const subject = String(value.subject ?? "").trim();
    const question = String(value.question ?? "").trim();
    const correctAnswer = String(value.correctAnswer ?? "").trim();
    const options = Array.isArray(value.options)
      ? value.options.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [];
    const difficulty = String(value.difficulty ?? "").trim().toLowerCase();
    if (!subject || !question) return "Jumanji uchun fan va savolni to'ldiring.";
    if (options.length !== 4 || new Set(options.map(normalizeAnswerText)).size !== 4) return "Jumanji uchun 4 ta turli variant kiriting.";
    if (!correctAnswer) return "Jumanji uchun variantlardan to'g'ri javobni belgilang.";
    if (!options.some((option) => normalizeAnswerText(option) === normalizeAnswerText(correctAnswer))) return "To'g'ri javob variantlardan biriga mos bo'lishi kerak.";
    if (!["easy", "medium", "hard"].includes(difficulty)) return "Jumanji qiyinligi easy, medium yoki hard bo'lishi kerak.";
    return "";
  }

  if (gameKey === "tug_of_war") {
    const prompt = String(value.prompt ?? "").trim();
    const answer = Number(value.answer);
    const level = String(value.level ?? "").trim().toLowerCase();

    if (!prompt) return "Tug Of War uchun savol matnini kiriting.";
    if (!Number.isInteger(answer)) return "Tug Of War uchun javob butun son bo'lishi kerak.";
    if (!["easy", "medium", "hard"].includes(level)) return "Tug Of War uchun daraja easy, medium yoki hard bo'lsin.";
    return "";
  }

  if (gameKey === "baamboozle") {
    const question = String(value.question ?? "").trim();
    const answer = String(value.answer ?? "").trim();
    if (!question) return "Baamboozle uchun savol matnini kiriting.";
    if (!answer) return "Baamboozle uchun javobni kiriting.";
    return "";
  }

  if (gameKey === "frog_pond") {
    const question = String(value.question ?? "").trim();
    const rawOptions = Array.isArray(value.options) ? value.options : [];
    const options = rawOptions.map((item) => String(item ?? "").trim()).filter(Boolean);
    const answerIndex = Number(value.answerIndex);
    const stage = Number(value.stage);

    if (!question) return "Frog Pond uchun savol matnini kiriting.";
    if (options.length !== 4) return "Frog Pond uchun aniq 4 ta variant kiriting.";
    if (new Set(options.map((item) => item.toLowerCase())).size !== 4) return "Frog Pond variantlari takrorlanmasin.";
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return "Frog Pond uchun to'g'ri variantni tanlang.";
    if (!Number.isInteger(stage) || stage < 1 || stage > 3) return "Frog Pond bosqichi 1, 2 yoki 3 bo'lsin.";
    return "";
  }

  if (gameKey === "pizza_master") {
    const question = String(value.question ?? "").trim();
    const rawOptions = Array.isArray(value.options) ? value.options : [];
    const options = rawOptions.map((item) => String(item ?? "").trim()).filter(Boolean);
    const answerIndex = Number(value.answerIndex);
    if (!question) return "Pizza Master uchun savol matnini kiriting.";
    if (options.length !== 4) return "Pizza Master uchun aniq 4 ta variant kiriting.";
    if (new Set(options.map((item) => item.toLowerCase())).size !== 4) return "Pizza Master variantlari takrorlanmasin.";
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return "Pizza Master uchun to'g'ri variantni tanlang.";
    return "";
  }

  if (gameKey === "mystery_egg") {
    const question = String(value.question ?? "").trim();
    const options = Array.isArray(value.options) ? value.options.map((item) => String(item ?? "").trim()).filter(Boolean) : [];
    const answerIndex = Number(value.answerIndex);
    const level = Number(value.level);
    if (!question) return "Mystery Egg uchun savol matnini kiriting.";
    if (options.length !== 4) return "Mystery Egg uchun aniq 4 ta variant kiriting.";
    if (new Set(options.map((item) => item.toLowerCase())).size !== 4) return "Mystery Egg variantlari takrorlanmasin.";
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return "Mystery Egg uchun to'g'ri variantni tanlang.";
    if (!Number.isInteger(level) || level < 1 || level > 9) return "Mystery Egg leveli 1 dan 9 gacha bo'lsin.";
    return "";
  }

  return "";
}

function summarizeQuestion(item: unknown) {
  if (!item || typeof item !== "object") return "Noma'lum format";
  const value = item as Record<string, unknown>;

  if (typeof value.question === "string" && value.question.trim()) return value.question.trim();
  if (typeof value.text === "string" && value.text.trim()) return value.text.trim();
  if (typeof value.prompt === "string" && value.prompt.trim()) return value.prompt.trim();
  if (typeof value.title === "string" && value.title.trim()) return value.title.trim();
  if (typeof value.word === "string" && value.word.trim()) return value.word.trim();
  if (Array.isArray(value.claims)) {
    const texts = value.claims
      .map((claim) =>
        claim && typeof claim === "object" && typeof (claim as Record<string, unknown>).text === "string"
          ? String((claim as Record<string, unknown>).text).trim()
          : "",
      )
      .filter(Boolean);
    if (texts.length) return texts.join(" | ");
  }

  return JSON.stringify(item).slice(0, 100);
}

function extractMeta(item: unknown) {
  if (!item || typeof item !== "object") return [];
  const value = item as Record<string, unknown>;
  const level = typeof value.level === "string" && DIFFICULTY_LABELS[value.level] ? value.level : null;
  return [
    typeof value.difficulty === "string" ? value.difficulty : null,
    level,
    typeof value.level === "number" ? `${value.level}-daraja` : null,
    typeof value.subject === "string" ? value.subject : null,
    typeof value.category === "string" && value.category ? value.category : null,
    typeof value.points === "number" ? `${value.points} ball` : null,
  ].filter((meta): meta is string => Boolean(meta));
}

function getItemDifficulty(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  const raw = typeof value.difficulty === "string" ? value.difficulty : typeof value.level === "string" ? value.level : null;
  return raw && ["easy", "medium", "hard"].includes(raw) ? raw : null;
}

function normalizeDraftForGame(gameKey: string, draftValue: unknown) {
  if (!draftValue || typeof draftValue !== "object") return draftValue;
  const value = draftValue as Record<string, unknown>;

  if (gameKey === "math_chick") {
    return {
      ...value,
      answer: Number(value.answer),
      options: Array.isArray(value.options)
        ? value.options.map((item) => Number(String(item ?? "").trim()))
        : [],
    };
  }

  if (gameKey === "tug_of_war") {
    return {
      ...value,
      answer: Number(value.answer),
      level: String(value.level ?? "easy").trim().toLowerCase(),
    };
  }

  if (gameKey === "jumanji") {
    const options = Array.isArray(value.options) ? value.options.map((item) => String(item ?? "").trim()) : [];
    const correctAnswer = String(value.correctAnswer ?? "").trim();
    const matchingOption = options.find((option) => normalizeAnswerText(option) === normalizeAnswerText(correctAnswer));
    const correctOptionIndex = Number(value.correctOptionIndex);
    return {
      ...value,
      subject: String(value.subject ?? "").trim(),
      question: String(value.question ?? "").trim(),
      options,
      // Variantning asl qiymatini saqlaymiz; o'yinda shu qiymat bilan tekshiriladi.
      correctAnswer: matchingOption ?? correctAnswer,
      ...(Number.isInteger(correctOptionIndex) && correctOptionIndex >= 0 && correctOptionIndex < options.length
        ? { correctOptionIndex }
        : {}),
      difficulty: String(value.difficulty ?? "easy").trim().toLowerCase(),
      timeLimit: Math.max(20, Math.min(60, Math.round(Number(value.timeLimit) || 30))),
    };
  }

  if (gameKey === "frog_pond") {
    const options = Array.isArray(value.options) ? value.options.map((item) => String(item ?? "").trim()) : [];
    const answerIndex = Number(value.answerIndex);
    return {
      ...value,
      subject: String(value.subject ?? "Matematika").trim() || "Matematika",
      question: String(value.question ?? "").trim(),
      options,
      answerIndex,
      answer: options[answerIndex] ?? "",
      stage: Math.max(1, Math.min(3, Math.round(Number(value.stage) || 1))),
    };
  }

  if (gameKey === "mystery_egg") {
    const options = Array.isArray(value.options) ? value.options.map((item) => String(item ?? "").trim()) : [];
    const answerIndex = Number(value.answerIndex);
    return {
      ...value,
      subject: String(value.subject ?? "Matematika").trim() || "Matematika",
      question: String(value.question ?? "").trim(),
      options,
      answerIndex,
      level: Math.max(1, Math.min(9, Math.round(Number(value.level) || 1))),
    };
  }

  return draftValue;
}

function withIdFallback(item: unknown) {
  if (!item || typeof item !== "object") return item;
  const value = item as Record<string, unknown>;
  if (typeof value.id === "string" && value.id.trim()) return item;
  return { ...value, id: createId() };
}

function prettifyKey(key: string) {
  if (LABELS_UZ[key]) return LABELS_UZ[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function updateValueAtPath(root: unknown, path: Array<string | number>, nextValue: unknown): unknown {
  if (path.length === 0) return nextValue;

  const [head, ...tail] = path;

  if (Array.isArray(root)) {
    const clone = [...root];
    clone[Number(head)] = updateValueAtPath(clone[Number(head)], tail, nextValue);
    return clone;
  }

  if (root && typeof root === "object") {
    const clone = { ...(root as Record<string, unknown>) };
    clone[String(head)] = updateValueAtPath(clone[String(head)], tail, nextValue);
    return clone;
  }

  return root;
}

function getOptionLetter(index: number) {
  return ["A", "B", "C", "D", "E", "F"][index] ?? String(index + 1);
}

/* ════════════════════════════════════════════
   Umumiy stillar
   ════════════════════════════════════════════ */

const LABEL_CLS = "flex items-center gap-2 text-[13px] font-semibold text-[var(--panel-text-soft)]";
const INPUT_CLS =
  "w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-2.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-colors hover:border-[var(--panel-accent)]/60 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]";
const CARD_CLS = "rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] shadow-sm";
const FOCUS_CLS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-accent)]";
const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[image:var(--panel-accent-gradient)] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[var(--panel-accent)]/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100";
const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--panel-text)] transition hover:border-[var(--panel-accent)] disabled:cursor-not-allowed disabled:opacity-50";

const FIELD_ICONS: Record<string, ReactNode> = {
  title: <FaBookOpen />,
  story: <FaBookOpen />,
  explanation: <FaBookOpen />,
  subject: <FaGraduationCap />,
  category: <FaLayerGroup />,
  stage: <FaLayerGroup />,
  difficulty: <FaStar />,
  points: <FaStar />,
  level: <FaCrown />,
  question: <FaRegLightbulb />,
  prompt: <FaRegLightbulb />,
  text: <FaRegLightbulb />,
  hint: <FaRegLightbulb />,
  answer: <FaCheck />,
  correct: <FaCheck />,
  correctAnswer: <FaCheck />,
  reward: <FaGem />,
  timeLimit: <FaClock />,
};

/* ════════════════════════════════════════════
   Kichik komponentlar
   ════════════════════════════════════════════ */

function SelectField({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  onChange: (value: string) => void;
  icon?: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={LABEL_CLS}>
        {icon}
        {label}
      </span>
      <div className="relative">
        <select
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLS} appearance-none pr-10`}
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <FaChevronRight className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-[var(--panel-muted)]" />
      </div>
    </label>
  );
}

function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = "grid-cols-3",
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  columns?: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className={LABEL_CLS}>{label}</span>
      <div className={`grid gap-2 ${columns}`} role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${FOCUS_CLS} ${
                active
                  ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
                  : "border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionListEditor({
  options,
  path,
  selectedIndex,
  showCorrectSelector = false,
  onChange,
  onOptionChange,
  onCorrectIndexChange,
}: {
  options: string[];
  path: Array<string | number>;
  selectedIndex?: number;
  showCorrectSelector?: boolean;
  onChange: (path: Array<string | number>, value: unknown) => void;
  onOptionChange?: (index: number, value: string) => void;
  onCorrectIndexChange?: (index: number) => void;
}) {
  const canSelect = showCorrectSelector && Boolean(onCorrectIndexChange);

  return (
    <fieldset className="space-y-3">
      <legend className={`${LABEL_CLS} w-full justify-between`}>
        <span className="flex items-center gap-2">
          <FaLayerGroup className="text-[var(--panel-accent)]" />
          Variantlar
        </span>
        {canSelect && <span className="text-xs font-medium text-[var(--panel-muted)]">To'g'ri javobni belgilang</span>}
      </legend>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option, index) => {
          const correct = canSelect && selectedIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border p-3 transition ${
                correct
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:border-[var(--panel-accent)]/60"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${
                    correct ? "bg-emerald-500" : "bg-[image:var(--panel-accent-gradient)]"
                  }`}
                >
                  {correct ? <FaCheck className="h-3 w-3" /> : getOptionLetter(index)}
                </span>
                {canSelect && (
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--panel-text)]">
                    <input
                      type="radio"
                      name={`correct-${path.join("-")}`}
                      checked={selectedIndex === index}
                      onChange={() => onCorrectIndexChange?.(index)}
                      className="h-4 w-4 accent-[var(--panel-accent)]"
                    />
                    To'g'ri
                  </label>
                )}
              </div>
              <input
                value={option}
                onChange={(event) =>
                  (onOptionChange ?? ((itemIndex, nextValue) => onChange([...path, itemIndex], nextValue)))(index, event.target.value)
                }
                className={INPUT_CLS}
                placeholder={`${getOptionLetter(index)} variant`}
                aria-label={`${getOptionLetter(index)} variant`}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function TruthClaimsEditor({
  claims,
  path,
  onChange,
}: {
  claims: Array<{ text?: unknown; truth?: unknown }>;
  path: Array<string | number>;
  onChange: (path: Array<string | number>, value: unknown) => void;
}) {
  const fakeIndex = claims.findIndex((claim) => claim?.truth === false);

  return (
    <fieldset className="space-y-3">
      <legend className={`${LABEL_CLS} w-full justify-between`}>
        <span className="flex items-center gap-2">
          <FaBrain className="text-[var(--panel-accent)]" />
          3 ta fakt
        </span>
        <span className="rounded-full bg-[var(--panel-surface-tint)] px-3 py-1 text-xs font-semibold text-[var(--panel-accent)]">
          Bittasi yolg'on bo'lsin
        </span>
      </legend>
      <div className="space-y-3">
        {claims.map((claim, index) => {
          const fake = fakeIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border p-3 transition ${
                fake
                  ? "border-rose-500/50 bg-rose-500/10"
                  : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:border-[var(--panel-accent)]/60"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--panel-text)]">{index + 1}-fakt</span>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--panel-text)]">
                  <input
                    type="radio"
                    name="fake-claim"
                    checked={fake}
                    onChange={() => {
                      claims.forEach((_, itemIndex) => {
                        onChange([...path, itemIndex, "truth"], itemIndex !== index);
                      });
                    }}
                    className="h-4 w-4 accent-[var(--panel-accent)]"
                  />
                  Yolg'on
                </label>
              </div>
              <textarea
                value={String(claim?.text ?? "")}
                onChange={(event) => onChange([...path, index, "text"], event.target.value)}
                className={`${INPUT_CLS} min-h-[76px]`}
                placeholder={`${index + 1}-faktni yozing`}
                aria-label={`${index + 1}-fakt`}
              />
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function FormField({
  label,
  value,
  path,
  depth = 0,
  onChange,
  icon,
}: {
  label: string;
  value: unknown;
  path: Array<string | number>;
  depth?: number;
  onChange: (path: Array<string | number>, value: unknown) => void;
  icon?: ReactNode;
}) {
  const title = prettifyKey(label);
  const fieldIcon = icon ?? FIELD_ICONS[label];

  if (typeof value === "string") {
    if ((label === "difficulty" || label === "level") && DIFFICULTY_LABELS[value]) {
      return (
        <SelectField
          label={title}
          value={value}
          options={Object.entries(DIFFICULTY_LABELS).map(([optionValue, optionLabel]) => ({
            value: optionValue,
            label: optionLabel,
          }))}
          onChange={(next) => onChange(path, next)}
          icon={fieldIcon}
        />
      );
    }

    if (label === "subject") {
      const options = SUBJECT_OPTIONS.includes(value) || !value ? SUBJECT_OPTIONS : [value, ...SUBJECT_OPTIONS];
      return (
        <SelectField
          label={title}
          value={value}
          options={options.map((option) => ({ value: option, label: option }))}
          onChange={(next) => onChange(path, next)}
          icon={fieldIcon}
        />
      );
    }

    const isLong = value.length > 60 || /story|explanation|hint|reason/i.test(label);
    return (
      <label className="block space-y-1.5">
        <span className={LABEL_CLS}>
          {fieldIcon}
          {title}
        </span>
        {isLong ? (
          <textarea
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
            className={`${INPUT_CLS} min-h-[96px]`}
            placeholder={title}
          />
        ) : (
          <input value={value} onChange={(event) => onChange(path, event.target.value)} className={INPUT_CLS} placeholder={title} />
        )}
      </label>
    );
  }

  if (typeof value === "number") {
    if (label === "answerIndex" || label === "correctIndex") {
      return (
        <SelectField
          label={title}
          value={value}
          options={[0, 1, 2, 3].map((option) => ({ value: option, label: `${getOptionLetter(option)} variant` }))}
          onChange={(next) => onChange(path, Number(next))}
          icon={fieldIcon}
        />
      );
    }

    if (label === "level") {
      return (
        <SelectField
          label={title}
          value={value}
          options={[1, 2, 3, 4, 5].map((option) => ({ value: option, label: `${option}-daraja` }))}
          onChange={(next) => onChange(path, Number(next))}
          icon={fieldIcon}
        />
      );
    }

    return (
      <label className="block space-y-1.5">
        <span className={LABEL_CLS}>
          {fieldIcon}
          {title}
        </span>
        <input
          type="number"
          min={0}
          value={Number.isFinite(value) ? value : 0}
          onKeyDown={(event) => {
            if (event.key === "-") event.preventDefault();
          }}
          onChange={(event) => onChange(path, Math.max(0, Number(event.target.value) || 0))}
          className={INPUT_CLS}
        />
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 transition hover:border-[var(--panel-accent)]">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--panel-text)]">
          {fieldIcon}
          {title}
        </span>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(path, event.target.checked)}
          className="h-4 w-4 rounded accent-[var(--panel-accent)]"
        />
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
        <div className="flex items-center justify-between">
          <span className={LABEL_CLS}>
            {fieldIcon}
            {title}
          </span>
          <span className="rounded-full bg-[var(--panel-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--panel-muted)]">
            {value.length} ta
          </span>
        </div>
        <div className="space-y-2">
          {value.map((item, index) => (
            <FormField
              key={`${label}-${index}`}
              label={`${label} ${index + 1}`}
              value={item}
              path={[...path, index]}
              depth={depth + 1}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="space-y-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
        <div className={LABEL_CLS}>
          {fieldIcon}
          {title}
        </div>
        <div className={`grid gap-3 ${depth === 0 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {Object.entries(value as Record<string, unknown>).map(([key, childValue]) => (
            <FormField key={key} label={key} value={childValue} path={[...path, key]} depth={depth + 1} onChange={onChange} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-muted)]">
      {title}
    </div>
  );
}

function SpecializedEditor({
  gameKey,
  draftValue,
  onChange,
}: {
  gameKey: string;
  draftValue: unknown;
  onChange: (path: Array<string | number>, value: unknown) => void;
}) {
  if (!draftValue || typeof draftValue !== "object") return null;
  const value = draftValue as Record<string, unknown>;

  const F = (key: string) =>
    key in value ? <FormField key={key} label={key} value={value[key]} path={[key]} onChange={onChange} /> : null;

  /* 1) Variantlar ro'yxati (massiv) bo'lgan o'yinlar */
  if (Array.isArray(value.options)) {
    const options = (value.options as unknown[]).map((item) => String(item ?? ""));
    const storedJumanjiCorrectIndex = Number(value.correctOptionIndex);
    const jumanjiCorrectIndex =
      gameKey === "jumanji" && normalizeAnswerText(value.correctAnswer)
        ? options.findIndex((option) => normalizeAnswerText(option) === normalizeAnswerText(value.correctAnswer))
        : -1;
    const selectedIndex =
      typeof value.answerIndex === "number"
        ? value.answerIndex
        : typeof value.correctIndex === "number"
          ? value.correctIndex
          : Number.isInteger(storedJumanjiCorrectIndex) && storedJumanjiCorrectIndex >= 0 && storedJumanjiCorrectIndex < options.length
            ? storedJumanjiCorrectIndex
            : jumanjiCorrectIndex >= 0
              ? jumanjiCorrectIndex
              : undefined;

    return (
      <div className="space-y-5">
        {F("title")}
        {F("story")}
        {F("question")}
        {F("prompt")}
        {"text" in value && typeof value.question !== "string" && typeof value.prompt !== "string" && F("text")}

        <OptionListEditor
          options={options}
          path={["options"]}
          selectedIndex={selectedIndex}
          showCorrectSelector={gameKey === "jumanji" || typeof selectedIndex === "number"}
          onChange={onChange}
          onOptionChange={
            gameKey === "jumanji"
              ? (index, nextOption) => {
                  if (selectedIndex === index) {
                    onChange(["correctAnswer"], nextOption);
                  }
                  onChange(["options", index], nextOption);
                }
              : undefined
          }
          onCorrectIndexChange={
            typeof value.answerIndex === "number"
              ? (index) => onChange(["answerIndex"], index)
              : typeof value.correctIndex === "number"
                ? (index) => onChange(["correctIndex"], index)
                : gameKey === "jumanji"
                  ? (index) => {
                      onChange(["correctOptionIndex"], index);
                      onChange(["correctAnswer"], options[index]);
                    }
                  : undefined
          }
        />

        {gameKey !== "jumanji" && F("correctAnswer")}
        {F("correct")}
        {gameKey !== "frog_pond" && F("answer")}
        {F("hint")}
        {F("explanation")}

        <div className="grid gap-4 sm:grid-cols-2">
          {F("subject")}
          {F("category")}
          {F("difficulty")}
          {"level" in value &&
            (gameKey === "mystery_egg" ? (
              <div className="space-y-1.5 sm:col-span-2">
                <SelectField
                  label="Tuxum dunyosi"
                  value={Number(value.level) || 1}
                  options={MYSTERY_EGG_LEVEL_OPTIONS.map((level) => ({ value: level.value, label: level.label }))}
                  onChange={(next) => onChange(["level"], Number(next))}
                  icon={<FaCrown />}
                />
                <p className="px-1 text-xs leading-5 text-[var(--panel-muted)]">
                  Savol faqat tanlangan tuxum dunyosida ishlatiladi. Yuqori dunyolarda savollar qiyinroq bo'lishi kerak.
                </p>
              </div>
            ) : (
              F("level")
            ))}
          {F("stage")}
          {F("reward")}
          {F("points")}
          {F("timeLimit")}
        </div>
      </div>
    );
  }

  /* 2) Variantlar obyekt (A/B/C/D) bo'lgan o'yin — Millionaire */
  if (value.options && typeof value.options === "object" && !Array.isArray(value.options)) {
    const optionObject = value.options as Record<string, unknown>;
    return (
      <div className="space-y-5">
        {F("text")}
        <fieldset className="space-y-3">
          <legend className={LABEL_CLS}>
            <FaLayerGroup className="text-[var(--panel-accent)]" />
            Variantlar
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(optionObject).map(([key, optionValue]) => (
              <FormField key={key} label={`${key}-variant`} value={optionValue} path={["options", key]} onChange={onChange} />
            ))}
          </div>
        </fieldset>
        {typeof value.correct === "string" ? (
          <SelectField
            label="To'g'ri javob"
            value={value.correct}
            options={Object.keys(optionObject).map((key) => ({ value: key, label: `${key} variant` }))}
            onChange={(next) => onChange(["correct"], next)}
            icon={<FaCheck />}
          />
        ) : (
          F("correct")
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {F("difficulty")}
          {F("category")}
        </div>
      </div>
    );
  }

  /* 3) Rost/yolg'on faktlar */
  if (gameKey === "truth_detector" && Array.isArray(value.claims)) {
    return (
      <div className="space-y-5">
        {F("title")}
        {F("difficulty")}
        <TruthClaimsEditor claims={value.claims as Array<{ text?: unknown; truth?: unknown }>} path={["claims"]} onChange={onChange} />
      </div>
    );
  }

  /* 4) Boshqa barcha formatlar (Math Race, Tug Of War, Baamboozle, Bingo ...) */
  return (
    <div className="space-y-5">
      {F("title")}
      {F("question")}
      {F("prompt")}
      {F("text")}
      {F("answer")}
      {F("correct")}
      <div className="grid gap-4 sm:grid-cols-2">
        {F("subject")}
        {F("category")}
        {F("difficulty")}
        {F("level")}
        {F("stage")}
        {F("points")}
        {F("reward")}
        {F("timeLimit")}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Skeletonlar
   ════════════════════════════════════════════ */

function QuestionListSkeleton() {
  return (
    <div className="space-y-2" aria-label="Savollar yuklanmoqda" role="status">
      {[0, 1, 2, 3, 4].map((item) => (
        <div key={item} className="animate-pulse rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-lg bg-[var(--panel-border)]" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="h-4 w-4/5 rounded bg-[var(--panel-border)]" />
              <div className="h-3 w-2/5 rounded bg-[var(--panel-border)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Muharrir yuklanmoqda" role="status">
      <div className="h-12 rounded-xl bg-[var(--panel-border)]" />
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-[var(--panel-border)]" />
        <div className="h-11 rounded-xl bg-[var(--panel-border)]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-[var(--panel-border)]" />
        <div className="h-28 rounded-xl bg-[var(--panel-border)]" />
      </div>
      <div className="h-11 w-36 rounded-xl bg-[var(--panel-border)]" />
    </div>
  );
}

/* ════════════════════════════════════════════
   Dashboard bloklari
   ════════════════════════════════════════════ */

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className={`${CARD_CLS} flex items-start gap-4 p-4 sm:p-5`}>
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
          tone === "warning" ? "bg-amber-500/15 text-amber-500" : "bg-[image:var(--panel-accent-gradient-soft)] text-[var(--panel-accent)]"
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[var(--panel-text-soft)]">{label}</p>
        <p className="mt-0.5 text-3xl font-black tracking-tight text-[var(--panel-text)]">{value}</p>
        {hint && <p className="mt-1 truncate text-xs text-[var(--panel-muted)]">{hint}</p>}
      </div>
    </div>
  );
}

function GameCard({
  game,
  count,
  loaded,
  onOpen,
  onAdd,
}: {
  game: GameRegistryItem;
  count: number;
  loaded: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const progress = Math.min(100, Math.round((count / RECOMMENDED_QUESTIONS) * 100));
  const status = !loaded
    ? "Yuklanmoqda…"
    : count === 0
      ? "Hali savol yo'q"
      : count < RECOMMENDED_QUESTIONS
        ? `Yana ${RECOMMENDED_QUESTIONS - count} ta qo'shish tavsiya etiladi`
        : "Savollar yetarli";

  return (
    <article className="group flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4 transition hover:border-[var(--panel-accent)]/70 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.accent} text-xl text-white shadow-sm`}>
          {game.emoji}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[var(--panel-text)]">{game.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--panel-text-soft)]">{game.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold text-[var(--panel-text)]">
            {loaded ? count : "–"} <span className="font-medium text-[var(--panel-text-soft)]">ta savol</span>
          </p>
          <p className={`truncate text-xs ${loaded && count === 0 ? "font-semibold text-amber-500" : "text-[var(--panel-muted)]"}`}>{status}</p>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--panel-border)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={RECOMMENDED_QUESTIONS}
          aria-valuenow={Math.min(count, RECOMMENDED_QUESTIONS)}
          aria-label={`${game.title} savollari`}
        >
          <div className="h-full rounded-full bg-[image:var(--panel-accent-gradient)] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onOpen} className={`${SECONDARY_BTN} flex-1 !py-2 ${FOCUS_CLS}`}>
          Savollarni ochish
        </button>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`${game.title} uchun savol qo'shish`}
          title="Savol qo'shish"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25 transition hover:brightness-110 ${FOCUS_CLS}`}
        >
          <FaPlus className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

/* ════════════════════════════════════════════
   Asosiy komponent
   ════════════════════════════════════════════ */

export default function TeacherQuestionPanel() {
  const isDarkMode = useHomeTheme();
  const {
    state: { user },
  } = useContextPro();
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);
  const [gameSearch, setGameSearch] = useState("");
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [activeGameKey, setActiveGameKey] = useState("");
  const [draftValue, setDraftValue] = useState<unknown>({});
  const [editorError, setEditorError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("manual");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("dashboard");
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState("Matematika");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiCount, setAiCount] = useState<(typeof AI_COUNT_OPTIONS)[number]>(5);
  const [aiDifficulty, setAiDifficulty] = useState<GameDifficulty>("mixed");
  const [aiMysteryLevel, setAiMysteryLevel] = useState(1);
  const [questionActivity, setQuestionActivity] = useState<QuestionActivity[]>([]);
  const dashboardLoadedForRef = useRef<string | null>(null);
  const {
    questionsByGame,
    getQuestions,
    loadQuestions,
    saveQuestionsForGame,
    loadingByGame,
    loadedByGame,
    savingByGame,
    anySaving,
  } = useGameQuestions<unknown>({ teacherId: user?.id });

  const activeGame = GAME_REGISTRY.find((game) => game.gameKey === activeGameKey) ?? null;
  const view: WorkspaceView = activeGame ? workspaceView : "dashboard";
  const activeItems = useMemo(
    () => (activeGameKey ? getQuestions(activeGameKey) : []),
    [activeGameKey, getQuestions],
  );
  const aiPanelContent = useMemo(() => getAiPanelContent(activeGame?.gameKey ?? ""), [activeGame?.gameKey]);
  const loading = activeGame ? Boolean(loadingByGame[activeGame.gameKey]) : false;
  const saving = activeGame ? Boolean(savingByGame[activeGame.gameKey]) : anySaving;

  const totalQuestionCount = useMemo(
    () => Object.values(questionsByGame).reduce((total, questions) => total + questions.length, 0),
    [questionsByGame],
  );
  const activeGamesCount = useMemo(
    () => GAME_REGISTRY.filter((game) => (questionsByGame[game.gameKey]?.length ?? 0) > 0).length,
    [questionsByGame],
  );
  const loadedGamesCount = GAME_REGISTRY.filter((game) => loadedByGame[game.gameKey]).length;
  const allLoaded = loadedGamesCount === GAME_REGISTRY.length;
  const emptyGames = GAME_REGISTRY.filter(
    (game) => loadedByGame[game.gameKey] && (questionsByGame[game.gameKey]?.length ?? 0) === 0,
  );
  const recentAddedTotal = questionActivity.reduce((total, item) => total + item.addedCount, 0);
  const recentActivity = useMemo(
    () => [...questionActivity].sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt)).slice(0, 8),
    [questionActivity],
  );

  const filteredGames = useMemo(() => {
    const term = gameSearch.trim().toLowerCase();
    return GAME_REGISTRY.filter((game) => {
      const count = questionsByGame[game.gameKey]?.length ?? 0;
      if (gameFilter === "filled" && count === 0) return false;
      if (gameFilter === "empty" && count > 0) return false;
      return !term || game.title.toLowerCase().includes(term);
    });
  }, [gameFilter, gameSearch, questionsByGame]);

  const loadAllGames = useCallback(async () => {
    // Ko'p o'yin bo'lgani uchun so'rovlarni kichik guruhlarda yuboramiz.
    const batchSize = 3;
    for (let start = 0; start < GAME_REGISTRY.length; start += batchSize) {
      await Promise.all(
        GAME_REGISTRY.slice(start, start + batchSize).map((game) =>
          loadQuestions(game.gameKey, { teacherScoped: true, filterBySessionDifficulty: false }),
        ),
      );
    }
  }, [loadQuestions]);

  useEffect(() => {
    setQuestionActivity(readQuestionActivity(user?.id));
    dashboardLoadedForRef.current = null;
  }, [user?.id]);

  useEffect(() => {
    if (view !== "dashboard" || !user?.id || dashboardLoadedForRef.current === user.id) return;
    dashboardLoadedForRef.current = user.id;
    void loadAllGames();
  }, [loadAllGames, user?.id, view]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await loadAllGames();
    } finally {
      setIsRefreshing(false);
    }
  }

  function recordQuestionAddition(gameKey: string, addedCount: number) {
    const activity: QuestionActivity = { gameKey, addedCount, updatedAt: new Date().toISOString() };
    setQuestionActivity((previous) => {
      const next = [activity, ...previous.filter((item) => item.gameKey !== gameKey)].slice(0, 12);
      try {
        localStorage.setItem(teacherActivityStorageKey(user?.id), JSON.stringify(next));
      } catch {
        // Brauzer xotirasi bo'lmasa ham dashboard ishlayveradi.
      }
      return next;
    });
  }

  useEffect(() => {
    if (!activeGame) {
      setDraftValue({});
      setEditorError("");
      return;
    }
    if (selectedIndex === null) {
      setDraftValue(activeGame.template);
      setEditorError("");
      return;
    }

    const item = activeItems[selectedIndex];
    setDraftValue(item);
    setEditorError("");
  }, [activeGame, activeItems, selectedIndex]);

  useEffect(() => {
    setVisibleCount(LIST_PAGE_SIZE);
  }, [activeGameKey, search, difficultyFilter]);

  const hasDifficultyFilter = useMemo(() => activeItems.some((item) => getItemDifficulty(item)), [activeItems]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return activeItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (difficultyFilter !== "all" && getItemDifficulty(item) !== difficultyFilter) return false;
        return !term || summarizeQuestion(item).toLowerCase().includes(term);
      });
  }, [activeItems, search, difficultyFilter]);

  const baseItem = activeGame ? (selectedIndex === null ? activeGame.template : activeItems[selectedIndex]) : null;
  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(draftValue) !== JSON.stringify(baseItem);
    } catch {
      return true;
    }
  }, [draftValue, baseItem]);
  const canSave = !saving && (selectedIndex === null || isDirty);

  const extraEntries = useMemo(
    () =>
      draftValue && typeof draftValue === "object"
        ? Object.entries(draftValue as Record<string, unknown>).filter(([key]) => !HANDLED_KEYS.has(key))
        : [],
    [draftValue],
  );

  async function persistGameItems(gameKey: string, nextItems: unknown[]) {
    if (!user?.id) {
      setEditorError("O'qituvchi akkaunti topilmadi. Qayta kirib ko'ring.");
      return false;
    }
    const ok = await saveQuestionsForGame(gameKey, nextItems, true);
    if (!ok) {
      setEditorError("Saqlashda xato bo'ldi. Internetni tekshirib, qayta urinib ko'ring.");
      return false;
    }
    setEditorError("");
    return true;
  }

  async function handleSaveEditor() {
    if (!activeGame) return;
    const validationError = validateDraftItem(activeGame.gameKey, draftValue);
    if (validationError) {
      setEditorError(validationError);
      return;
    }
    const isNewQuestion = selectedIndex === null;
    const nextItem = withIdFallback(normalizeDraftForGame(activeGame.gameKey, draftValue));
    const nextItems = [...activeItems];

    if (isNewQuestion) {
      nextItems.unshift(nextItem);
    } else {
      nextItems[selectedIndex] = nextItem;
    }

    const ok = await persistGameItems(activeGame.gameKey, nextItems);
    if (!ok) return;

    if (isNewQuestion) {
      recordQuestionAddition(activeGame.gameKey, 1);
      setSelectedIndex(null);
      setDraftValue(activeGame.template);
      toast.success("Savol qo‘shildi.");
      return;
    }

    toast.success("Savol saqlandi.");
  }

  async function handleDelete(index: number) {
    if (!activeGame) return;
    const nextItems = activeItems.filter((_, itemIndex) => itemIndex !== index);
    const ok = await persistGameItems(activeGame.gameKey, nextItems);
    if (!ok) return;
    toast.success("Savol o‘chirildi.");
    setDeleteTargetIndex(null);
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  }

  async function handleGenerateAi() {
    if (!activeGame) return;
    if (!aiTopic.trim()) {
      setEditorError("Savollar aynan mos bo'lishi uchun mavzuni kiriting.");
      return;
    }

    try {
      setIsGeneratingAi(true);
      setAiFailed(false);
      setEditorError("");
      const generated = await generateTeacherPanelQuestions({
        gameKey: activeGame.gameKey as SupportedTeacherGameKey,
        topic: activeGame.gameKey === "mystery_egg" ? `Level ${aiMysteryLevel}. ${aiTopic}` : aiTopic,
        subject: aiSubject,
        count: aiCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
        existingQuestions: activeItems.slice(0, 60).map((item) => summarizeQuestion(item)),
      });

      const difficultyCycle = ["easy", "medium", "hard"] as const;
      const difficultyAdjusted = generated.map((item, index) => {
        if (!item || typeof item !== "object") return item;
        const template = activeGame.template as Record<string, unknown>;
        if (!("difficulty" in template)) return item;
        return {
          ...(item as Record<string, unknown>),
          difficulty: aiDifficulty === "mixed" ? difficultyCycle[index % difficultyCycle.length] : aiDifficulty,
        };
      });
      const levelAdjusted =
        activeGame.gameKey === "mystery_egg"
          ? difficultyAdjusted.map((item) =>
              item && typeof item === "object" ? { ...(item as Record<string, unknown>), level: aiMysteryLevel } : item,
            )
          : difficultyAdjusted;
      const nextItems = [...levelAdjusted.map((item) => withIdFallback(item)), ...activeItems];
      const ok = await persistGameItems(activeGame.gameKey, nextItems);
      if (!ok) return;

      recordQuestionAddition(activeGame.gameKey, levelAdjusted.length);
      toast.success(`${levelAdjusted.length} ta savol qo‘shildi.`);

      setSelectedIndex(0);
      setDraftValue(withIdFallback(levelAdjusted[0] ?? activeGame.template));
      setEditorMode("manual");
    } catch (error) {
      setAiFailed(true);
      setEditorError(error instanceof Error ? error.message : "AI savol yaratishda xato bo'ldi. Qayta urinib ko'ring.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function handleSelectGame(gameKey: string) {
    setAiFailed(false);
    setActiveGameKey(gameKey);
    setSelectedIndex(null);
    setSearch("");
    setDifficultyFilter("all");
    setEditorMode("manual");
    setWorkspaceView("questions");
    setDeleteTargetIndex(null);
    void loadQuestions(gameKey, { teacherScoped: true, filterBySessionDifficulty: false });
  }

  function openCreate(mode: EditorMode = "manual") {
    setSelectedIndex(null);
    setEditorMode(mode);
    setEditorError("");
    setWorkspaceView("create");
  }

  function handleQuickAdd(gameKey: string) {
    handleSelectGame(gameKey);
    setWorkspaceView("create");
  }

  // Klaviatura: Ctrl/Cmd + S — saqlash, Esc — oynani yopish.
  const keyStateRef = useRef({ canSaveNow: false, deleteOpen: false });
  const saveRef = useRef<() => void>(() => {});
  keyStateRef.current = {
    canSaveNow: Boolean(activeGame) && view !== "dashboard" && editorMode === "manual" && deleteTargetIndex === null && canSave,
    deleteOpen: deleteTargetIndex !== null,
  };
  saveRef.current = () => void handleSaveEditor();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        if (keyStateRef.current.canSaveNow) {
          event.preventDefault();
          saveRef.current();
        }
      } else if (event.key === "Escape" && keyStateRef.current.deleteOpen) {
        setDeleteTargetIndex(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const tabClass = (active: boolean) =>
    `inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${FOCUS_CLS} ${
      active
        ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
        : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface-strong)] hover:text-[var(--panel-text)]"
    }`;

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="teacher-theme teacher-workspace min-h-screen bg-[image:var(--panel-page-bg)] bg-[var(--panel-page-base)]"
    >
      <div className="mx-auto grid max-w-[1760px] gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[272px_minmax(0,1fr)] xl:items-start xl:px-8">
        {/* ═══════════ Yon panel (katta ekranlar) ═══════════ */}
        <aside
          className={`${CARD_CLS} hidden p-3 xl:sticky xl:top-[84px] xl:block xl:max-h-[calc(100svh-100px)] xl:self-start xl:overflow-y-auto xl:overscroll-contain [scrollbar-width:thin]`}
          aria-label="O'yinlar ro'yxati"
        >
          <div className="flex items-center gap-3 px-2 pb-3 pt-1">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--panel-accent-gradient)] text-lg text-white shadow-md shadow-[var(--panel-accent)]/25">
              <FaGraduationCap />
            </span>
            <div>
              <p className="text-xs font-medium text-[var(--panel-muted)]">O'qituvchi paneli</p>
              <h2 className="text-base font-bold text-[var(--panel-text)]">Ish maydoni</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWorkspaceView("dashboard")}
            aria-current={view === "dashboard" ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${FOCUS_CLS} ${
              view === "dashboard"
                ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
                : "text-[var(--panel-text)] hover:bg-[var(--panel-surface-strong)]"
            }`}
          >
            <FaThLarge className="h-4 w-4" />
            Dashboard
          </button>

          <p className="px-3 pb-1.5 pt-4 text-xs font-semibold text-[var(--panel-muted)]">O'yinlar ({GAME_REGISTRY.length})</p>
          <nav className="flex flex-col gap-0.5">
            {GAME_REGISTRY.map((game) => {
              const count = questionsByGame[game.gameKey]?.length ?? 0;
              const active = view !== "dashboard" && game.gameKey === activeGameKey;
              const isEmpty = loadedByGame[game.gameKey] && count === 0;
              return (
                <button
                  key={game.gameKey}
                  type="button"
                  onClick={() => handleSelectGame(game.gameKey)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${FOCUS_CLS} ${
                    active
                      ? "bg-[image:var(--panel-accent-gradient-soft)] ring-1 ring-[var(--panel-accent)]"
                      : "hover:bg-[var(--panel-surface-strong)]"
                  }`}
                >
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${game.accent} text-base text-white`}>
                    {game.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--panel-text)]">{game.title}</span>
                  <span
                    className={`min-w-[1.75rem] rounded-full px-2 py-0.5 text-center text-xs font-bold ${
                      isEmpty ? "bg-amber-500/15 text-amber-500" : "bg-[var(--panel-surface-strong)] text-[var(--panel-text-soft)]"
                    }`}
                    title={isEmpty ? "Bu o'yinda hali savol yo'q" : undefined}
                  >
                    {loadedByGame[game.gameKey] ? count : "–"}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ═══════════ Asosiy qism ═══════════ */}
        <main className="min-w-0 space-y-5">
          {/* O'yin tanlash (kichik ekranlar) */}
          <div className={`${CARD_CLS} p-3 xl:hidden`}>
            <SelectField
              label="Bo'lim yoki o'yin"
              value={view === "dashboard" ? "" : activeGameKey}
              options={[
                { value: "", label: "Dashboard" },
                ...GAME_REGISTRY.map((game) => ({
                  value: game.gameKey,
                  label: `${game.emoji} ${game.title} (${loadedByGame[game.gameKey] ? (questionsByGame[game.gameKey]?.length ?? 0) : "–"})`,
                })),
              ]}
              onChange={(next) => (next ? handleSelectGame(next) : setWorkspaceView("dashboard"))}
              icon={<FaThLarge />}
            />
          </div>

          {/* ───────────── DASHBOARD ───────────── */}
          {view === "dashboard" && (
            <div className="space-y-5">
              <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[var(--panel-text)] sm:text-3xl">Savollar markazi</h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--panel-text-soft)]">
                    Barcha o'yinlardagi savollaringiz bir joyda. O'yinni tanlang yoki «+» tugmasi bilan darhol savol qo'shing.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[var(--panel-muted)]" aria-live="polite">
                    {allLoaded ? "Ma'lumotlar yangilangan" : `Yuklanmoqda: ${loadedGamesCount} / ${GAME_REGISTRY.length}`}
                  </p>
                  <button type="button" onClick={() => void handleRefresh()} disabled={isRefreshing || !user?.id} className={`${SECONDARY_BTN} ${FOCUS_CLS}`}>
                    <FaSyncAlt className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                    Yangilash
                  </button>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<FaListUl />} label="Jami savollar" value={allLoaded ? totalQuestionCount : totalQuestionCount || "–"} hint="Barcha o'yinlar bo'yicha" />
                <StatCard
                  icon={<FaLayerGroup />}
                  label="Savoli bor o'yinlar"
                  value={
                    <>
                      {activeGamesCount}
                      <span className="ml-1 text-base font-bold text-[var(--panel-muted)]">/ {GAME_REGISTRY.length}</span>
                    </>
                  }
                  hint="Ishga tayyor o'yinlar"
                />
                <StatCard
                  icon={<FaExclamationCircle />}
                  label="Savolsiz o'yinlar"
                  value={allLoaded ? emptyGames.length : "–"}
                  hint={emptyGames.length > 0 ? "Savol qo'shish kerak" : "Hammasi to'ldirilgan"}
                  tone={emptyGames.length > 0 ? "warning" : "default"}
                />
                <StatCard icon={<FaBolt />} label="Siz qo'shgan savollar" value={recentAddedTotal} hint="So'nggi qo'shishlar bo'yicha" />
              </div>

              {allLoaded && emptyGames.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
                  <p className="flex items-start gap-3 text-sm font-semibold text-[var(--panel-text)]">
                    <FaExclamationCircle className="mt-0.5 shrink-0 text-amber-500" />
                    {emptyGames.length} ta o'yinda hali savol yo'q. O'quvchilar bu o'yinlarni to'liq o'ynay olmaydi.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {emptyGames.slice(0, 4).map((game) => (
                      <button
                        key={game.gameKey}
                        type="button"
                        onClick={() => handleQuickAdd(game.gameKey)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-[var(--panel-surface)] px-3 py-1.5 text-xs font-bold text-[var(--panel-text)] transition hover:border-amber-500 ${FOCUS_CLS}`}
                      >
                        <span>{game.emoji}</span>
                        {game.title}
                      </button>
                    ))}
                    {emptyGames.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setGameFilter("empty")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold text-amber-500 hover:underline ${FOCUS_CLS}`}
                      >
                        Yana {emptyGames.length - 4} ta
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
                {/* O'yinlar */}
                <section className={`${CARD_CLS} p-4 sm:p-5`} aria-labelledby="games-heading">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <h2 id="games-heading" className="text-lg font-bold text-[var(--panel-text)]">
                      O'yinlar
                    </h2>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative">
                        <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--panel-muted)]" />
                        <input
                          value={gameSearch}
                          onChange={(event) => setGameSearch(event.target.value)}
                          placeholder="O'yin qidirish"
                          aria-label="O'yin qidirish"
                          className={`${INPUT_CLS} !py-2 pl-10 sm:w-56`}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-1" role="radiogroup" aria-label="O'yinlarni saralash">
                        {(
                          [
                            { value: "all", label: "Hammasi" },
                            { value: "filled", label: "Savolli" },
                            { value: "empty", label: "Savolsiz" },
                          ] as Array<{ value: GameFilter; label: string }>
                        ).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={gameFilter === option.value}
                            onClick={() => setGameFilter(option.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${FOCUS_CLS} ${
                              gameFilter === option.value
                                ? "bg-[var(--panel-surface)] text-[var(--panel-accent)] shadow-sm"
                                : "text-[var(--panel-text-soft)] hover:text-[var(--panel-text)]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {filteredGames.length > 0 ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {filteredGames.map((game) => (
                        <GameCard
                          key={game.gameKey}
                          game={game}
                          count={questionsByGame[game.gameKey]?.length ?? 0}
                          loaded={Boolean(loadedByGame[game.gameKey])}
                          onOpen={() => handleSelectGame(game.gameKey)}
                          onAdd={() => handleQuickAdd(game.gameKey)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-[var(--panel-border)] px-4 py-12 text-center">
                      <p className="text-sm font-bold text-[var(--panel-text)]">O'yin topilmadi</p>
                      <p className="mt-1 text-sm text-[var(--panel-text-soft)]">Qidiruv yoki saralashni o'zgartirib ko'ring.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setGameSearch("");
                          setGameFilter("all");
                        }}
                        className={`${SECONDARY_BTN} mt-4 ${FOCUS_CLS}`}
                      >
                        Filtrni tozalash
                      </button>
                    </div>
                  )}
                </section>

                {/* So'nggi faollik */}
                <section className={`${CARD_CLS} p-4 sm:p-5`} aria-labelledby="activity-heading">
                  <h2 id="activity-heading" className="flex items-center gap-2 text-lg font-bold text-[var(--panel-text)]">
                    <FaHistory className="h-4 w-4 text-[var(--panel-accent)]" />
                    So'nggi qo'shilganlar
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {recentActivity.map((activity) => {
                      const game = GAME_REGISTRY.find((item) => item.gameKey === activity.gameKey);
                      if (!game) return null;
                      return (
                        <li key={`${activity.gameKey}-${activity.updatedAt}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectGame(activity.gameKey)}
                            className={`flex w-full items-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-3 text-left transition hover:border-[var(--panel-accent)] ${FOCUS_CLS}`}
                          >
                            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${game.accent} text-base text-white`}>
                              {game.emoji}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-[var(--panel-text)]">{game.title}</span>
                              <span className="block text-xs text-[var(--panel-text-soft)]">{activity.addedCount} ta savol qo'shildi</span>
                            </span>
                            <span className="max-w-[5.5rem] text-right text-xs leading-4 text-[var(--panel-muted)]">{formatActivityDate(activity.updatedAt)}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {recentActivity.length === 0 && (
                    <div className="mt-4 rounded-xl border border-dashed border-[var(--panel-border)] px-4 py-10 text-center">
                      <p className="text-sm font-bold text-[var(--panel-text)]">Hali savol qo'shilmagan</p>
                      <p className="mt-1 text-sm text-[var(--panel-text-soft)]">Qo'shgan savollaringiz shu yerda ko'rinadi.</p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* ───────────── O'YIN SAHIFASI ───────────── */}
          {view !== "dashboard" && activeGame && (
            <div className="space-y-5">
              {/* Sarlavha */}
              <header className={`${CARD_CLS} p-4 sm:p-5`}>
                <button
                  type="button"
                  onClick={() => setWorkspaceView("dashboard")}
                  className={`mb-3 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-[var(--panel-text-soft)] transition hover:text-[var(--panel-accent)] ${FOCUS_CLS}`}
                >
                  <FaThLarge className="h-3.5 w-3.5" />
                  Dashboard
                  <FaChevronRight className="h-2.5 w-2.5 text-[var(--panel-muted)]" />
                  <span className="text-[var(--panel-text)]">{activeGame.title}</span>
                </button>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${activeGame.accent} text-3xl text-white shadow-md`}>
                      {activeGame.emoji}
                    </span>
                    <div className="min-w-0">
                      <h1 className="truncate text-2xl font-black tracking-tight text-[var(--panel-text)]">{activeGame.title}</h1>
                      <p className="mt-0.5 text-sm text-[var(--panel-text-soft)]">
                        {loading ? "Savollar yuklanmoqda…" : `${activeItems.length} ta savol`}
                        {!loading && activeItems.length < RECOMMENDED_QUESTIONS && ` · kamida ${RECOMMENDED_QUESTIONS} ta tavsiya etiladi`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to={activeGame.path} className={`${PRIMARY_BTN} ${FOCUS_CLS}`}>
                      O'yinni ochish
                      <FaArrowRight className="h-3 w-3" />
                    </Link>
                    <button type="button" onClick={() => openCreate("manual")} className={`${PRIMARY_BTN} ${FOCUS_CLS}`}>
                      <FaPlus className="h-3.5 w-3.5" />
                      Yangi savol
                    </button>
                  </div>
                </div>
              </header>

              {/* Kichik ekranlar uchun bo'limlar */}
              <div className={`${CARD_CLS} grid grid-cols-2 gap-1 p-1 2xl:hidden`} role="tablist" aria-label="Bo'limlar">
                <button type="button" role="tab" aria-selected={view === "questions"} onClick={() => setWorkspaceView("questions")} className={tabClass(view === "questions")}>
                  <FaListUl className="h-3.5 w-3.5" />
                  Savollar
                  <span className={`rounded-full px-2 py-0.5 text-xs ${view === "questions" ? "bg-white/20" : "bg-[var(--panel-surface-strong)] text-[var(--panel-muted)]"}`}>{activeItems.length}</span>
                </button>
                <button type="button" role="tab" aria-selected={view === "create"} onClick={() => setWorkspaceView("create")} className={tabClass(view === "create")}>
                  <FaEdit className="h-3.5 w-3.5" />
                  {selectedIndex === null ? "Yangi savol" : `Savol #${selectedIndex + 1}`}
                </button>
              </div>

              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_minmax(480px,580px)] 2xl:items-start">
                {/* ───── Savollar ro'yxati ───── */}
                <section className={`${CARD_CLS} min-w-0 p-4 sm:p-5 ${view === "questions" ? "" : "hidden 2xl:block"}`} aria-labelledby="questions-heading">
                  <h2 id="questions-heading" className="sr-only">
                    Savollar ro'yxati
                  </h2>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--panel-muted)]" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Savollar ichidan qidirish"
                        aria-label="Savollar ichidan qidirish"
                        className={`${INPUT_CLS} pl-10 pr-10`}
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          aria-label="Qidiruvni tozalash"
                          className={`absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--panel-muted)] hover:bg-[var(--panel-border)] ${FOCUS_CLS}`}
                        >
                          <FaTimes className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {hasDifficultyFilter && (
                      <div className="grid grid-cols-4 gap-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-1" role="radiogroup" aria-label="Qiyinlik bo'yicha saralash">
                        {(["all", "easy", "medium", "hard"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={difficultyFilter === value}
                            onClick={() => setDifficultyFilter(value)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${FOCUS_CLS} ${
                              difficultyFilter === value
                                ? "bg-[var(--panel-surface)] text-[var(--panel-accent)] shadow-sm"
                                : "text-[var(--panel-text-soft)] hover:text-[var(--panel-text)]"
                            }`}
                          >
                            {value === "all" ? "Hammasi" : DIFFICULTY_LABELS[value]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!loading && activeItems.length > 0 && (
                    <p className="mt-3 text-sm text-[var(--panel-text-soft)]" aria-live="polite">
                      {filteredItems.length === activeItems.length
                        ? `${activeItems.length} ta savol`
                        : `${filteredItems.length} ta topildi (jami ${activeItems.length} ta)`}
                    </p>
                  )}

                  <div className="mt-4">
                    {loading ? (
                      <QuestionListSkeleton />
                    ) : filteredItems.length > 0 ? (
                      <>
                        <ul className="space-y-2">
                          {filteredItems.slice(0, visibleCount).map(({ item, index: realIndex }) => {
                            const meta = extractMeta(item);
                            const selected = selectedIndex === realIndex;
                            const itemId = (item as { id?: unknown })?.id;
                            return (
                              <li key={typeof itemId === "string" ? itemId : `${activeGame.gameKey}-${realIndex}`}>
                                <div
                                  className={`flex items-stretch rounded-xl border transition ${
                                    selected
                                      ? "border-[var(--panel-accent)] bg-[image:var(--panel-accent-gradient-soft)]"
                                      : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:border-[var(--panel-accent)]/60"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedIndex(realIndex);
                                      setEditorMode("manual");
                                      setWorkspaceView("create");
                                    }}
                                    aria-label={`Savol ${realIndex + 1}ni tahrirlash`}
                                    className={`flex min-w-0 flex-1 items-start gap-3 rounded-xl p-3.5 text-left ${FOCUS_CLS}`}
                                  >
                                    <span className="mt-0.5 inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-lg bg-[var(--panel-surface)] px-1.5 text-xs font-bold text-[var(--panel-text-soft)]">
                                      {realIndex + 1}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="line-clamp-2 block text-sm font-semibold leading-6 text-[var(--panel-text)]">{summarizeQuestion(item)}</span>
                                      {meta.length > 0 && (
                                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                                          {meta.map((badge) => (
                                            <span
                                              key={badge}
                                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                BADGE_STYLES[badge] ?? "bg-[var(--panel-surface)] text-[var(--panel-text-soft)]"
                                              }`}
                                            >
                                              {DIFFICULTY_LABELS[badge] ?? badge}
                                            </span>
                                          ))}
                                        </span>
                                      )}
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-1 pr-2.5">
                                    {selected && (
                                      <span className="hidden items-center gap-1 rounded-full bg-[var(--panel-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--panel-accent)] sm:inline-flex">
                                        <FaEdit className="h-2.5 w-2.5" />
                                        Tahrirlanmoqda
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setDeleteTargetIndex(realIndex)}
                                      aria-label={`Savol ${realIndex + 1}ni o'chirish`}
                                      title="O'chirish"
                                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--panel-muted)] transition hover:bg-rose-500/15 hover:text-rose-500 ${FOCUS_CLS}`}
                                    >
                                      <FaTrash className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        {filteredItems.length > visibleCount && (
                          <button
                            type="button"
                            onClick={() => setVisibleCount((count) => count + LIST_PAGE_SIZE)}
                            className={`${SECONDARY_BTN} mt-4 w-full ${FOCUS_CLS}`}
                          >
                            Yana {Math.min(LIST_PAGE_SIZE, filteredItems.length - visibleCount)} ta ko'rsatish
                          </button>
                        )}
                      </>
                    ) : activeItems.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-6 py-14 text-center">
                        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--panel-accent-gradient-soft)] text-2xl">{activeGame.emoji}</span>
                        <p className="text-base font-bold text-[var(--panel-text)]">{loadedByGame[activeGame.gameKey] ? "Bu o'yinda hali savol yo'q" : "Savollar hali yuklanmagan"}</p>
                        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[var(--panel-text-soft)]">
                          Birinchi savolni o'zingiz yozing yoki AI bir necha soniyada tayyorlab bersin.
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                          <button type="button" onClick={() => openCreate("manual")} className={`${SECONDARY_BTN} ${FOCUS_CLS}`}>
                            <FaEdit className="h-3.5 w-3.5" />
                            Qo'lda qo'shish
                          </button>
                          <button type="button" onClick={() => openCreate("ai")} className={`${PRIMARY_BTN} ${FOCUS_CLS}`}>
                            <MdAutoAwesome className="h-4 w-4" />
                            AI bilan yaratish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-6 py-12 text-center">
                        <p className="text-sm font-bold text-[var(--panel-text)]">Savol topilmadi</p>
                        <p className="mt-1 text-sm text-[var(--panel-text-soft)]">Qidiruv yoki saralashni o'zgartirib ko'ring.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setDifficultyFilter("all");
                          }}
                          className={`${SECONDARY_BTN} mt-4 ${FOCUS_CLS}`}
                        >
                          Filtrni tozalash
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* ───── Muharrir ───── */}
                <section className={`${CARD_CLS} min-w-0 p-4 sm:p-5 ${view === "create" ? "" : "hidden 2xl:block"}`} aria-labelledby="editor-heading">
                  {loading ? (
                    <EditorSkeleton />
                  ) : (
                    <>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h2 id="editor-heading" className="text-lg font-bold text-[var(--panel-text)]">
                            {editorMode === "ai" ? "AI bilan yaratish" : selectedIndex === null ? "Yangi savol" : `Savol #${selectedIndex + 1}`}
                          </h2>
                          {editorMode === "manual" && isDirty && selectedIndex !== null && (
                            <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Saqlanmagan o'zgarishlar bor
                            </p>
                          )}
                        </div>
                        {selectedIndex !== null && (
                          <button type="button" onClick={() => openCreate("manual")} className={`${SECONDARY_BTN} !py-2 ${FOCUS_CLS}`}>
                            <FaPlus className="h-3 w-3" />
                            Yangi savol
                          </button>
                        )}
                      </div>

                      {/* Rejim almashtirgich */}
                      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-1" role="tablist" aria-label="Qo'shish usuli">
                        <button type="button" role="tab" aria-selected={editorMode === "manual"} onClick={() => setEditorMode("manual")} className={tabClass(editorMode === "manual")}>
                          <FaEdit className="h-3.5 w-3.5" />
                          Qo'lda
                        </button>
                        <button type="button" role="tab" aria-selected={editorMode === "ai"} onClick={() => setEditorMode("ai")} className={tabClass(editorMode === "ai")}>
                          <MdAutoAwesome className="h-4 w-4" />
                          AI yaratish
                        </button>
                      </div>

                      {editorMode === "ai" ? (
                        <div className="space-y-5">
                          <div>
                            <h3 className="text-sm font-bold text-[var(--panel-text)]">{aiPanelContent.heading}</h3>
                            <p className="mt-1 text-sm leading-6 text-[var(--panel-text-soft)]">{aiPanelContent.description}</p>
                          </div>

                          <label className="block space-y-1.5">
                            <span className={LABEL_CLS}>{aiPanelContent.topicLabel}</span>
                            <textarea
                              value={aiTopic}
                              onChange={(event) => setAiTopic(event.target.value)}
                              placeholder={aiPanelContent.topicPlaceholder}
                              rows={3}
                              className={INPUT_CLS}
                            />
                          </label>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <SelectField
                              label="Fan"
                              value={aiSubject}
                              options={SUBJECT_OPTIONS.map((subject) => ({ value: subject, label: subject }))}
                              onChange={setAiSubject}
                              icon={<FaGraduationCap />}
                            />
                            {activeGame.gameKey === "mystery_egg" && (
                              <SelectField
                                label="Tuxum dunyosi"
                                value={aiMysteryLevel}
                                options={MYSTERY_EGG_LEVEL_OPTIONS.map((level) => ({ value: level.value, label: `${level.label} · ${level.detail}` }))}
                                onChange={(next) => setAiMysteryLevel(Number(next))}
                                icon={<FaCrown />}
                              />
                            )}
                          </div>

                          <ChipGroup
                            label="Sinf oralig'i"
                            options={GRADE_RANGE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                            value={aiGradeRange}
                            onChange={setAiGradeRange}
                            columns="grid-cols-2 sm:grid-cols-3"
                          />
                          <ChipGroup
                            label="Savollar soni"
                            options={AI_COUNT_OPTIONS.map((count) => ({ value: count, label: `${count} ta` }))}
                            value={aiCount}
                            onChange={setAiCount}
                            columns="grid-cols-3 sm:grid-cols-6"
                          />
                          <ChipGroup
                            label="Qiyinlik"
                            options={Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value: value as GameDifficulty, label }))}
                            value={aiDifficulty}
                            onChange={setAiDifficulty}
                            columns="grid-cols-2 sm:grid-cols-4"
                          />

                          <p className="text-xs leading-5 text-[var(--panel-muted)]">{isGeneratingAi ? "AI savollarni tayyorlamoqda, odatda 5–20 soniya ketadi. Sahifani yopmang." : aiPanelContent.footnote}</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {draftValue && typeof draftValue === "object" ? (
                            <>
                              <SpecializedEditor
                                gameKey={activeGame.gameKey}
                                draftValue={draftValue}
                                onChange={(path, valueAtPath) => {
                                  setDraftValue((prev: unknown) => updateValueAtPath(prev, path, valueAtPath));
                                }}
                              />

                              {extraEntries.length > 0 && (
                                <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)]">
                                  <button
                                    type="button"
                                    onClick={() => setShowExtraFields((open) => !open)}
                                    aria-expanded={showExtraFields}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-[var(--panel-text)] ${FOCUS_CLS}`}
                                  >
                                    Qo'shimcha maydonlar ({extraEntries.length})
                                    <FaChevronRight className={`h-3 w-3 text-[var(--panel-muted)] transition-transform ${showExtraFields ? "rotate-90" : ""}`} />
                                  </button>
                                  {showExtraFields && (
                                    <div className="grid gap-4 border-t border-[var(--panel-border)] p-4 sm:grid-cols-2">
                                      {extraEntries.map(([key, value]) => (
                                        <FormField
                                          key={key}
                                          label={key}
                                          value={value}
                                          path={[key]}
                                          onChange={(path, valueAtPath) => {
                                            setDraftValue((prev: unknown) => updateValueAtPath(prev, path, valueAtPath));
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-4 py-10 text-center text-sm text-[var(--panel-muted)]">
                              Bu format uchun forma mavjud emas
                            </div>
                          )}
                        </div>
                      )}

                      {editorError && (
                        <div role="alert" className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                          <div className="flex items-start gap-2.5 text-sm font-medium text-rose-500">
                            <FaExclamationCircle className="mt-0.5 shrink-0" />
                            <span>{editorError}</span>
                          </div>
                          {aiFailed && editorMode === "ai" && (
                            <div className="mt-3 flex flex-wrap items-center gap-3 pl-6">
                              <button
                                type="button"
                                onClick={() => void handleGenerateAi()}
                                disabled={isGeneratingAi || saving}
                                className={`${SECONDARY_BTN} !py-2 ${FOCUS_CLS}`}
                              >
                                <FaSyncAlt className={`h-3.5 w-3.5 ${isGeneratingAi ? "animate-spin" : ""}`} />
                                {isGeneratingAi ? "Urinilmoqda…" : "Qayta urinish"}
                              </button>
                              <span className="text-xs text-[var(--panel-text-soft)]">Mavzu va sozlamalar saqlanib turibdi.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Doimiy ko'rinadigan amallar paneli */}
                      <div className="sticky bottom-0 z-10 -mx-4 mt-6 rounded-b-2xl border-t border-[var(--panel-border)] bg-[var(--panel-surface)]/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5">
                        {editorMode === "manual" ? (
                          <div className="flex flex-wrap items-center gap-2.5">
                            <button type="button" onClick={() => void handleSaveEditor()} disabled={!canSave} className={`${PRIMARY_BTN} ${FOCUS_CLS}`}>
                              {saving ? <FaRobot className="h-3.5 w-3.5 animate-pulse" /> : <FaSave className="h-3.5 w-3.5" />}
                              {saving ? "Saqlanmoqda…" : selectedIndex === null ? "Savolni qo'shish" : "O'zgarishlarni saqlash"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDraftValue(selectedIndex === null ? activeGame.template : activeItems[selectedIndex]);
                                setEditorError("");
                              }}
                              disabled={saving || (!isDirty && !editorError)}
                              className={`${SECONDARY_BTN} ${FOCUS_CLS}`}
                            >
                              {selectedIndex === null ? "Tozalash" : "Bekor qilish"}
                            </button>
                            <span className="ml-auto hidden text-xs text-[var(--panel-muted)] lg:inline">Ctrl + S bilan saqlash</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleGenerateAi()}
                            disabled={isGeneratingAi || saving}
                            className={`${PRIMARY_BTN} w-full ${FOCUS_CLS}`}
                          >
                            <MdAutoAwesome className={`h-4 w-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                            {isGeneratingAi
                              ? aiPanelContent.loadingLabel.replace(aiCountPlaceholder, String(aiCount))
                              : aiPanelContent.buttonLabel.replace(aiCountPlaceholder, String(aiCount))}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════ O'chirishni tasdiqlash ═══════════ */}
      {deleteTargetIndex !== null && activeGame && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-question-title"
          onClick={() => !saving && setDeleteTargetIndex(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <FaTrash className="h-4 w-4" />
              </span>
              <button
                type="button"
                onClick={() => setDeleteTargetIndex(null)}
                disabled={saving}
                aria-label="Yopish"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--panel-muted)] hover:bg-[var(--panel-border)] ${FOCUS_CLS}`}
              >
                <FaTimes className="h-3.5 w-3.5" />
              </button>
            </div>
            <h2 id="delete-question-title" className="mt-4 text-lg font-bold text-[var(--panel-text)]">
              Savol o‘chirilsinmi?
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--panel-text-soft)]">
              Bu amalni ortga qaytarib bo‘lmaydi. Savol <b>{activeGame.title}</b> ro‘yxatidan o‘chiriladi.
            </p>
            <p className="mt-3 line-clamp-2 rounded-lg bg-[var(--panel-surface-strong)] px-3 py-2 text-sm font-medium text-[var(--panel-text)]">
              {summarizeQuestion(activeItems[deleteTargetIndex])}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTargetIndex(null)} disabled={saving} className={`${SECONDARY_BTN} ${FOCUS_CLS}`}>
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(deleteTargetIndex)}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-700 disabled:opacity-50 ${FOCUS_CLS}`}
              >
                <FaTrash className="h-3.5 w-3.5" />
                {saving ? "O‘chirilmoqda…" : "O‘chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}