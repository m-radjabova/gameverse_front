import { useEffect, useMemo, useState } from "react";
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
import { GiCherry, GiFlowerTwirl, GiPlanetCore } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
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

const RAW_GAME_REGISTRY: GameRegistryItem[] = [
  {
    gameKey: "quiz_battle",
    title: "Quiz Battle",
    path: "/games/quiz-battle",
    emoji: "⚡",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { question: "", options: ["", "", "", ""], answerIndex: 0 },
    description: "Tezkor javoblar jangi",
  },
  {
    gameKey: "classic_arcade",
    title: "Classic Arcade",
    path: "/games/classic-arcade",
    emoji: "🧠",
    accent: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { prompt: "", options: ["", "", "", ""], correctIndex: 0, reason: "" },
    description: "Klassik bilim sinovi",
  },
  {
    gameKey: "wheel_of_fortune",
    title: "Wheel Of Fortune",
    path: "/games/wheel-of-fortune",
    emoji: "🎡",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { question: "", options: ["", "", "", ""], answerIndex: 0, category: "", points: 100 },
    description: "Omad va bilim",
  },
  {
    gameKey: "math_race",
    title: "Math Race",
    path: "/games/math-race",
    emoji: "🏎️",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { question: "", answer: 0, difficulty: "easy", points: 10 },
    description: "Matematik poyga",
  },
  {
    gameKey: "math_chick",
    title: "Math Chick",
    path: "/games/math-chick",
    emoji: "🐥",
    accent: "from-[#f59e0b] to-[#38bdf8]",
    bg: "bg-gradient-to-br from-[#f59e0b]/10 to-[#38bdf8]/10",
    template: { question: "", answer: 0, options: ["", "", "", ""], difficulty: "easy" },
    description: "Jo'jacha uchun matematik savollar",
  },
  {
    gameKey: "tug-of-war",
    title: "Tug Of War",
    path: "/games/tug-of-war",
    emoji: "🪢",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { prompt: "", answer: 0, level: "easy" },
    description: "Arqon tortish uchun matematik savollar",
  },
  {
    gameKey: "baamboozle",
    title: "Baamboozle",
    path: "/games/baamboozle",
    emoji: "🎲",
    accent: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { question: "", answer: "" },
    description: "Qiziqarli savol-javob",
  },
  {
    gameKey: "jumanji",
    title: "Jumanji",
    path: "/games/jumanji",
    emoji: "🌿",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { subject: "Matematika", question: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "easy", timeLimit: 30 },
    description: "Sarguzashtli o'quv o'yini",
  },
  {
    gameKey: "millionaire",
    title: "Millionaire",
    path: "/games/millionaire",
    emoji: "💰",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { text: "", options: { A: "", B: "", C: "", D: "" }, correct: "A", difficulty: "easy", category: "" },
    description: "Kim millioner bo'lishni xohlaydi?",
  },
  {
    gameKey: "truth_detector",
    title: "Truth Detector",
    path: "/games/truth-detector",
    emoji: "🕵️",
    accent: "from-[var(--panel-accent-strong)] to-[var(--panel-accent)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: {
      title: "Faktlar to'plami",
      difficulty: "easy",
      claims: [
        { id: "a-1", text: "", truth: true },
        { id: "b-1", text: "", truth: false },
        { id: "c-1", text: "", truth: true },
      ],
    },
    description: "Rostmi yoki yolg'on?",
  },
  {
    gameKey: "treasure_hunt",
    title: "Treasure Hunt",
    path: "/games/treasure-hunt",
    emoji: "🗺️",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { title: "", story: "", question: "", options: ["", "", "", ""], answerIndex: 0, hint: "", reward: 120 },
    description: "Xazina izlab",
  },
  {
    gameKey: "reverse_thinking",
    title: "Reverse Thinking",
    path: "/games/reverse-thinking",
    emoji: "🔄",
    accent: "from-[var(--panel-accent)] to-[var(--panel-accent-strong)]",
    bg: "bg-[image:var(--panel-accent-gradient-soft)]",
    template: { level: 1, question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
    description: "Teskari fikrlash",
  },
  {
    gameKey: "frog-pond",
    title: "Frog Pond",
    path: "/games/frog-pond",
    emoji: "🐸",
    accent: "from-emerald-400 to-sky-400",
    bg: "bg-gradient-to-br from-emerald-400/10 to-sky-400/10",
    template: { subject: "Matematika", question: "", options: ["", "", "", ""], answerIndex: 0, stage: 1 },
    description: "Nilufarlar bo'ylab savol-javob",
  },
];

