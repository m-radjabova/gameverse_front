import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaCheck,
  FaEdit,
  FaPlus,
  FaRobot,
  FaSave,
  FaSearch,
  FaTrash,
  FaGraduationCap,
  FaBookOpen,
  FaStar,
  FaClock,
  FaLayerGroup,
  FaBrain,
  FaCrown,
  FaGem,
  FaChevronRight,
  FaRegLightbulb,
  FaHeart,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { GiCherry, GiFlowerTwirl, GiPlanetCore } from "react-icons/gi";
import { MdAutoAwesome } from "react-icons/md";
import { generateTeacherPanelQuestions, type SupportedTeacherGameKey } from "./teacherQuestionPanelAi";
import type { GameDifficulty } from "../../apiClient/gemini";
import useContextPro from "../../hooks/useContextPro";
import useGameQuestions from "../../hooks/useGameQuestions";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../utils/aiGeneration";
import { gameCards } from "../games/data";
import useHomeTheme from "../../hooks/useHomeTheme";

type GameRegistryItem = {
  gameKey: string;
  title: string;
  path: string;
  emoji: string;
  accent: string;
  bg: string;
  template: unknown;
  description?: string;
};

type EditorMode = "manual" | "ai";
type WorkspaceView = "dashboard" | "questions" | "create";

type QuestionActivity = {
  gameKey: string;
  addedCount: number;
  updatedAt: string;
};

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


const GAME_ACCENTS: Record<string, string> = {
  quiz_battle: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  classic_arcade: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
  wheel_of_fortune: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  math_race: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  math_chick: "from-amber-400 to-sky-400",
  tug_of_war: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  baamboozle: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
  jumanji: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  millionaire: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  truth_detector: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
  treasure_hunt: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  reverse_thinking: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  frog_pond: "from-emerald-400 to-sky-400",
  pizza_master: "from-orange-500 to-red-500",
  mystery_egg: "from-violet-500 to-lime-400",
  bingo: "from-indigo-500 to-fuchsia-500",
};


