import type { GameQuestionDifficulty } from "../hooks/gameSession";

const DIFFICULTY_ALIASES: Record<string, GameQuestionDifficulty> = {
  easy: "easy",
  oson: "easy",
  medium: "medium",
  middle: "medium",
  orta: "medium",
  "o'rta": "medium",
  hard: "hard",
  qiyin: "hard",
  expert: "hard",
  chef: "hard",
};

function explicitDifficulty(item: unknown): GameQuestionDifficulty | null {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  const raw = String(value.difficulty ?? value.level ?? "").trim().toLowerCase();
  if (DIFFICULTY_ALIASES[raw]) return DIFFICULTY_ALIASES[raw];

  const numericLevel = Number(value.stage ?? value.level);
  if (Number.isFinite(numericLevel)) {
    if (numericLevel <= 1) return "easy";
    if (numericLevel <= 3) return "medium";
    return "hard";
  }
  return null;
}

/**
 * Savol formatlari o'yinlarda turlicha. Daraja maydoni bor savollar aynan shu
 * maydon bo'yicha, eski savollar esa bankdagi tartibiga ko'ra uch teng guruhga
 * ajratiladi. Shu bilan eski teacher savollari ham migratsiyasiz ishlayveradi.
 */
export function filterGameQuestionsByDifficulty<T>(
  questions: T[],
  difficulty: GameQuestionDifficulty,
): T[] {
  if (questions.length === 0) return [];

  const tagged = questions.filter((item) => explicitDifficulty(item) === difficulty);
  if (tagged.length > 0) return tagged;

  const untagged = questions.filter((item) => explicitDifficulty(item) === null);
  if (untagged.length === 0) return questions;
  if (untagged.length < 3) return untagged;

  const start = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
  const sliced = untagged.filter((_, index) => index % 3 === start);
  return sliced.length > 0 ? sliced : untagged;
}
