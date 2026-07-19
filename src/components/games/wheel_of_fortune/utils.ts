import type { Question } from "./types";

export const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export const normalizeQuestions = (items: unknown[]): Question[] =>
  items
    .map((item, idx) => {
      const row = item as Partial<Question> & { answer?: string };
      const q = (row.question || "").toString().trim();
      if (!q) return null;

      const rawOptions = Array.isArray(row.options)
        ? row.options.map((v) => String(v).trim())
        : [];
      let options: [string, string, string, string];
      let answerIndex = Number.isInteger(row.answerIndex)
        ? Number(row.answerIndex)
        : 0;

      if (rawOptions.length >= 4) {
        options = [rawOptions[0], rawOptions[1], rawOptions[2], rawOptions[3]];
      } else {
        const answer = (row.answer || "").toString().trim();
        if (!answer) return null;
        options = [answer, "Variant B", "Variant C", "Variant D"];
        answerIndex = 0;
      }

      if (answerIndex < 0 || answerIndex > 3) answerIndex = 0;

      return {
        id: row.id || `q-import-${idx}`,
        question: q,
        options,
        answerIndex,
        points: Number(row.points) || 100,
        category: (row.category || "Umumiy").toString(),
        timeLimit: Number(row.timeLimit) || 30,
        difficulty: row.difficulty === "easy" || row.difficulty === "medium" || row.difficulty === "hard" ? row.difficulty : undefined,
      } as Question;
    })
    .filter((q): q is Question => q !== null);