const GAME_BGS: Record<string, string> = {
  quiz_battle: "bg-[image:var(--panel-accent-gradient-soft)]",
  classic_arcade: "bg-[image:var(--panel-accent-gradient-soft)]",
  wheel_of_fortune: "bg-[image:var(--panel-accent-gradient-soft)]",
  math_race: "bg-[image:var(--panel-accent-gradient-soft)]",
  math_chick: "bg-gradient-to-br from-amber-400/10 to-sky-400/10",
  tug_of_war: "bg-[image:var(--panel-accent-gradient-soft)]",
  baamboozle: "bg-[image:var(--panel-accent-gradient-soft)]",
  jumanji: "bg-[image:var(--panel-accent-gradient-soft)]",
  millionaire: "bg-[image:var(--panel-accent-gradient-soft)]",
  truth_detector: "bg-[image:var(--panel-accent-gradient-soft)]",
  treasure_hunt: "bg-[image:var(--panel-accent-gradient-soft)]",
  reverse_thinking: "bg-[image:var(--panel-accent-gradient-soft)]",
  frog_pond: "bg-gradient-to-br from-emerald-400/10 to-sky-400/10",
  pizza_master: "bg-gradient-to-br from-orange-400/10 to-red-400/10",
  mystery_egg: "bg-gradient-to-br from-violet-400/10 to-lime-400/10",
  bingo: "bg-gradient-to-br from-indigo-400/10 to-fuchsia-400/10",
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
      accent: GAME_ACCENTS[gameKey] ?? "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
      bg: GAME_BGS[gameKey] ?? "bg-[image:var(--panel-accent-gradient-soft)]",
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
    return Array.isArray(parsed) ? parsed.filter((item): item is QuestionActivity =>
      item && typeof item.gameKey === "string" && Number.isFinite(item.addedCount) && typeof item.updatedAt === "string",
    ) : [];
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
  timeLimit: "Vaqt limiti",
  stage: "Bosqich",
  options: "Variantlar",
  claims: "Faktlar",
  truth: "Rost",
  claimA: "1-fakt",
  claimB: "2-fakt",
  claimC: "3-fakt",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Oson",
  medium: "O'rtacha",
  hard: "Qiyin",
  mixed: "Aralash",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "from-emerald-400 to-green-400",
  medium: "from-amber-400 to-orange-400",
  hard: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
  mixed: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
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

function getAiPanelContent(gameKey: string) {
  if (gameKey === "baamboozle") {
    return {
      heading: "Savol-javoblarni avtomatik yaratish",
      description: "Mavzu, savollar soni va qiyinlikni tanlang. AI Baamboozle uchun qisqa savol va aniq javoblar qo'shadi.",
      topicLabel: "Mavzu yoki fan",
      topicPlaceholder: "Masalan: hayvonlar, tarixiy sanalar, ingliz tili so'zlari...",
      buttonLabel: `AI bilan ${aiCountPlaceholder} ta savol-javob qo'shish`,
      loadingLabel: `${aiCountPlaceholder} ta savol-javob yaratilmoqda...`,
      footnote: `"Aralash" tanlansa easy, medium va hard uslubdagi savol-javoblar birga yaratiladi. Javoblar qisqa va oson tekshiriladigan formatda keladi.`,
    };
  }

  return {
    heading: "Savollarni avtomatik yaratish",
    description: "Mavzu, savollar soni va qiyinlikni tanlang. AI yangi savollarni shu o'yin ro'yxatiga qo'shadi.",
    topicLabel: "Mavzu",
    topicPlaceholder: "Masalan: kasrlar, geografiya, hayvonlar...",
    buttonLabel: `AI bilan ${aiCountPlaceholder} ta savol qo'shish`,
    loadingLabel: `${aiCountPlaceholder} ta savol yaratilmoqda...`,
    footnote: `"Aralash" tanlansa easy, medium va hard darajadagi savollar birga yaratiladi.`,
  };
}

const aiCountPlaceholder = "__COUNT__";

const normalizeAnswerText = (value: unknown) => String(value ?? "")
  .normalize("NFKC")
  .replace(/[\u2018\u2019\u201B\u2032\u02BC]/g, "'")
  .replace(/\u00A0/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("uz");

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
    if (!['easy', 'medium', 'hard'].includes(difficulty)) return "Jumanji qiyinligi easy, medium yoki hard bo'lishi kerak.";
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
  icon?: React.ReactNode;
}) {
  return (
    <div className="group">
      <label className="block space-y-2">
        <span className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
          {icon}
          {label}
        </span>
        <div className="relative">
          <select
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 pr-10 text-sm text-[var(--panel-text)] outline-none transition-all duration-200 hover:border-[var(--panel-accent)] focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
          >
            {options.map((option) => (
              <option key={String(option.value)} value={String(option.value)} className="bg-[var(--panel-surface-strong)] text-[var(--panel-text)]">
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronRight className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-[var(--panel-muted)]" />
        </div>
      </label>
    </div>
  );
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
  return [
    typeof value.difficulty === "string" ? value.difficulty : null,
    typeof value.level === "number" ? `level ${value.level}` : null,
    typeof value.subject === "string" ? value.subject : null,
    typeof value.category === "string" ? value.category : null,
    typeof value.points === "number" ? `${value.points} ball` : null,
  ].filter((meta): meta is string => Boolean(meta));
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
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
        <FaLayerGroup className="h-4 w-4 text-[var(--panel-accent)]" />
        Variantlar
      </div>
      <div className="grid gap-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="group rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-3 transition-all duration-200 hover:border-[var(--panel-accent)] hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[image:var(--panel-accent-gradient)] text-xs font-bold text-white shadow-sm">
                {getOptionLetter(index)}
              </span>
              {showCorrectSelector && onCorrectIndexChange && (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--panel-text)]">
                  <input
                    type="radio"
                    checked={selectedIndex === index}
                    onChange={() => onCorrectIndexChange(index)}
                    className="h-4 w-4 accent-[var(--panel-accent)]"
                  />
                  To'g'ri javob
                </label>
              )}
            </div>
            <input
              value={option}
              onChange={(event) => (onOptionChange ?? ((itemIndex, nextValue) => onChange([...path, itemIndex], nextValue)))(index, event.target.value)}
              className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-3 py-2.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_2px_var(--panel-focus-ring)]"
              placeholder={`Variant ${getOptionLetter(index)}`}
            />
          </div>
        ))}
      </div>
    </div>
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
    <div className="space-y-4 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
          <FaBrain className="h-4 w-4 text-[var(--panel-accent)]" />
          3 ta fakt
        </div>
        <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-tint)] px-3 py-1 text-[9px] font-medium text-[var(--panel-accent)]">
          1 tasi yolg'on
        </div>
      </div>

      <div className="space-y-3">
        {claims.map((claim, index) => (
          <div
            key={index}
            className="group rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-3 transition-all duration-200 hover:border-[var(--panel-accent)] hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--panel-text)]">{index + 1}-fakt</span>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[var(--panel-text)]">
                <input
                  type="radio"
                  name="fake-claim"
                  checked={fakeIndex === index}
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
              className="min-h-[80px] w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-3 py-2.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_2px_var(--panel-focus-ring)]"
              placeholder={`${index + 1}-faktni yozing`}
            />
          </div>
        ))}
      </div>
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

  if (Array.isArray(value.options)) {
    const options = (value.options as unknown[]).map((item) => String(item ?? ""));
    const storedJumanjiCorrectIndex = Number(value.correctOptionIndex);
    const jumanjiCorrectIndex = gameKey === "jumanji" && normalizeAnswerText(value.correctAnswer)
      ? options.findIndex((option) => normalizeAnswerText(option) === normalizeAnswerText(value.correctAnswer))
      : -1;
    const selectedIndex =
      typeof value.answerIndex === "number"
        ? value.answerIndex
        : typeof value.correctIndex === "number"
          ? value.correctIndex
          : Number.isInteger(storedJumanjiCorrectIndex) && storedJumanjiCorrectIndex >= 0 && storedJumanjiCorrectIndex < options.length
            ? storedJumanjiCorrectIndex
            : jumanjiCorrectIndex >= 0 ? jumanjiCorrectIndex : undefined;

    return (
      <div className="space-y-4">
        {"title" in value && (
          <FormField label="title" value={value.title} path={["title"]} onChange={onChange} icon={<FaBookOpen />} />
        )}
        {"story" in value && (
          <FormField label="story" value={value.story} path={["story"]} onChange={onChange} icon={<FaBookOpen />} />
        )}
        {"subject" in value && (
          <FormField label="subject" value={value.subject} path={["subject"]} onChange={onChange} icon={<FaGraduationCap />} />
        )}
        {"category" in value && (
          <FormField label="category" value={value.category} path={["category"]} onChange={onChange} icon={<FaLayerGroup />} />
        )}
        {"difficulty" in value && (
          <FormField label="difficulty" value={value.difficulty} path={["difficulty"]} onChange={onChange} icon={<FaStar />} />
        )}
        {"level" in value && (gameKey === "mystery_egg" ? (
          <div className="space-y-2">
            <SelectField
              label="Tuxum dunyosi"
              value={Number(value.level) || 1}
              options={MYSTERY_EGG_LEVEL_OPTIONS.map((level) => ({ value: level.value, label: level.label }))}
              onChange={(next) => onChange(["level"], Number(next))}
              icon={<FaCrown />}
            />
            <p className="px-1 text-[10px] leading-4 text-[var(--panel-muted)]">
              Savol faqat tanlangan tuxum dunyosida ishlatiladi. Yuqori dunyolarda savollar qiyinroq bo'lishi kerak.
            </p>
          </div>
        ) : (
          <FormField label="level" value={value.level} path={["level"]} onChange={onChange} icon={<FaCrown />} />
        ))}
        {"stage" in value && (
          <FormField label="stage" value={value.stage} path={["stage"]} onChange={onChange} icon={<FaLayerGroup />} />
        )}
        {"question" in value && (
          <FormField label="question" value={value.question} path={["question"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}
        {"prompt" in value && (
          <FormField label="prompt" value={value.prompt} path={["prompt"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}
        {"text" in value && typeof value.question !== "string" && typeof value.prompt !== "string" && (
          <FormField label="text" value={value.text} path={["text"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}

        <OptionListEditor
          options={options}
          path={["options"]}
          selectedIndex={selectedIndex}
          showCorrectSelector={gameKey === "jumanji" || typeof selectedIndex === "number"}
          onChange={onChange}
          onOptionChange={gameKey === "jumanji" ? (index, nextOption) => {
            if (selectedIndex === index) {
              onChange(["correctAnswer"], nextOption);
            }
            onChange(["options", index], nextOption);
          } : undefined}
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

        {"correctAnswer" in value && gameKey !== "jumanji" && (
          <FormField label="correctAnswer" value={value.correctAnswer} path={["correctAnswer"]} onChange={onChange} icon={<FaCheck />} />
        )}

        {"correct" in value && (
          <FormField label="correct" value={value.correct} path={["correct"]} onChange={onChange} icon={<FaCheck />} />
        )}

        {"hint" in value && (
          <FormField label="hint" value={value.hint} path={["hint"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}
        {"explanation" in value && (
          <FormField label="explanation" value={value.explanation} path={["explanation"]} onChange={onChange} icon={<FaBookOpen />} />
        )}
        {"reward" in value && (
          <FormField label="reward" value={value.reward} path={["reward"]} onChange={onChange} icon={<FaGem />} />
        )}
        {"points" in value && (
          <FormField label="points" value={value.points} path={["points"]} onChange={onChange} icon={<FaStar />} />
        )}
        {"timeLimit" in value && (
          <FormField label="timeLimit" value={value.timeLimit} path={["timeLimit"]} onChange={onChange} icon={<FaClock />} />
        )}
        {"answer" in value && (
          <FormField label="answer" value={value.answer} path={["answer"]} onChange={onChange} icon={<FaCheck />} />
        )}
      </div>
    );
  }

  if (value.options && typeof value.options === "object" && !Array.isArray(value.options)) {
    const optionObject = value.options as Record<string, unknown>;
    return (
      <div className="space-y-4">
        {"text" in value && (
          <FormField label="text" value={value.text} path={["text"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}
        {"difficulty" in value && (
          <FormField label="difficulty" value={value.difficulty} path={["difficulty"]} onChange={onChange} icon={<FaStar />} />
        )}
        {"category" in value && (
          <FormField label="category" value={value.category} path={["category"]} onChange={onChange} icon={<FaLayerGroup />} />
        )}
        <div className="space-y-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
            <FaLayerGroup className="h-4 w-4 text-[var(--panel-accent)]" />
            Variantlar
          </div>
          {Object.entries(optionObject).map(([key, optionValue]) => (
            <FormField
              key={key}
              label={`${key}-variant`}
              value={optionValue}
              path={["options", key]}
              onChange={onChange}
            />
          ))}
        </div>
        {"correct" in value && (
          <FormField label="correct" value={value.correct} path={["correct"]} onChange={onChange} icon={<FaCheck />} />
        )}
      </div>
    );
  }

  if (gameKey === "truth_detector" && Array.isArray(value.claims)) {
    return (
      <div className="space-y-4">
        {"title" in value && (
          <FormField label="title" value={value.title} path={["title"]} onChange={onChange} icon={<FaBookOpen />} />
        )}
        {"difficulty" in value && (
          <FormField label="difficulty" value={value.difficulty} path={["difficulty"]} onChange={onChange} icon={<FaStar />} />
        )}
        <TruthClaimsEditor claims={value.claims as Array<{ text?: unknown; truth?: unknown }>} path={["claims"]} onChange={onChange} />
      </div>
    );
  }

  if ("question" in value || "answer" in value) {
    return (
      <div className="space-y-4">
        {"question" in value && (
          <FormField label="question" value={value.question} path={["question"]} onChange={onChange} icon={<FaRegLightbulb />} />
        )}
        {gameKey === "math_chick" && Array.isArray(value.options) && (
          <OptionListEditor
            options={(value.options as unknown[]).map((item) => String(item ?? ""))}
            path={["options"]}
            onChange={onChange}
          />
        )}
        {"answer" in value && (
          <FormField label="answer" value={value.answer} path={["answer"]} onChange={onChange} icon={<FaCheck />} />
        )}
        {"difficulty" in value && (
          <FormField label="difficulty" value={value.difficulty} path={["difficulty"]} onChange={onChange} icon={<FaStar />} />
        )}
        {"points" in value && (
          <FormField label="points" value={value.points} path={["points"]} onChange={onChange} icon={<FaStar />} />
        )}
      </div>
    );
  }

  return null;
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
  icon?: React.ReactNode;
}) {
  const title = prettifyKey(label);

  if (typeof value === "string") {
    if (label === "difficulty" && DIFFICULTY_LABELS[value]) {
      return (
        <SelectField
          label={title}
          value={value}
          options={Object.entries(DIFFICULTY_LABELS).map(([optionValue, optionLabel]) => ({
            value: optionValue,
            label: optionLabel,
          }))}
          onChange={(next) => onChange(path, next)}
          icon={icon}
        />
      );
    }

    if (label === "subject") {
      return (
        <SelectField
          label={title}
          value={value}
          options={SUBJECT_OPTIONS.map((option) => ({ value: option, label: option }))}
          onChange={(next) => onChange(path, next)}
          icon={icon}
        />
      );
    }

    const isLong = value.length > 60 || /story|explanation|hint/i.test(label);
    return (
      <div className="group">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
            {icon}
            {title}
          </span>
          {isLong ? (
            <textarea
              value={value}
              onChange={(event) => onChange(path, event.target.value)}
              className="min-h-[100px] w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all duration-200 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
              placeholder={title}
            />
          ) : (
            <input
              value={value}
              onChange={(event) => onChange(path, event.target.value)}
              className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all duration-200 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
              placeholder={title}
            />
          )}
        </label>
      </div>
    );
  }

  if (typeof value === "number") {
    if (label === "answerIndex" || label === "correctIndex") {
      return (
        <SelectField
          label={title}
          value={value}
          options={[0, 1, 2, 3].map((option) => ({
            value: option,
            label: `${getOptionLetter(option)}-variant`,
          }))}
          onChange={(next) => onChange(path, Number(next))}
          icon={icon}
        />
      );
    }

    if (label === "level") {
      return (
        <SelectField
          label={title}
          value={value}
          options={[1, 2, 3, 4, 5].map((option) => ({
            value: option,
            label: `${option}-daraja`,
          }))}
          onChange={(next) => onChange(path, Number(next))}
          icon={icon}
        />
      );
    }

    return (
      <div className="group">
        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
            {icon}
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
            className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all duration-200 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
          />
        </label>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="group">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 transition-all duration-200 hover:border-[var(--panel-accent)]">
          <span className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text)]">
            {icon}
            {title}
          </span>
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => onChange(path, event.target.checked)}
            className="h-4 w-4 rounded border-[var(--panel-border)] accent-[var(--panel-accent)]"
          />
        </label>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
            {icon}
            {title}
          </span>
          <span className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface)] px-2 py-0.5 text-[9px] font-medium text-[var(--panel-muted)]">
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
      <div className="space-y-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--panel-text-soft)]">
          {icon}
          {title}
        </div>
        <div className={`grid gap-3 ${depth === 0 ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {Object.entries(value as Record<string, unknown>).map(([key, childValue]) => (
            <FormField
              key={key}
              label={key}
              value={childValue}
              path={[...path, key]}
              depth={depth + 1}
              onChange={onChange}
            />
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

function QuestionListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Savollar yuklanmoqda">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-20 rounded bg-[var(--panel-border)]" />
              <div className="h-4 w-4/5 rounded bg-[var(--panel-border)]" />
              <div className="h-3 w-2/5 rounded bg-[var(--panel-border)]" />
            </div>
            <div className="h-8 w-20 rounded-md bg-[var(--panel-border)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Editor yuklanmoqda">
      <div className="h-14 rounded-lg bg-[var(--panel-border)]" />
      <div className="space-y-2"><div className="h-3 w-28 rounded bg-[var(--panel-border)]" /><div className="h-12 rounded-lg bg-[var(--panel-border)]" /></div>
      <div className="space-y-2"><div className="h-3 w-24 rounded bg-[var(--panel-border)]" /><div className="h-28 rounded-lg bg-[var(--panel-border)]" /></div>
      <div className="h-11 w-36 rounded-lg bg-[var(--panel-border)]" />
    </div>
  );
}

export default function TeacherQuestionPanel() {
  const isDarkMode = useHomeTheme();
  const {
    state: { user },
  } = useContextPro();
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [search, setSearch] = useState("");
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
  const activeItems = useMemo(
    () => activeGameKey ? getQuestions(activeGameKey) : [],
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
  const recentActivity = useMemo(
    () => [...questionActivity].sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt)).slice(0, 6),
    [questionActivity],
  );

  useEffect(() => {
    setQuestionActivity(readQuestionActivity(user?.id));
    dashboardLoadedForRef.current = null;
  }, [user?.id]);

  useEffect(() => {
    if (workspaceView !== "dashboard" || !user?.id || dashboardLoadedForRef.current === user.id) return;
    dashboardLoadedForRef.current = user.id;
    void (async () => {
      // A dashboard can contain many games. Small batches keep the API and the
      // browser responsive instead of opening every request at the same time.
      const batchSize = 3;
      for (let start = 0; start < GAME_REGISTRY.length; start += batchSize) {
        await Promise.all(GAME_REGISTRY.slice(start, start + batchSize).map((game) => loadQuestions(game.gameKey, {
          teacherScoped: true,
          filterBySessionDifficulty: false,
        })));
      }
    })();
  }, [loadQuestions, user?.id, workspaceView]);

  function recordQuestionAddition(gameKey: string, addedCount: number) {
    const activity: QuestionActivity = { gameKey, addedCount, updatedAt: new Date().toISOString() };
    setQuestionActivity((previous) => {
      const next = [activity, ...previous.filter((item) => item.gameKey !== gameKey)].slice(0, 12);
      try {
        localStorage.setItem(teacherActivityStorageKey(user?.id), JSON.stringify(next));
      } catch {
        // The dashboard remains usable if browser storage is unavailable.
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

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return activeItems.map((item, index) => ({ item, index }));
    }

    return activeItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => summarizeQuestion(item).toLowerCase().includes(term));
  }, [activeItems, search]);

  async function persistGameItems(gameKey: string, nextItems: unknown[]) {
    if (!user?.id) {
      setEditorError("Teacher akkaunt topilmadi. Qayta login qilib ko'ring.");
      return false;
    }
    const ok = await saveQuestionsForGame(gameKey, nextItems, true);
    if (!ok) {
      setEditorError("Saqlashda xato bo'ldi. Token yoki backendni tekshiring.");
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
      setEditorError("");
      const generated = await generateTeacherPanelQuestions({
        gameKey: activeGame.gameKey as SupportedTeacherGameKey,
        topic: activeGame.gameKey === "mystery_egg" ? `Level ${aiMysteryLevel}. ${aiTopic}` : aiTopic,
        subject: aiSubject,
        count: aiCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
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
      const levelAdjusted = activeGame.gameKey === "mystery_egg"
        ? difficultyAdjusted.map((item) => item && typeof item === "object" ? { ...(item as Record<string, unknown>), level: aiMysteryLevel } : item)
        : difficultyAdjusted;
      const nextItems = [...levelAdjusted.map((item) => withIdFallback(item)), ...activeItems];
      const ok = await persistGameItems(activeGame.gameKey, nextItems);
      if (!ok) return;

      recordQuestionAddition(activeGame.gameKey, levelAdjusted.length);

      setSelectedIndex(0);
      setDraftValue(withIdFallback(levelAdjusted[0] ?? activeGame.template));
      setEditorMode("manual");
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "AI savol yaratishda xato bo'ldi.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function handleSelectGame(gameKey: string) {
    setActiveGameKey(gameKey);
    setSelectedIndex(null);
    setSearch("");
    setEditorMode("manual");
    setWorkspaceView("questions");
    setDeleteTargetIndex(null);
    void loadQuestions(gameKey, { teacherScoped: true, filterBySessionDifficulty: false });
  }

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="teacher-theme teacher-workspace min-h-screen bg-[image:var(--panel-page-bg)] bg-[var(--panel-page-base)] px-4 py-4 sm:px-6 sm:py-6"
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[var(--home-blob-1)] blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[var(--home-blob-3)] blur-3xl animate-float-slow" />
        <GiCherry className="absolute left-[12%] top-[20%] text-6xl text-[var(--panel-accent)]/10 animate-petal-float" />
        <GiFlowerTwirl className="absolute right-[15%] top-[40%] text-7xl text-[var(--panel-accent-strong)]/10 animate-float-soft" />
        <GiPlanetCore className="absolute left-[20%] bottom-[15%] text-8xl text-[var(--panel-muted)]/10 animate-spin-slow" />
      </div>

      <div className="relative mx-auto max-w-[1680px]">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Game sidebar */}
        <section className="overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-3 shadow-lg shadow-[var(--panel-accent)]/5 backdrop-blur-xl xl:sticky xl:top-[84px] xl:h-[calc(100vh-96px)] xl:self-start">
          <div className="mb-3 flex items-center justify-between gap-3 px-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--panel-muted)]">Teacher panel</p>
              <h2 className="mt-1 text-base font-bold text-[var(--panel-text)]">Ish maydoni</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWorkspaceView("dashboard")}
            className={`mb-3 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
              workspaceView === "dashboard"
                ? "border-[var(--panel-accent)] bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/25"
                : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)]/50"
            }`}
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${workspaceView === "dashboard" ? "bg-white/15" : "bg-[image:var(--panel-accent-gradient-soft)]"}`}><FaLayerGroup /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Dashboard</span>
              <span className={`mt-0.5 block text-[10px] ${workspaceView === "dashboard" ? "text-white/75" : "text-[var(--panel-text-soft)]"}`}>Savollar va so'nggi qo'shishlar</span>
            </span>
          </button>

          <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--panel-muted)]">O'yinlar</p>

          <div className="teacher-games-scroll -mx-1 max-h-[calc(100vh-125px)] overflow-y-auto px-1 pb-2 xl:max-h-[calc(100vh-180px)]">
            <div className="flex flex-col gap-2">
              {GAME_REGISTRY.map((game) => {
                const count = questionsByGame[game.gameKey]?.length ?? 0;
                const active = game.gameKey === activeGameKey;
                return (
                  <button
                    key={game.gameKey}
                    type="button"
                    onClick={() => handleSelectGame(game.gameKey)}
                    className={`group relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 ${
                      active
                        ? "border-[var(--panel-accent)] bg-[image:var(--panel-accent-gradient-soft)] shadow-[0_18px_40px_var(--panel-accent)/25]"
                        : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:-translate-y-1 hover:border-[var(--panel-accent)]/50 hover:bg-[var(--panel-surface)] hover:shadow-lg hover:shadow-[var(--panel-accent)]/10"
                    }`}
                  >
                    <div className="relative flex items-center gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.accent} text-xl text-white shadow-md`}>
                          {game.emoji}
                        </div>
                        <div className={`ml-auto rounded-lg border px-2 py-1 text-center ${active ? "border-[var(--panel-accent)]/30 bg-[var(--panel-surface)] text-[var(--panel-text)]" : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text-soft)]"}`}>
                          <div className="text-[7px] font-medium uppercase tracking-wider">Savol</div>
                          <div className="text-xs font-bold">{count}</div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-[var(--panel-text)]">{game.title}</h3>
                        <p className="mt-0.5 truncate text-[10px] text-[var(--panel-text-soft)]">{game.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="min-w-0">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setWorkspaceView("dashboard")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                workspaceView === "dashboard"
                  ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
                  : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface-strong)] hover:text-[var(--panel-text)]"
              }`}
            >
              <FaLayerGroup className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceView("questions")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                workspaceView === "questions"
                  ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
                  : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface-strong)] hover:text-[var(--panel-text)]"
              }`}
            >
              <FaLayerGroup className="h-4 w-4" />
              Savollar
              {activeGame && <span className={`rounded-full px-2 py-0.5 text-[10px] ${workspaceView === "questions" ? "bg-white/20 text-white" : "bg-[var(--panel-surface-strong)] text-[var(--panel-muted)]"}`}>{activeItems.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedIndex(null);
                setEditorMode("manual");
                setWorkspaceView("create");
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                workspaceView === "create"
                  ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-md shadow-[var(--panel-accent)]/25"
                  : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface-strong)] hover:text-[var(--panel-text)]"
              }`}
            >
              <FaPlus className="h-4 w-4" />
              Savol qo'shish
            </button>
          </div>

        {workspaceView === "dashboard" && (
          <section className="space-y-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4 shadow-lg shadow-[var(--panel-accent)]/5 backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--panel-accent)]">Teacher dashboard</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[var(--panel-text)] sm:text-3xl">Savollar markazi</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--panel-text-soft)]">O'yinlardagi savollarni kuzating, oxirgi qo'shganlaringizni ko'ring va kerakli o'yinga bir bosishda o'ting.</p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-3 py-2 text-[10px] font-bold text-[var(--panel-text-soft)]">
                <FaClock className="text-[var(--panel-accent)]" /> Ma'lumotlar yangilanmoqda
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--panel-border)] bg-[image:var(--panel-accent-gradient-soft)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--panel-text-soft)]">Jami savollar</p>
                <p className="mt-2 text-3xl font-black text-[var(--panel-text)]">{totalQuestionCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--panel-text-soft)]">Faol o'yinlar</p>
                <p className="mt-2 text-3xl font-black text-[var(--panel-text)]">{activeGamesCount}<span className="ml-1 text-sm font-bold text-[var(--panel-muted)]">/ {GAME_REGISTRY.length}</span></p>
              </div>
              <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--panel-text-soft)]">So'nggi qo'shishlar</p>
                <p className="mt-2 text-3xl font-black text-[var(--panel-text)]">{questionActivity.reduce((total, item) => total + item.addedCount, 0)}</p>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
              <div className="overflow-hidden rounded-2xl border border-[var(--panel-border)]">
                <div className="flex items-center justify-between border-b border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3">
                  <h2 className="text-sm font-black text-[var(--panel-text)]">O'yinlar bo'yicha savollar</h2>
                  <span className="text-[10px] font-medium text-[var(--panel-muted)]">O'yinni tanlang</span>
                </div>
                <div className="divide-y divide-[var(--panel-border)]">
                  {GAME_REGISTRY.map((game) => {
                    const count = questionsByGame[game.gameKey]?.length ?? 0;
                    return <button key={game.gameKey} type="button" onClick={() => handleSelectGame(game.gameKey)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[image:var(--panel-accent-gradient-soft)]">
                      <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.accent} text-base text-white`}>{game.emoji}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[var(--panel-text)]">{game.title}</span><span className="mt-0.5 block truncate text-[10px] text-[var(--panel-muted)]">{loadedByGame[game.gameKey] ? `${count} ta savol` : "Yuklanmoqda..."}</span></span>
                      <FaChevronRight className="h-3 w-3 text-[var(--panel-muted)]" />
                    </button>;
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
                <h2 className="text-sm font-black text-[var(--panel-text)]">Oxirgi qo'shilganlar</h2>
                <p className="mt-1 text-[10px] leading-4 text-[var(--panel-text-soft)]">AI yoki qo'lda qo'shilgan so'nggi savollar.</p>
                <div className="mt-4 space-y-3">
                  {recentActivity.map((activity) => {
                    const game = GAME_REGISTRY.find((item) => item.gameKey === activity.gameKey);
                    if (!game) return null;
                    return <button key={`${activity.gameKey}-${activity.updatedAt}`} type="button" onClick={() => handleSelectGame(activity.gameKey)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-3 text-left transition hover:border-[var(--panel-accent)]">
                      <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${game.accent} text-base text-white`}>{game.emoji}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[var(--panel-text)]">{game.title}</span><span className="mt-0.5 block text-[10px] text-[var(--panel-text-soft)]">{activity.addedCount} ta savol qo'shildi</span></span>
                      <span className="max-w-20 text-right text-[9px] leading-3 text-[var(--panel-muted)]">{formatActivityDate(activity.updatedAt)}</span>
                    </button>;
                  })}
                  {recentActivity.length === 0 && <div className="rounded-xl border border-dashed border-[var(--panel-border)] px-4 py-8 text-center text-xs text-[var(--panel-muted)]">Hali savol qo'shilmagan.</div>}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid gap-4">
          {/* Left Panel - Question List */}
          <section className={`min-w-0 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4 shadow-lg shadow-[var(--panel-accent)]/5 backdrop-blur-xl sm:p-5 ${workspaceView === "questions" ? "" : "hidden"}`}>
            {activeGame ? (
              <>
                {/* Active Game Banner */}
                <div className="mb-6 rounded-[28px] border border-[var(--panel-border)] bg-[image:var(--panel-accent-gradient-soft)] p-5 shadow-inner">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activeGame.accent} text-2xl text-white shadow-md`}>
                        {activeGame.emoji}
                      </div>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--panel-muted)]">Tanlangan o'yin</div>
                        <h2 className="mt-1 text-xl font-bold text-[var(--panel-text)]">{activeGame.title}</h2>
                        <p className="mt-1.5 text-xs text-[var(--panel-text-soft)] leading-relaxed">
                          {activeItems.length} ta savol. Kerakli savolni ro'yxatdan tanlang va o'ng panelda tahrir qiling.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative min-w-[220px] flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--panel-muted)]" />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Savol qidiring..."
                          className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] py-2.5 pl-10 pr-3 text-xs text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
                        />
                      </div>
                      <Link
                        to={activeGame.path}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--panel-border)] px-5 py-2.5 text-xs font-bold transition-all hover:border-[var(--panel-accent)] hover:bg-[image:var(--panel-accent-gradient-soft)] hover:shadow-md"
                        style={{ color: "var(--panel-text)", backgroundColor: "var(--panel-surface-strong)" }}
                      >
                        O'yinga o'tish
                        <FaArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(null);
                      setEditorMode("manual");
                      setWorkspaceView("create");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                      selectedIndex === null
                        ? "border-[var(--panel-accent)] bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                        : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)] hover:shadow-md"
                    }`}
                  >
                    <FaPlus className="h-3 w-3" />
                    Yangi savol
                  </button>
                  <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-2 text-[11px] font-medium text-[var(--panel-text-soft)]">
                    {filteredItems.length} / {activeItems.length} ko'rsatilmoqda
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-3 pr-1">
                  {loading ? <QuestionListSkeleton /> : filteredItems.map(({ item, index: realIndex }) => {
                    const meta = extractMeta(item);
                    const selected = selectedIndex === realIndex;

                    return (
                      <button
                        key={typeof (item as { id?: unknown })?.id === "string" ? String((item as { id?: unknown }).id) : `${activeGame.gameKey}-${realIndex}`}
                        type="button"
                        onClick={() => {
                          setSelectedIndex(realIndex);
                          setEditorMode("manual");
                          setWorkspaceView("create");
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-[var(--panel-accent)] bg-[image:var(--panel-accent-gradient-soft)] shadow-md shadow-[var(--panel-accent)]/15"
                            : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:border-[var(--panel-accent)]/40 hover:bg-[var(--panel-surface)] hover:shadow-md"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-2.5 py-0.5 text-[8px] font-bold text-[var(--panel-muted)]">
                                #{realIndex + 1}
                              </span>
                              {meta.map((badge) => {
                                const color = DIFFICULTY_LABELS[badge] ? DIFFICULTY_COLORS?.[badge] : "from-gray-200 to-gray-300";
                                return (
                                  <span
                                    key={badge}
                                    className={`rounded-full border border-[var(--panel-border)] bg-gradient-to-r ${color}/10 px-2.5 py-0.5 text-[8px] font-medium text-[var(--panel-text)]`}
                                  >
                                    {DIFFICULTY_LABELS[badge] || badge}
                                  </span>
                                );
                              })}
                            </div>
                            <p className="text-sm font-semibold leading-6 text-[var(--panel-text)] truncate">{summarizeQuestion(item)}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all ${
                                selected
                                  ? "border-[var(--panel-accent)]/40 bg-[var(--panel-surface-strong)] text-[var(--panel-accent)]"
                                  : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text-soft)] group-hover:border-[var(--panel-accent)]/30"
                              }`}
                            >
                              <FaEdit className="h-2.5 w-2.5" />
                              {selected ? "Tahrirlanmoqda" : "Tanlash"}
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setDeleteTargetIndex(realIndex);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-3 py-1.5 text-[10px] font-medium text-rose-500 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500"
                            >
                              <FaTrash className="h-2.5 w-2.5" />
                              O'chirish
                            </button>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {!loading && filteredItems.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-12 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--panel-accent-gradient-soft)]">
                        <FaSearch className="h-5 w-5 text-[var(--panel-accent)]" />
                      </div>
                      <p className="text-sm font-bold text-[var(--panel-text)]">
                        {loadedByGame[activeGame.gameKey] ? "Savol topilmadi" : "Savollar hali yuklanmagan"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--panel-muted)] max-w-xs mx-auto">
                        {loadedByGame[activeGame.gameKey]
                          ? "Qidiruvni o'zgartiring yoki yangi savol qo'shing."
                          : "O'yin tanlanganda savollar shu yerda chiqadi."}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-center">
                <div className="max-w-md px-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--panel-accent-gradient-soft)]">
                    <FaChevronRight className="h-6 w-6 text-[var(--panel-accent)]" />
                  </div>
                  <p className="text-lg font-bold text-[var(--panel-text)]">Avval tepada o'yinni tanlang</p>
                  <p className="mt-3 text-sm text-[var(--panel-text-soft)] leading-relaxed">
                    O'yin ustiga bosilganda chap tomonda savollar, o'ng tomonda esa qo'shish va AI paneli ochiladi.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Right Panel - Editor / AI */}
          <aside className={`min-w-0 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-4 shadow-lg shadow-[var(--panel-accent)]/5 backdrop-blur-xl sm:p-5 ${workspaceView === "create" ? "" : "hidden"}`}>
            {activeGame ? (
              <>
                {loading ? <EditorSkeleton /> : <>
                {/* Panel Header */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-muted)]">Savol boshqaruvi</div>
                    <h3 className="mt-1.5 text-lg font-bold text-[var(--panel-text)]">
                      {editorMode === "manual"
                        ? selectedIndex === null
                          ? "Qo'lda qo'shish"
                          : `Savol #${selectedIndex + 1}`
                        : "Sun'iy intellekt bilan yaratish"}
                    </h3>
                  </div>
                  <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-1.5 text-[10px] font-medium text-[var(--panel-text)]">
                    {activeGame.title}
                  </div>
                </div>

                {/* Mode Switcher */}
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-[24px] border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setEditorMode("manual")}
                    className={`inline-flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-3.5 text-center transition-all duration-200 ${
                      editorMode === "manual"
                        ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                        : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface)] hover:text-[var(--panel-text)]"
                    }`}
                  >
                    <FaEdit className="h-4 w-4" />
                    <span className="text-xs font-bold">Qo'lda</span>
                    <span className={`text-[9px] leading-3 ${editorMode === "manual" ? "text-white/80" : "text-[var(--panel-muted)]"}`}>
                      O'zingiz kiritasiz
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("ai")}
                    className={`inline-flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-3.5 text-center transition-all duration-200 ${
                      editorMode === "ai"
                        ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                        : "text-[var(--panel-text-soft)] hover:bg-[var(--panel-surface)] hover:text-[var(--panel-text)]"
                    }`}
                  >
                    <MdAutoAwesome className="h-4 w-4" />
                    <span className="text-xs font-bold">AI yaratish</span>
                    <span className={`text-[9px] leading-3 ${editorMode === "ai" ? "text-white/80" : "text-[var(--panel-muted)]"}`}>
                      Tez savol tayyorlaydi
                    </span>
                  </button>
                </div>

                {/* AI Mode Panel */}
                {editorMode === "ai" ? (
                  <div className="space-y-5 rounded-2xl border border-[var(--panel-border)] bg-[image:var(--panel-accent-gradient-soft)] p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[image:var(--panel-accent-gradient)] text-white shadow-md">
                        <MdAutoAwesome className={`h-4 w-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--panel-muted)]">AI yordamchisi</p>
                        <h4 className="mt-1 text-sm font-bold text-[var(--panel-text)]">{aiPanelContent.heading}</h4>
                        <p className="mt-1 text-[10px] leading-4 text-[var(--panel-text-soft)]">{aiPanelContent.description}</p>
                      </div>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">Fan</span>
                      <select
                        value={aiSubject}
                        onChange={(event) => setAiSubject(event.target.value)}
                        className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-text)] outline-none transition-all duration-200 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
                      >
                        {SUBJECT_OPTIONS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                      </select>
                    </label>

                    {activeGame.gameKey === "mystery_egg" && (
                      <label className="block space-y-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">Tuxum dunyosi</span>
                        <select value={aiMysteryLevel} onChange={(event) => setAiMysteryLevel(Number(event.target.value))} className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm font-bold text-[var(--panel-text)] outline-none focus:border-[var(--panel-accent)]">
                          {MYSTERY_EGG_LEVEL_OPTIONS.map((level) => <option key={level.value} value={level.value}>{level.label} · {level.detail}</option>)}
                        </select>
                        <p className="text-[9px] leading-4 text-[var(--panel-muted)]">AI yaratgan barcha savollar tanlangan tuxum dunyosiga biriktiriladi.</p>
                      </label>
                    )}

                    <label className="block space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">{aiPanelContent.topicLabel}</span>
                      <textarea
                        value={aiTopic}
                        onChange={(event) => setAiTopic(event.target.value)}
                        placeholder={aiPanelContent.topicPlaceholder}
                        rows={3}
                        className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none transition-all duration-200 focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)]"
                      />
                    </label>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">Sinf oralig'i</span>
                        <div className="grid grid-cols-2 gap-2">
                          {GRADE_RANGE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setAiGradeRange(option.value)}
                              className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                                aiGradeRange === option.value
                                  ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                                  : "border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)] hover:shadow-md"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">Savollar soni</span>
                          <div className="grid grid-cols-3 gap-2">
                            {AI_COUNT_OPTIONS.map((count) => (
                              <button
                                key={count}
                                type="button"
                                onClick={() => setAiCount(count)}
                                className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                                  aiCount === count
                                    ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                                    : "border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)] hover:shadow-md"
                                }`}
                              >
                                {count} ta
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--panel-text-soft)]">Qiyinlik</span>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setAiDifficulty(value as GameDifficulty)}
                                className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 ${
                                  aiDifficulty === value
                                    ? "bg-[image:var(--panel-accent-gradient)] text-white shadow-lg shadow-[var(--panel-accent)]/30"
                                    : "border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)] hover:shadow-md"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleGenerateAi()}
                      disabled={isGeneratingAi || saving}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--panel-accent-gradient)] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--panel-accent)]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      <MdAutoAwesome className={`h-4 w-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                      {isGeneratingAi
                        ? aiPanelContent.loadingLabel.replace(aiCountPlaceholder, String(aiCount))
                        : aiPanelContent.buttonLabel.replace(aiCountPlaceholder, String(aiCount))}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Manual Mode Header */}
                    <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-4">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--panel-muted)]">Qo'lda kiritish</p>
                        <p className="mt-1 text-xs text-[var(--panel-text-soft)]">
                          {selectedIndex === null ? "Yangi savolni qo'lda kiriting." : "Tanlangan savolni tahrir qiling."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIndex(null);
                          setEditorError("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface-tint)] px-3 py-2 text-[10px] font-medium text-[var(--panel-accent)] transition-all hover:bg-[image:var(--panel-accent-gradient)] hover:text-white hover:border-transparent hover:shadow-md"
                      >
                        <FaPlus className="h-2.5 w-2.5" />
                        Yangi
                      </button>
                    </div>

                    {/* Editor Fields */}
                    <div className="space-y-4 pr-1">
                      {draftValue && typeof draftValue === "object" ? (
                        <>
                          <SpecializedEditor
                            gameKey={activeGame.gameKey}
                            draftValue={draftValue}
                            onChange={(path, valueAtPath) => {
                              setDraftValue((prev: unknown) => updateValueAtPath(prev, path, valueAtPath));
                            }}
                          />

                          <details open={showExtraFields} className="mt-4 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-3 transition-all">
                            <summary
                              className="flex cursor-pointer items-center justify-between text-xs font-medium text-[var(--panel-text)] hover:text-[var(--panel-accent)] transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowExtraFields(!showExtraFields);
                              }}
                            >
                              <span>Qo'shimcha maydonlar</span>
                              <FaChevronRight className={`h-2.5 w-2.5 transition-transform duration-200 ${showExtraFields ? "rotate-90" : ""}`} />
                            </summary>
                            <div className="mt-3 space-y-3">
                              {Object.entries(draftValue as Record<string, unknown>).map(([key, value]) => {
                                const handledKeys = new Set([
                                  "title", "story", "subject", "category", "difficulty", "level",
                                  "question", "prompt", "text", "options", "correctAnswer", "correct",
                                  "hint", "explanation", "reward", "points", "timeLimit", "answer", "correctOptionIndex",
                                  "claims", "id", "answerIndex", "correctIndex"
                                ]);
                                if (handledKeys.has(key)) return null;
                                return (
                                  <FormField
                                    key={key}
                                    label={key}
                                    value={value}
                                    path={[key]}
                                    onChange={(path, valueAtPath) => {
                                      setDraftValue((prev: unknown) => updateValueAtPath(prev, path, valueAtPath));
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </details>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-8 text-center text-[10px] text-[var(--panel-muted)]">
                          Bu format uchun forma mavjud emas
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Error Display */}
                {editorError && (
                  <div className="mt-4 rounded-xl border border-rose-200/50 bg-rose-50/80 backdrop-blur-sm px-4 py-3 text-[10px] font-medium text-rose-600">
                    {editorError}
                  </div>
                )}

                {/* Action Buttons */}
                {editorMode === "manual" && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSaveEditor()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[image:var(--panel-accent-gradient)] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[var(--panel-accent)]/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {saving ? <FaRobot className="h-3 w-3 animate-pulse" /> : <FaSave className="h-3 w-3" />}
                      {selectedIndex === null ? "Savol qo'shish" : "Saqlash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedIndex === null) {
                          setDraftValue(activeGame.template);
                        } else {
                          setDraftValue(activeItems[selectedIndex]);
                        }
                        setEditorError("");
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-5 py-3 text-xs font-bold text-[var(--panel-text)] transition-all hover:border-[var(--panel-accent)] hover:shadow-md"
                    >
                      <FaCheck className="h-3 w-3" />
                      Qaytarish
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 flex items-center justify-center gap-1.5 text-[8px] text-[var(--panel-muted)]">
                  <span>Savollar</span>
                  <FaHeart className="text-[var(--panel-accent)] text-[8px] animate-pulse-soft" />
                  <span>bilan yaratilmoqda</span>
                </div>
                </>}
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-center">
                <div className="px-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--panel-accent-gradient-soft)]">
                    <FaEdit className="h-6 w-6 text-[var(--panel-accent)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--panel-text)]">Editor tayyor</p>
                  <p className="mt-3 text-xs text-[var(--panel-text-soft)] leading-relaxed max-w-xs mx-auto">
                    Savol qo'shish yoki tahrirlash uchun chapdan o'yinni tanlang.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
        </div>
        </div>
      </div>

      {deleteTargetIndex !== null && activeGame && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-question-title">
          <div className="w-full max-w-md rounded-2xl border border-rose-200/70 bg-[var(--panel-surface)] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <FaTrash className="h-4 w-4" />
            </div>
            <h2 id="delete-question-title" className="mt-4 text-lg font-bold text-[var(--panel-text)]">Savol o‘chirilsinmi?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--panel-text-soft)]">
              Bu amalni ortga qaytarib bo‘lmaydi. Savol <b>{activeGame.title}</b> ro‘yxatidan o‘chiriladi.
            </p>
            <p className="mt-3 truncate rounded-lg bg-[var(--panel-surface-strong)] px-3 py-2 text-xs font-medium text-[var(--panel-text)]">
              {summarizeQuestion(activeItems[deleteTargetIndex])}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTargetIndex(null)} disabled={saving} className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-2.5 text-sm font-bold text-[var(--panel-text)] transition hover:border-[var(--panel-accent)] disabled:opacity-50">
                Bekor qilish
              </button>
              <button type="button" onClick={() => void handleDelete(deleteTargetIndex)} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-700 disabled:opacity-50">
                <FaTrash className="h-3.5 w-3.5" />
                {saving ? "O‘chirilmoqda..." : "O‘chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
