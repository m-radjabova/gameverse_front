export type Difficulty = "easy" | "medium" | "hard";
export type BonusType = "none" | "double" | "joker" | "swap";
export type CellType = "quiz" | "tf" | "task";

export type BingoCell = {
  id: string;
  emoji: string;
  title: string;
  type: CellType;
  prompt: string;
  options?: { A: string; B: string; C: string };
  correct?: "A" | "B" | "C" | boolean;
  found: boolean;
  foundBy?: string;
  difficulty: Difficulty;
  bonus: BonusType;
  wrong: boolean;
  lastMarkedAt?: number;
};

export type Student = {
  id: string;
  name: string;
  points: number;
  foundCount: number;
};

export type ParseResult = {
  cells: Omit<
    BingoCell,
    "found" | "foundBy" | "difficulty" | "bonus" | "wrong" | "lastMarkedAt"
  >[];
  errors: string[];
};

export type CellInputRow = {
  emoji: string;
  title: string;
  type: CellType;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correct: string;
  difficulty?: Difficulty;
};