const GAME_CARD_META = new Map(
  gameCards.map((card) => [card.id.replaceAll("-", "_"), { title: card.title, description: card.description }]),
);

const GAME_REGISTRY: GameRegistryItem[] = RAW_GAME_REGISTRY.map((game) => {
  const localizedMeta = GAME_CARD_META.get(game.gameKey.replaceAll("-", "_"));
  return {
    ...game,
    title: localizedMeta?.title ?? game.title,
    description: localizedMeta?.description ?? game.description,
  };
});

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
  "Ona tili",
  "Tarix",
  "Geografiya",
  "Biologiya",
  "Fizika",
  "Kimyo",
  "Aralash fanlar",
];

const AI_COUNT_OPTIONS = [1, 3, 5, 10, 15, 20] as const;

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

  if (gameKey === "tug-of-war") {
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

  if (gameKey === "frog-pond") {
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
        <span className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
          {icon}
          {label}
        </span>
        <div className="relative">
          <select
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 pr-10 text-sm text-[#7b4f53] outline-none transition-all duration-200 hover:border-[#e07c8e] focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
          >
            {options.map((option) => (
              <option key={String(option.value)} value={String(option.value)} className="bg-white text-[#7b4f53]">
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronRight className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-[#b38b8d]" />
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

  if (gameKey === "tug-of-war") {
    return {
      ...value,
      answer: Number(value.answer),
      level: String(value.level ?? "easy").trim().toLowerCase(),
    };
  }

  if (gameKey === "frog-pond") {
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
  onChange,
  onCorrectIndexChange,
}: {
  options: string[];
  path: Array<string | number>;
  selectedIndex?: number;
  onChange: (path: Array<string | number>, value: unknown) => void;
  onCorrectIndexChange?: (index: number) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-[#f0d9d6] bg-white/80 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
        <FaLayerGroup className="h-4 w-4 text-[#e07c8e]" />
        Variantlar
      </div>
      <div className="grid gap-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#f0d9d6] bg-white/90 p-3 transition-all duration-200 hover:border-[#e07c8e]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#e07c8e] to-[#a66466] text-xs font-bold text-white shadow-sm">
                {getOptionLetter(index)}
              </span>
              {typeof selectedIndex === "number" && onCorrectIndexChange && (
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#7b4f53]">
                  <input
                    type="radio"
                    checked={selectedIndex === index}
                    onChange={() => onCorrectIndexChange(index)}
                    className="h-3.5 w-3.5 accent-[#e07c8e]"
                  />
                  To'g'ri javob
                </label>
              )}
            </div>
            <input
              value={option}
              onChange={(event) => onChange([...path, index], event.target.value)}
              className="w-full rounded-lg border border-[#f0d9d6] bg-white/90 px-3 py-2 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_2px_rgba(224,124,142,0.1)]"
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
    <div className="space-y-4 rounded-xl border border-[#f0d9d6] bg-white/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
          <FaBrain className="h-4 w-4 text-[#e07c8e]" />
          3 ta fakt
        </div>
        <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[9px] font-medium text-rose-600">
          1 tasi yolg'on
        </div>
      </div>

      <div className="space-y-3">
        {claims.map((claim, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#f0d9d6] bg-white/90 p-3 transition-all duration-200 hover:border-[#e07c8e]"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[#7b4f53]">{index + 1}-fakt</span>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-[#7b4f53]">
                <input
                  type="radio"
                  name="fake-claim"
                  checked={fakeIndex === index}
                  onChange={() => {
                    claims.forEach((_, itemIndex) => {
                      onChange([...path, itemIndex, "truth"], itemIndex !== index);
                    });
                  }}
                  className="h-3.5 w-3.5 accent-rose-500"
                />
                Yolg'on
              </label>
            </div>
            <textarea
              value={String(claim?.text ?? "")}
              onChange={(event) => onChange([...path, index, "text"], event.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-[#f0d9d6] bg-white/90 px-3 py-2 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_2px_rgba(224,124,142,0.1)]"
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
    const selectedIndex =
      typeof value.answerIndex === "number"
        ? value.answerIndex
        : typeof value.correctIndex === "number"
          ? value.correctIndex
          : undefined;

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
        {"level" in value && (
          <FormField label="level" value={value.level} path={["level"]} onChange={onChange} icon={<FaCrown />} />
        )}
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
          options={(value.options as unknown[]).map((item) => String(item ?? ""))}
          path={["options"]}
          selectedIndex={selectedIndex}
          onChange={onChange}
          onCorrectIndexChange={
            typeof value.answerIndex === "number"
              ? (index) => onChange(["answerIndex"], index)
              : typeof value.correctIndex === "number"
                ? (index) => onChange(["correctIndex"], index)
                : undefined
          }
        />

        {"correctAnswer" in value && (
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
        <div className="space-y-3 rounded-xl border border-[#f0d9d6] bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
            <FaLayerGroup className="h-4 w-4 text-[#e07c8e]" />
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
          <span className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
            {icon}
            {title}
          </span>
          {isLong ? (
            <textarea
              value={value}
              onChange={(event) => onChange(path, event.target.value)}
              className="min-h-[100px] w-full rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none transition-all duration-200 focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
              placeholder={title}
            />
          ) : (
            <input
              value={value}
              onChange={(event) => onChange(path, event.target.value)}
              className="w-full rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none transition-all duration-200 focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
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
          <span className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
            {icon}
            {title}
          </span>
          <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            onChange={(event) => onChange(path, Number(event.target.value))}
            className="w-full rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none transition-all duration-200 focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
          />
        </label>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="group">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 transition-all duration-200 hover:border-[#e07c8e]">
          <span className="flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
            {icon}
            {title}
          </span>
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => onChange(path, event.target.checked)}
            className="h-4 w-4 rounded border-[#f0d9d6] accent-[#e07c8e]"
          />
        </label>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-3 rounded-xl border border-[#f0d9d6] bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
            {icon}
            {title}
          </span>
          <span className="rounded-full border border-[#f0d9d6] bg-white/90 px-2 py-0.5 text-[9px] font-medium text-[#b38b8d]">
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
      <div className="space-y-3 rounded-xl border border-[#f0d9d6] bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-[#8f6d70]">
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
    <div className="rounded-xl border border-dashed border-[#f0d9d6] bg-white/80 px-4 py-3 text-sm text-[#b38b8d]">
      {title}
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
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiCount, setAiCount] = useState<(typeof AI_COUNT_OPTIONS)[number]>(5);
  const [aiDifficulty, setAiDifficulty] = useState<GameDifficulty>("mixed");
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
  const activeItems = activeGame ? getQuestions(activeGame.gameKey) : [];
  const aiPanelContent = useMemo(() => getAiPanelContent(activeGame?.gameKey ?? ""), [activeGame?.gameKey]);
  const loading = activeGame ? Boolean(loadingByGame[activeGame.gameKey]) : false;
  const saving = activeGame ? Boolean(savingByGame[activeGame.gameKey]) : anySaving;

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

  const totalQuestions = useMemo(
    () => Object.values(questionsByGame).reduce((sum, items) => sum + items.length, 0),
    [questionsByGame],
  );

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
    const nextItem = withIdFallback(normalizeDraftForGame(activeGame.gameKey, draftValue));
    const nextItems = [...activeItems];

    if (selectedIndex === null) {
      nextItems.unshift(nextItem);
    } else {
      nextItems[selectedIndex] = nextItem;
    }

    const ok = await persistGameItems(activeGame.gameKey, nextItems);
    if (ok && selectedIndex === null) {
      setSelectedIndex(0);
    }
  }

  async function handleDelete(index: number) {
    if (!activeGame) return;
    const nextItems = activeItems.filter((_, itemIndex) => itemIndex !== index);
    const ok = await persistGameItems(activeGame.gameKey, nextItems);
    if (!ok) return;
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1);
    }
  }

  async function handleGenerateAi() {
    if (!activeGame) return;

    try {
      setIsGeneratingAi(true);
      setEditorError("");
      const generated = await generateTeacherPanelQuestions({
        gameKey: activeGame.gameKey as SupportedTeacherGameKey,
        topic: aiTopic,
        count: aiCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });

      const nextItems = [...generated.map((item) => withIdFallback(item)), ...activeItems];
      const ok = await persistGameItems(activeGame.gameKey, nextItems);
      if (!ok) return;

      setSelectedIndex(0);
      setDraftValue(withIdFallback(generated[0] ?? activeGame.template));
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
    void loadQuestions(gameKey, { teacherScoped: true });
  }

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="teacher-theme min-h-screen bg-[image:var(--panel-page-bg)] bg-[var(--panel-page-base)] px-4 py-8 sm:px-6 lg:px-8"
    >
      
      {/* Minimal Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[var(--home-blob-1)] blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[var(--home-blob-3)] blur-3xl animate-float-slow" />
        <GiCherry className="absolute left-[12%] top-[20%] text-6xl text-[var(--panel-accent)]/10 animate-petal-float" />
        <GiFlowerTwirl className="absolute right-[15%] top-[40%] text-7xl text-[var(--panel-accent-strong)]/10 animate-float-soft" />
        <GiPlanetCore className="absolute left-[20%] bottom-[15%] text-8xl text-[var(--panel-muted)]/10 animate-spin-slow" />
      </div>

      <div className="relative mx-auto max-w-8xl">
        
        {/* Header Section */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-surface)] backdrop-blur-xl p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-5 py-2.5 shadow-sm">
                <HiSparkles className="text-[var(--panel-accent)] text-sm animate-pulse-soft" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--panel-text-soft)]">
                  O'qituvchi Paneli
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                <span className="text-[var(--panel-text)]">Savollar Markazi</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[var(--panel-text-soft)]">
                Barcha o'yinlar uchun savollarni yarating, tahrirlang va boshqaring
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[var(--panel-muted)]">
                  <FaCrown className="h-3 w-3 text-[var(--panel-accent)]" />
                  O'yinlar
                </div>
                <div className="mt-1 text-2xl font-medium text-[var(--panel-text)]">
                  {GAME_REGISTRY.length}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[var(--panel-muted)]">
                  <FaGem className="h-3 w-3 text-[var(--panel-accent)]" />
                  Jami Savol
                </div>
                <div className="mt-1 text-2xl font-medium text-[var(--panel-text)]">
                  {totalQuestions}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[var(--panel-muted)]">
                  <FaRobot className="h-3 w-3 text-[var(--panel-accent)]" />
                  Holat
                </div>
                <div className={`mt-1 text-xs font-medium ${
                  saving ? "text-amber-600" : loading ? "text-blue-600" : "text-emerald-600"
                }`}>
                  {saving ? "Saqlanmoqda..." : loading ? "Yuklanmoqda..." : "Tayyor"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-6 overflow-hidden rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-5 shadow-xl backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--panel-muted)]">O'yinlar</p>
              <h2 className="mt-1 text-lg font-medium text-[var(--panel-text)]">Kerakli o'yinni tanlang</h2>
            </div>
          </div>

          <div className="teacher-games-scroll -mx-1 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3 px-1">
              {GAME_REGISTRY.map((game) => {
                const count = questionsByGame[game.gameKey]?.length ?? 0;
                const active = game.gameKey === activeGameKey;
                return (
                  <button
                    key={game.gameKey}
                    type="button"
                    onClick={() => handleSelectGame(game.gameKey)}
                    className={`group relative min-h-[168px] w-[220px] flex-shrink-0 overflow-hidden rounded-[28px] border p-4 text-left transition-all duration-300 ${
                      active
                        ? "border-[var(--panel-accent)] bg-[var(--panel-accent-gradient-soft)] shadow-[0_18px_40px_rgba(89,185,230,0.18)]"
                        : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:-translate-y-1 hover:border-[var(--panel-accent)]/50 hover:bg-[var(--panel-surface)]"
                    }`}
                  >
                    <div
                      className={`absolute inset-x-6 top-0 h-20 rounded-b-full bg-gradient-to-r ${game.accent} blur-2xl ${
                        active ? "opacity-20" : "opacity-10"
                      }`}
                    />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${game.accent} text-2xl text-white shadow-md`}>
                          {game.emoji}
                        </div>
                        <div className={`rounded-xl border px-2.5 py-1 text-center ${active ? "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)]" : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text-soft)]"}`}>
                          <div className="text-[8px] font-medium uppercase tracking-wider">Savol</div>
                          <div className="text-sm font-medium">{count}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex-1">
                        <h3 className="text-sm font-semibold text-[var(--panel-text)]">{game.title}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[var(--panel-text-soft)]">{game.description}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em] ${game.bg} border-[var(--panel-border)] text-[var(--panel-text)]`}>
                          {game.title}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${active ? "text-[var(--panel-accent)]" : "text-[var(--panel-muted)]"}`}>
                          Ochish
                          <FaChevronRight className={`h-2.5 w-2.5 transition-transform ${active ? "translate-x-0.5" : ""}`} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-5 shadow-xl backdrop-blur-xl sm:p-6">
            {activeGame ? (
              <>
                <div className="mb-6 rounded-[28px] border border-[var(--panel-border)] bg-[var(--panel-accent-gradient-soft)] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${activeGame.accent} text-2xl text-white shadow-md`}>
                        {activeGame.emoji}
                      </div>
                      <div>
                        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--panel-muted)]">Tanlangan o'yin</div>
                        <h2 className="mt-1 text-xl font-medium text-[var(--panel-text)]">{activeGame.title}</h2>
                        <p className="mt-1 text-xs text-[var(--panel-text-soft)]">
                          {activeItems.length} ta savol. Kerakli savolni chap ro'yxatdan tanlang, o'ng tomonda tahrir qiling.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="relative min-w-[220px] flex-1">
                        <FaSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b38b8d]" />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Savol qidiring..."
                          className="w-full rounded-xl border border-[#f0d9d6] bg-white/90 py-2.5 pl-9 pr-3 text-xs text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
                        />
                      </div>
                      <Link
                        to={activeGame.path}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-4 py-2.5 text-xs font-medium text-[var(--panel-text)] transition-all hover:border-[var(--panel-accent)] hover:bg-[var(--panel-surface)]"
                      >
                        O'yinga o'tish
                        <FaArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(null);
                      setEditorMode("manual");
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                      selectedIndex === null
                        ? "border-[var(--panel-accent)] bg-[var(--panel-accent-gradient)] text-white shadow-md"
                        : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text)] hover:border-[var(--panel-accent)]"
                    }`}
                  >
                    <FaPlus className="h-3 w-3" />
                    Yangi savol
                  </button>
                  <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-3 py-2 text-[11px] text-[var(--panel-text-soft)]">
                    {filteredItems.length} / {activeItems.length} ko'rsatilmoqda
                  </div>
                </div>

                <div className="space-y-3 pr-1">
                  {filteredItems.map(({ item, index: realIndex }) => {
                    const meta = extractMeta(item);
                    const selected = selectedIndex === realIndex;

                    return (
                      <button
                        key={typeof (item as { id?: unknown })?.id === "string" ? String((item as { id?: unknown }).id) : `${activeGame.gameKey}-${realIndex}`}
                        type="button"
                        onClick={() => {
                          setSelectedIndex(realIndex);
                          setEditorMode("manual");
                        }}
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? "border-[var(--panel-accent)] bg-[var(--panel-accent-gradient-soft)] shadow-md"
                            : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] hover:border-[var(--panel-accent)]/40 hover:bg-[var(--panel-surface)]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                              <span className="rounded-full border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] px-2 py-0.5 text-[8px] font-medium text-[var(--panel-muted)]">
                                #{realIndex + 1}
                              </span>
                              {meta.map((badge) => {
                                const color = DIFFICULTY_LABELS[badge] ? DIFFICULTY_COLORS?.[badge] : "from-gray-200 to-gray-300";
                                return (
                                  <span
                                    key={badge}
                                    className={`rounded-full border border-[var(--panel-border)] bg-gradient-to-r ${color}/10 px-2 py-0.5 text-[8px] font-medium text-[var(--panel-text)]`}
                                  >
                                    {DIFFICULTY_LABELS[badge] || badge}
                                  </span>
                                );
                              })}
                            </div>
                            <p className="text-sm font-medium leading-6 text-[var(--panel-text)]">{summarizeQuestion(item)}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-medium ${
                                selected
                                  ? "border-[var(--panel-accent)]/40 bg-[var(--panel-surface-strong)] text-[var(--panel-accent)]"
                                  : "border-[var(--panel-border)] bg-[var(--panel-surface-strong)] text-[var(--panel-text-soft)]"
                              }`}
                            >
                              <FaEdit className="h-2.5 w-2.5" />
                              {selected ? "Tahrirlanmoqda" : "Tanlash"}
                            </span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(realIndex);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[10px] font-medium text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
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
                    <div className="rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface-strong)] p-10 text-center">
                      <p className="text-sm font-medium text-[var(--panel-text)]">
                        {loadedByGame[activeGame.gameKey] ? "Savol topilmadi" : "Savollar hali yuklanmagan"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--panel-muted)]">
                        {loadedByGame[activeGame.gameKey]
                          ? "Qidiruvni o'zgartiring yoki yangi savol qo'shing."
                          : "O'yin tanlanganda savollar shu yerda chiqadi."}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-surface)] text-center">
                <div className="max-w-md">
                  <p className="text-lg font-medium text-[var(--panel-text)]">Avval tepada o'yinni tanlang</p>
                  <p className="mt-2 text-sm text-[var(--panel-muted)]">
                    O'yin ustiga bosilganda chap tomonda savollar, o'ng tomonda esa qo'shish va AI paneli ochiladi.
                  </p>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-surface)] p-5 shadow-xl backdrop-blur-xl sm:p-6 xl:sticky xl:top-6 xl:self-start">
            {activeGame ? (
              <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#b38b8d]">Savol boshqaruvi</div>
                <h3 className="mt-1 text-lg font-medium text-[#7b4f53]">
                  {editorMode === "manual"
                    ? selectedIndex === null
                      ? "Qo'lda qo'shish"
                      : `Savol #${selectedIndex + 1}`
                    : "Sun'iy intellekt bilan yaratish"}
                </h3>
              </div>
              <div className="rounded-full border border-[#f0d9d6] px-3 py-1.5 text-[10px] font-medium text-[#7b4f53]">
                {activeGame.title}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-[24px] border border-[#f0d9d6] bg-gradient-to-r from-[#fff8f6] via-white to-[#fff1ee] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <button
                type="button"
                onClick={() => setEditorMode("manual")}
                className={`inline-flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-3 text-center transition-all ${
                  editorMode === "manual"
                    ? "bg-gradient-to-br from-[#e07c8e] via-[#d67687] to-[#a66466] text-white shadow-[0_12px_24px_rgba(166,100,102,0.24)]"
                    : "text-[#8f6d70] hover:bg-white/90"
                }`}
              >
                <FaEdit className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">Qo'lda</span>
                <span className={`text-[9px] leading-3 ${editorMode === "manual" ? "text-white/80" : "text-[#b38b8d]"}`}>
                  O'zingiz kiritasiz
                </span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("ai")}
                className={`inline-flex flex-col items-center justify-center gap-1 rounded-[18px] px-3 py-3 text-center transition-all ${
                  editorMode === "ai"
                    ? "bg-gradient-to-br from-[#7b4f53] via-[#946163] to-[#c17b73] text-white shadow-[0_12px_24px_rgba(123,79,83,0.26)]"
                    : "text-[#8f6d70] hover:bg-white/90"
                }`}
              >
                <MdAutoAwesome className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">AI yaratish</span>
                <span className={`text-[9px] leading-3 ${editorMode === "ai" ? "text-white/80" : "text-[#b38b8d]"}`}>
                  Tez savol tayyorlaydi
                </span>
              </button>
            </div>

            {editorMode === "ai" ? (
              <div className="space-y-4 rounded-2xl border border-[#f0d9d6] bg-gradient-to-br from-[#fff7f5] via-white to-[#fff2ef] p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7b4f53] to-[#a66466] text-white shadow-md">
                    <MdAutoAwesome className={`h-4 w-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b38b8d]">AI yordamchisi</p>
                    <h4 className="mt-1 text-sm font-medium text-[#7b4f53]">{aiPanelContent.heading}</h4>
                    <p className="mt-1 text-[10px] leading-4 text-[#8f6d70]">{aiPanelContent.description}</p>
                  </div>
                </div>

                <label className="block space-y-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#8f6d70]">{aiPanelContent.topicLabel}</span>
                  <textarea
                    value={aiTopic}
                    onChange={(event) => setAiTopic(event.target.value)}
                    placeholder={aiPanelContent.topicPlaceholder}
                    rows={3}
                    className="w-full rounded-xl border border-[#f0d9d6] bg-white/90 px-4 py-3 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none transition-all duration-200 focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
                  />
                </label>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#8f6d70]">Sinf oralig'i</span>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADE_RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAiGradeRange(option.value)}
                          className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                            aiGradeRange === option.value
                              ? "bg-gradient-to-r from-[#e07c8e] to-[#a66466] text-white shadow-md"
                              : "border border-[#f0d9d6] bg-white/80 text-[#7b4f53] hover:border-[#e07c8e]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#8f6d70]">Savollar soni</span>
                      <div className="grid grid-cols-3 gap-2">
                        {AI_COUNT_OPTIONS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setAiCount(count)}
                            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                              aiCount === count
                                ? "bg-gradient-to-r from-[#e07c8e] to-[#a66466] text-white shadow-md"
                                : "border border-[#f0d9d6] bg-white/80 text-[#7b4f53] hover:border-[#e07c8e]"
                            }`}
                          >
                            {count} ta
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#8f6d70]">Qiyinlik</span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAiDifficulty(value as GameDifficulty)}
                            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                              aiDifficulty === value
                                ? "bg-gradient-to-r from-[#7b4f53] to-[#a66466] text-white shadow-md"
                                : "border border-[#f0d9d6] bg-white/80 text-[#7b4f53] hover:border-[#e07c8e]"
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7b4f53] to-[#a66466] px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <MdAutoAwesome className={`h-4 w-4 ${isGeneratingAi ? "animate-spin" : ""}`} />
                  {isGeneratingAi
                    ? aiPanelContent.loadingLabel.replace(aiCountPlaceholder, String(aiCount))
                    : aiPanelContent.buttonLabel.replace(aiCountPlaceholder, String(aiCount))}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-[#f0d9d6] bg-white/80 p-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#b38b8d]">Qo'lda kiritish</p>
                    <p className="mt-1 text-xs text-[#8f6d70]">
                      {selectedIndex === null ? "Yangi savolni qo'lda kiriting." : "Tanlangan savolni tahrir qiling."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(null);
                      setEditorError("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e07c8e]/30 bg-[#fceae8] px-3 py-1.5 text-[10px] font-medium text-[#e07c8e] transition-all hover:bg-[#e07c8e] hover:text-white"
                  >
                    <FaPlus className="h-2.5 w-2.5" />
                    Yangi
                  </button>
                </div>

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

                      <details open={showExtraFields} className="mt-3 rounded-xl border border-[#f0d9d6] bg-white/80 p-3">
                        <summary
                          className="flex cursor-pointer items-center justify-between text-xs font-medium text-[#7b4f53]"
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
                              "hint", "explanation", "reward", "points", "timeLimit", "answer",
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
                    <div className="rounded-xl border border-dashed border-[#f0d9d6] bg-white/80 px-4 py-6 text-center text-[10px] text-[#b38b8d]">
                      Bu format uchun forma mavjud emas
                    </div>
                  )}
                </div>
              </>
            )}

            {editorError && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-medium text-rose-600">
                {editorError}
              </div>
            )}

            {editorMode === "manual" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveEditor()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-4 py-2.5 text-xs font-medium text-white shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0d9d6] bg-white/80 px-4 py-2.5 text-xs font-medium text-[#7b4f53] transition-all hover:bg-white"
                >
                  <FaCheck className="h-3 w-3" />
                  Qaytarish
                </button>
              </div>
            )}

            {/* Made with love */}
            <div className="mt-4 flex items-center justify-center gap-1 text-[8px] text-[#b38b8d]">
              <span>Savollar</span>
              <FaHeart className="text-[#e07c8e] text-[8px] animate-pulse-soft" />
              <span>bilan yaratilmoqda</span>
            </div>
              </>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-[#f0d9d6] bg-white/60 text-center">
                <div>
                  <p className="text-sm font-medium text-[#7b4f53]">Editor tayyor</p>
                  <p className="mt-2 text-xs text-[#b38b8d]">
                    Savol qo'shish yoki tahrirlash uchun chapdan o'yinni tanlang.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
