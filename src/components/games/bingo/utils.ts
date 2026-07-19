import type { BingoCell, CellInputRow, CellType, Difficulty, ParseResult } from "./types";

export const EMPTY_INPUT_ROW: CellInputRow = {
  emoji: "",
  title: "",
  type: "quiz",
  prompt: "",
  optionA: "",
  optionB: "",
  optionC: "",
  correct: "",
};

export const LINES_4x4: number[][] = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

export function defaultCorrectByType(type: CellType): string {
  if (type === "quiz") return "A";
  if (type === "tf") return "true";
  return "";
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function randomDifficulties(): Difficulty[] {
  return shuffle([
    ...Array<Difficulty>(6).fill("easy"),
    ...Array<Difficulty>(6).fill("medium"),
    ...Array<Difficulty>(4).fill("hard"),
  ]);
}

export function basePointsByDifficulty(difficulty: Difficulty): number {
  if (difficulty === "easy") return 10;
  if (difficulty === "medium") return 20;
  return 30;
}

export function parseCards(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const errors: string[] = [];
  const cells: ParseResult["cells"] = [];

  lines.forEach((line, index) => {
    const row = index + 1;
    const parts = line.split("|").map((p) => p.trim());

    if (parts.length !== 8) {
      errors.push(`${row}-qator: format noto'g'ri. 8 ta qism bo'lishi shart (| bilan ajratilgan).`);
      return;
    }

    const [emoji, title, typeRaw, prompt, A, B, C, correctRaw] = parts;
    const type = typeRaw as CellType;

    if (!emoji) errors.push(`${row}-qator: emoji kiritilishi shart.`);
    if (!title) errors.push(`${row}-qator: sarlavha kiritilishi shart.`);
    if (!prompt) errors.push(`${row}-qator: prompt kiritilishi shart.`);
    if (!["quiz", "tf", "task"].includes(typeRaw)) {
      errors.push(`${row}-qator: tur faqat quiz, tf yoki task bo'lishi mumkin.`);
    }
    if (!emoji || !title || !prompt || !["quiz", "tf", "task"].includes(typeRaw)) return;

    if (type === "quiz") {
      if (!A || !B || !C) {
        errors.push(`${row}-qator: quiz uchun A, B, C variantlari to'liq bo'lishi shart.`);
        return;
      }
      if (!["A", "B", "C"].includes(correctRaw)) {
        errors.push(`${row}-qator: quiz uchun correct faqat A, B yoki C bo'lishi kerak.`);
        return;
      }
      cells.push({
        id: `cell-${row}`,
        emoji,
        title,
        type,
        prompt,
        options: { A, B, C },
        correct: correctRaw as "A" | "B" | "C",
      });
      return;
    }

    if (type === "tf") {
      const normalized = correctRaw.toLowerCase();
      if (!["true", "false"].includes(normalized)) {
        errors.push(`${row}-qator: tf uchun correct true yoki false bo'lishi kerak.`);
        return;
      }
      cells.push({ id: `cell-${row}`, emoji, title, type, prompt, correct: normalized === "true" });
      return;
    }

    cells.push({ id: `cell-${row}`, emoji, title, type, prompt });
  });

  return { cells, errors };
}

export function createEmptyRows(count = 16): CellInputRow[] {
  return Array.from({ length: count }, () => ({ ...EMPTY_INPUT_ROW }));
}

export function parseTextToRows(text: string, count = 16): CellInputRow[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rows = createEmptyRows(count);

  lines.slice(0, count).forEach((line, index) => {
    const parts = line.split("|").map((p) => p.trim());
    const [emoji = "", title = "", type = "quiz", prompt = "", A = "", B = "", C = "", correct = ""] = parts;
    const normalizedType = (["quiz", "tf", "task"].includes(type) ? type : "quiz") as CellType;
    rows[index] = {
      emoji,
      title,
      type: normalizedType,
      prompt,
      optionA: A,
      optionB: B,
      optionC: C,
      correct: correct || defaultCorrectByType(normalizedType),
    };
  });

  return rows;
}

export function rowsToText(rows: CellInputRow[]): string {
  return rows
    .map((row) =>
      [
        row.emoji.trim(),
        row.title.trim(),
        row.type,
        row.prompt.trim(),
        row.optionA.trim(),
        row.optionB.trim(),
        row.optionC.trim(),
        row.correct.trim(),
      ].join(" | "),
    )
    .join("\n");
}

export function withBonusesAndDifficulty(parsed: ParseResult["cells"], fixedDifficulty?: Difficulty): BingoCell[] {
  const difficulties = fixedDifficulty ? Array<Difficulty>(parsed.length).fill(fixedDifficulty) : randomDifficulties();
  const base: BingoCell[] = parsed.map((cell, index) => ({
    ...cell,
    id: `cell-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    found: false,
    foundBy: undefined,
    difficulty: difficulties[index],
    bonus: "none",
    wrong: false,
    lastMarkedAt: undefined,
  }));

  const indices = shuffle(base.map((_, i) => i));
  const doubleIndices = indices.slice(0, 2);
  const jokerIndex = indices[2];
  const swapIndex = indices[3];

  doubleIndices.forEach((i) => {
    base[i] = { ...base[i], bonus: "double" };
  });
  base[jokerIndex] = { ...base[jokerIndex], bonus: "joker" };
  base[swapIndex] = { ...base[swapIndex], bonus: "swap" };
  return base;
}
