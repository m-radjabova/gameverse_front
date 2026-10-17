import { DEFAULT_QUESTIONS as MATH_RACE_DEFAULTS } from "../components/games/math_race/constants";
import { QUESTION_BANK as MILLIONAIRE_DEFAULTS } from "../components/games/millionaire/data";
import { MORE_QUESTIONS as REVERSE_THINKING_DEFAULTS } from "../components/games/reverse_thinking/data";
import { TREASURE_RIDDLES as TREASURE_HUNT_DEFAULTS } from "../components/games/treasure_hunt/data/riddles";
import { SAMPLE_QUESTIONS as WHEEL_OF_FORTUNE_DEFAULTS } from "../components/games/wheel_of_fortune/constants";

const DEFAULT_QUESTIONS_BY_GAME: Record<string, readonly unknown[]> = {
  math_race: MATH_RACE_DEFAULTS,
  millionaire: MILLIONAIRE_DEFAULTS,
  reverse_thinking: REVERSE_THINKING_DEFAULTS,
  treasure_hunt: TREASURE_HUNT_DEFAULTS,
  wheel_of_fortune: WHEEL_OF_FORTUNE_DEFAULTS,
};

function questionSignature(value: unknown): string {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(normalize);
    if (!item || typeof item !== "object") return item;
    return Object.fromEntries(
      Object.entries(item as Record<string, unknown>)
        .filter(([key]) => key !== "id")
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([key, nested]) => [key, normalize(nested)]),
    );
  };
  return JSON.stringify(normalize(value)) ?? "";
}

export function filterBuiltInGameQuestions<T>(gameKey: string, questions: T[]): T[] {
  const builtInQuestions = DEFAULT_QUESTIONS_BY_GAME[gameKey];
  if (!builtInQuestions?.length) return questions;

  const builtInSignatures = new Set(builtInQuestions.map(questionSignature));
  return questions.filter((question) => !builtInSignatures.has(questionSignature(question)));
}
