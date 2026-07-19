import type { Question, QuestionDraft } from "./types";

export const SECONDS_PER_QUESTION = 18;
export const BASE_POINTS = 10;
export const STREAK_BONUS = 5;
export const QUIZ_BATTLE_GAME_KEY = "quiz_battle";
export const QUIZ_BATTLE_RESULT_KEY = "quiz-battle";

export const DEFAULT_QUESTIONS: Question[] = [
  { question: "8 + 7 nechaga teng?", options: ["13", "14", "15", "16"], answerIndex: 2, category: "Matematika", difficulty: "easy" },
  { question: "O'zbekiston poytaxti qaysi?", options: ["Buxoro", "Toshkent", "Samarqand", "Xiva"], answerIndex: 1, category: "Geografiya", difficulty: "easy" },
  { question: "Suv necha gradusda muzlaydi?", options: ["0°C", "10°C", "50°C", "100°C"], answerIndex: 0, category: "Tabiat", difficulty: "easy" },
  { question: "9 × 7 nechaga teng?", options: ["56", "63", "72", "81"], answerIndex: 1, category: "Matematika", difficulty: "medium" },
  { question: "Fotosintez qaysi organoidda kechadi?", options: ["Yadro", "Ribosoma", "Xloroplast", "Vakuola"], answerIndex: 2, category: "Biologiya", difficulty: "medium" },
  { question: "HTML nimani belgilaydi?", options: ["Sahifa tuzilishini", "Internet tezligini", "Rasm hajmini", "Parolni"], answerIndex: 0, category: "Informatika", difficulty: "medium" },
  { question: "3² + 4² nechaga teng?", options: ["12", "18", "25", "49"], answerIndex: 2, category: "Matematika", difficulty: "hard" },
  { question: "Fe qaysi element belgisi?", options: ["Ftor", "Temir", "Fosfor", "Kumush"], answerIndex: 1, category: "Kimyo", difficulty: "hard" },
  { question: "Yorug'lik vakuumda taxminan qanday tezlikda tarqaladi?", options: ["300 km/s", "3 000 km/s", "30 000 km/s", "300 000 km/s"], answerIndex: 3, category: "Fizika", difficulty: "hard" },
];

export const createEmptyDraft = (): QuestionDraft => ({
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
  category: "Umumiy",
});
