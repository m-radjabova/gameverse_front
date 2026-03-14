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
import { fetchGameQuestions, saveGameQuestions } from "../../apiClient/gameQuestions";
import { GiCherry, GiFlowerTwirl, GiPlanetCore } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi";
import { MdAutoAwesome } from "react-icons/md";
import { generateTeacherPanelQuestions, type SupportedTeacherGameKey } from "./teacherQuestionPanelAi";
import type { GameDifficulty } from "../../apiClient/gemini";

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

const GAME_REGISTRY: GameRegistryItem[] = [
  {
    gameKey: "quiz_battle",
    title: "Quiz Battle",
    path: "/games/quiz-battle",
    emoji: "⚡",
    accent: "from-[#e07c8e] to-[#a66466]",
    bg: "bg-gradient-to-br from-[#e07c8e]/10 to-[#a66466]/10",
    template: { question: "", options: ["", "", "", ""], answerIndex: 0 },
    description: "Tezkor javoblar jangi",
  },
  {
    gameKey: "classic_arcade",
    title: "Classic Arcade",
    path: "/games/classic-arcade",
    emoji: "🧠",
    accent: "from-[#a66466] to-[#7b4f53]",
    bg: "bg-gradient-to-br from-[#a66466]/10 to-[#7b4f53]/10",
    template: { prompt: "", options: ["", "", "", ""], correctIndex: 0, reason: "" },
    description: "Klassik bilim sinovi",
  },
  {
    gameKey: "wheel_of_fortune",
    title: "Wheel Of Fortune",
    path: "/games/wheel-of-fortune",
    emoji: "🎡",
    accent: "from-[#8f6d70] to-[#6d4f52]",
    bg: "bg-gradient-to-br from-[#8f6d70]/10 to-[#6d4f52]/10",
    template: { question: "", options: ["", "", "", ""], answerIndex: 0, category: "", points: 100 },
    description: "Omad va bilim",
  },
  {
    gameKey: "math_race",
    title: "Math Race",
    path: "/games/math-race",
    emoji: "🏎️",
    accent: "from-[#e07c8e] to-[#a66466]",
    bg: "bg-gradient-to-br from-[#e07c8e]/10 to-[#a66466]/10",
    template: { question: "", answer: 0, difficulty: "easy", points: 10 },
    description: "Matematik poyga",
  },
  {
    gameKey: "baamboozle",
    title: "Baamboozle",
    path: "/games/baamboozle",
    emoji: "🎲",
    accent: "from-[#a66466] to-[#7b4f53]",
    bg: "bg-gradient-to-br from-[#a66466]/10 to-[#7b4f53]/10",
    template: { question: "", answer: "" },
    description: "Qiziqarli savol-javob",
  },
  {
    gameKey: "jumanji",
    title: "Jumanji",
    path: "/games/jumanji",
    emoji: "🌿",
    accent: "from-[#8f6d70] to-[#6d4f52]",
    bg: "bg-gradient-to-br from-[#8f6d70]/10 to-[#6d4f52]/10",
    template: { subject: "Matematika", question: "", options: ["", "", "", ""], correctAnswer: "", difficulty: "easy", timeLimit: 30 },
    description: "Sarguzashtli o'quv o'yini",
  },
  {
    gameKey: "millionaire",
    title: "Millionaire",
    path: "/games/millionaire",
    emoji: "💰",
    accent: "from-[#e07c8e] to-[#a66466]",
    bg: "bg-gradient-to-br from-[#e07c8e]/10 to-[#a66466]/10",
    template: { text: "", options: { A: "", B: "", C: "", D: "" }, correct: "A", difficulty: "easy", category: "" },
    description: "Kim millioner bo'lishni xohlaydi?",
  },
  {
    gameKey: "truth_detector",
    title: "Truth Detector",
    path: "/games/truth-detector",
    emoji: "🕵️",
    accent: "from-[#a66466] to-[#7b4f53]",
    bg: "bg-gradient-to-br from-[#a66466]/10 to-[#7b4f53]/10",
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
    accent: "from-[#8f6d70] to-[#6d4f52]",
    bg: "bg-gradient-to-br from-[#8f6d70]/10 to-[#6d4f52]/10",
    template: { title: "", story: "", question: "", options: ["", "", "", ""], answerIndex: 0, hint: "", reward: 120 },
    description: "Xazina izlab",
  },
  {
    gameKey: "reverse_thinking",
    title: "Reverse Thinking",
    path: "/games/reverse-thinking",
    emoji: "🔄",
    accent: "from-[#e07c8e] to-[#a66466]",
    bg: "bg-gradient-to-br from-[#e07c8e]/10 to-[#a66466]/10",
    template: { level: 1, question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" },
    description: "Teskari fikrlash",
  },
];

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
  hard: "from-rose-400 to-red-400",
  mixed: "from-purple-400 to-pink-400",
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
        {"id" in value && (
          <FormField label="id" value={value.id} path={["id"]} onChange={onChange} icon={<FaRobot />} />
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
        {"id" in value && (
          <FormField label="id" value={value.id} path={["id"]} onChange={onChange} icon={<FaRobot />} />
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
        {"id" in value && (
          <FormField label="id" value={value.id} path={["id"]} onChange={onChange} icon={<FaRobot />} />
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
  const [questionsByGame, setQuestionsByGame] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGameKey, setActiveGameKey] = useState(GAME_REGISTRY[0]?.gameKey ?? "");
  const [draftValue, setDraftValue] = useState<unknown>(GAME_REGISTRY[0]?.template ?? {});
  const [editorError, setEditorError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState<(typeof AI_COUNT_OPTIONS)[number]>(5);
  const [aiDifficulty, setAiDifficulty] = useState<GameDifficulty>("mixed");

  const activeGame = GAME_REGISTRY.find((game) => game.gameKey === activeGameKey) ?? GAME_REGISTRY[0];
  const activeItems = questionsByGame[activeGame?.gameKey ?? ""] ?? [];

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const entries = await Promise.all(
        GAME_REGISTRY.map(async (game) => {
          const items = await fetchGameQuestions<unknown>(game.gameKey);
          return [game.gameKey, items ?? []] as const;
        }),
      );

      if (!alive) return;
      setQuestionsByGame(Object.fromEntries(entries));
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!activeGame) return;
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
    setSaving(true);
    const ok = await saveGameQuestions(gameKey, nextItems);
    setSaving(false);
    if (!ok) {
      setEditorError("Saqlashda xato bo'ldi. Token yoki backendni tekshiring.");
      return false;
    }
    setQuestionsByGame((prev) => ({ ...prev, [gameKey]: nextItems }));
    setEditorError("");
    return true;
  }

  async function handleSaveEditor() {
    if (!activeGame) return;
    const nextItem = withIdFallback(draftValue);
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
      });

      const nextItems = [...generated.map((item) => withIdFallback(item)), ...activeItems];
      const ok = await persistGameItems(activeGame.gameKey, nextItems);
      if (!ok) return;

      setSelectedIndex(null);
      setDraftValue(withIdFallback(generated[0] ?? activeGame.template));
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "AI savol yaratishda xato bo'ldi.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df] px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Minimal Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[#f6d4da]/20 blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[#fbe5dd]/20 blur-3xl animate-float-slow" />
        <GiCherry className="absolute left-[12%] top-[20%] text-6xl text-[#e07c8e]/10 animate-petal-float" />
        <GiFlowerTwirl className="absolute right-[15%] top-[40%] text-7xl text-[#a66466]/10 animate-float-soft" />
        <GiPlanetCore className="absolute left-[20%] bottom-[15%] text-8xl text-[#7b4f53]/10 animate-spin-slow" />
      </div>

      <div className="relative mx-auto max-w-8xl">
        
        {/* Header Section */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-xl p-8 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 border border-[#f0d9d6] px-5 py-2.5 shadow-sm">
                <HiSparkles className="text-[#e07c8e] text-sm animate-pulse-soft" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a66466]">
                  O'qituvchi Paneli
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                <span className="text-[#7b4f53]">Savollar Markazi</span>
                
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[#8f6d70]">
                Barcha o'yinlar uchun savollarni yarating, tahrirlang va boshqaring
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#b38b8d]">
                  <FaCrown className="h-3 w-3 text-[#e07c8e]" />
                  O'yinlar
                </div>
                <div className="mt-1 text-2xl font-medium text-[#7b4f53]">
                  {GAME_REGISTRY.length}
                </div>
              </div>
              <div className="rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#b38b8d]">
                  <FaGem className="h-3 w-3 text-[#e07c8e]" />
                  Jami Savol
                </div>
                <div className="mt-1 text-2xl font-medium text-[#7b4f53]">
                  {totalQuestions}
                </div>
              </div>
              <div className="rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wider text-[#b38b8d]">
                  <FaRobot className="h-3 w-3 text-[#e07c8e]" />
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

        {/* Main Content Grid */}
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)_440px]">
          
          {/* Games Sidebar */}
          <aside className="space-y-2">
            {GAME_REGISTRY.map((game) => {
              const count = questionsByGame[game.gameKey]?.length ?? 0;
              const active = game.gameKey === activeGameKey;
              return (
                <button
                  key={game.gameKey}
                  type="button"
                  onClick={() => {
                    setActiveGameKey(game.gameKey);
                    setSelectedIndex(null);
                    setSearch("");
                  }}
                  className={`w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
                    active 
                      ? "border-[#e07c8e] bg-gradient-to-r from-[#fceae8] to-[#ffe1de] shadow-md" 
                      : "border-[#f0d9d6] bg-white/70 hover:bg-white/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${game.accent} text-2xl text-white shadow-md`}>
                        {game.emoji}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-[#7b4f53]">{game.title}</h3>
                        <p className="mt-0.5 text-[10px] text-[#b38b8d]">{game.description}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#f0d9d6] bg-white/90 px-2 py-1 text-center">
                      <div className="text-[8px] font-medium text-[#b38b8d]">Savol</div>
                      <div className="text-sm font-medium text-[#7b4f53]">{count}</div>
                    </div>
                  </div>
                  <div className={`mt-3 rounded-lg border px-2 py-1 text-[8px] font-medium uppercase tracking-wider ${game.bg} border-[#f0d9d6] text-[#7b4f53]`}>
                    {game.gameKey}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Questions List Section */}
          <section className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-xl p-6 shadow-xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#b38b8d]">Tanlangan O'yin</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${activeGame.accent} text-xl text-white shadow-md`}>
                    {activeGame.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-[#7b4f53]">{activeGame.title}</h2>
                    <p className="text-[10px] text-[#b38b8d]">{activeItems.length} ta savol</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#b38b8d]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Savol qidiring..."
                    className="w-full rounded-xl border border-[#f0d9d6] bg-white/80 py-2.5 pl-9 pr-3 text-xs text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
                  />
                </div>
                <Link
                  to={activeGame.path}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f0d9d6] bg-white/80 px-4 py-2.5 text-xs font-medium text-[#7b4f53] transition-all hover:bg-white hover:border-[#e07c8e]"
                >
                  O'yinga o'tish
                  <FaArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="space-y-2 pr-1 max-h-[600px] overflow-y-auto">
              {filteredItems.map(({ item, index: realIndex }) => {
                const meta = extractMeta(item);
                const selected = selectedIndex === realIndex;

                return (
                  <div
                    key={typeof (item as { id?: unknown })?.id === "string" ? String((item as { id?: unknown }).id) : `${activeGame.gameKey}-${realIndex}`}
                    className={`rounded-xl border p-3 transition-all duration-200 ${
                      selected 
                        ? "border-[#e07c8e] bg-gradient-to-r from-[#fceae8] to-[#ffe1de]" 
                        : "border-[#f0d9d6] bg-white/80 hover:bg-white/90"
                    }`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full border border-[#f0d9d6] bg-white/90 px-2 py-0.5 text-[8px] font-medium text-[#b38b8d]">
                            #{realIndex + 1}
                          </span>
                          {meta.map((badge) => {
                            const color = DIFFICULTY_LABELS[badge] ? DIFFICULTY_COLORS?.[badge] : "from-gray-200 to-gray-300";
                            return (
                              <span 
                                key={badge} 
                                className={`rounded-full border border-[#f0d9d6] bg-gradient-to-r ${color}/10 px-2 py-0.5 text-[8px] font-medium text-[#7b4f53]`}
                              >
                                {DIFFICULTY_LABELS[badge] || badge}
                              </span>
                            );
                          })}
                        </div>
                        <p className="text-xs font-medium leading-5 text-[#7b4f53]">
                          {summarizeQuestion(item)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedIndex(realIndex)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e07c8e]/30 bg-[#fceae8] px-3 py-1.5 text-[9px] font-medium text-[#e07c8e] transition-all hover:bg-[#e07c8e] hover:text-white"
                        >
                          <FaEdit className="h-2.5 w-2.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(realIndex)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[9px] font-medium text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
                        >
                          <FaTrash className="h-2.5 w-2.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loading && filteredItems.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#f0d9d6] bg-white/80 p-8 text-center">
                  <p className="text-xs text-[#b38b8d]">Bu o'yinda hozircha savol topilmadi.</p>
                </div>
              )}
            </div>
          </section>

          {/* Editor Section */}
          <aside className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-xl p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-[#b38b8d]">Savol Tahrirlash</div>
                <h3 className="mt-1 text-lg font-medium text-[#7b4f53]">
                  {selectedIndex === null ? "Yangi savol" : `Savol #${selectedIndex + 1}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e07c8e]/30 bg-[#fceae8] px-3 py-1.5 text-[9px] font-medium text-[#e07c8e] transition-all hover:bg-[#e07c8e] hover:text-white"
              >
                <FaPlus className="h-2.5 w-2.5" />
                Yangi
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-[#f0d9d6] bg-white/80 p-3 text-[10px] leading-5 text-[#b38b8d]">
              <MdAutoAwesome className="mb-1 h-3.5 w-3.5 text-[#e07c8e]" />
              Har bir o'yin uchun maxsus maydonlar avtomatik tarzda ko'rsatiladi
            </div>

            <div className="mb-4 rounded-lg border border-[#f0d9d6] bg-gradient-to-r from-[#fceae8] to-[#ffe1de] px-3 py-1.5 text-xs font-medium text-[#7b4f53]">
              {activeGame.gameKey}
            </div>

            <div className="mb-4 rounded-2xl border border-[#f0d9d6] bg-gradient-to-br from-[#fff7f5] to-white p-4 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e07c8e] to-[#a66466] text-white shadow-md">
                  <FaRobot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b38b8d]">AI Generator</p>
                  <h4 className="text-sm font-medium text-[#7b4f53]">Savollarni avtomatik yaratish</h4>
                  <p className="mt-1 text-[10px] leading-4 text-[#8f6d70]">
                    Mavzu, savollar soni va qiyinlikni tanlang. AI yangi savollarni shu o'yin ro'yxatiga qo'shadi.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block space-y-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#8f6d70]">Mavzu</span>
                  <input
                    value={aiTopic}
                    onChange={(event) => setAiTopic(event.target.value)}
                    placeholder="Masalan: kasrlar, geografiya, hayvonlar..."
                    className="w-full rounded-xl border border-[#f0d9d6] bg-white/90 px-4 py-3 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none transition-all duration-200 focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)]"
                  />
                </label>

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
                              ? "bg-gradient-to-r from-[#e07c8e] to-[#a66466] text-white shadow-md"
                              : "border border-[#f0d9d6] bg-white/80 text-[#7b4f53] hover:border-[#e07c8e]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
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
                  {isGeneratingAi ? `${aiCount} ta savol yaratilmoqda...` : `AI bilan ${aiCount} ta savol qo'shish`}
                </button>

                <p className="text-[10px] leading-4 text-[#8f6d70]">
                  "Aralash" tanlansa easy, medium va hard darajadagi savollar birga yaratiladi. AI ishlashi uchun `.env` ichida `VITE_GEMINI_API_KEY` bo'lishi kerak.
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {draftValue && typeof draftValue === "object" ? (
                <>
                  <SpecializedEditor
                    gameKey={activeGame.gameKey}
                    draftValue={draftValue}
                    onChange={(path, valueAtPath) => {
                      setDraftValue((prev) => updateValueAtPath(prev, path, valueAtPath));
                    }}
                  />
                  
                  <details className="mt-3 rounded-xl border border-[#f0d9d6] bg-white/80 p-3">
                    <summary 
                      className="flex cursor-pointer items-center justify-between text-xs font-medium text-[#7b4f53]"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowExtraFields(!showExtraFields);
                      }}
                    >
                      <span>Qo'shimcha maydonlar</span>
                      <FaChevronRight className={`h-2.5 w-2.5 transition-transform duration-200 ${showExtraFields ? 'rotate-90' : ''}`} />
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
                              setDraftValue((prev) => updateValueAtPath(prev, path, valueAtPath));
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

            {editorError && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-medium text-rose-600">
                {editorError}
              </div>
            )}

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
                Reset
              </button>
            </div>

            {/* Made with love */}
            <div className="mt-4 flex items-center justify-center gap-1 text-[8px] text-[#b38b8d]">
              <span>Savollar</span>
              <FaHeart className="text-[#e07c8e] text-[8px] animate-pulse-soft" />
              <span>bilan yaratilmoqda</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
