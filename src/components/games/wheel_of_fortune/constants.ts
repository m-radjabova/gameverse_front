import type { Question } from "./types";

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "O'zbekiston poytaxti qayer?",
    options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"],
    answerIndex: 2,
    points: 100,
    category: "Geografiya",
    timeLimit: 30,
    difficulty: "easy",
  },
  {
    id: "q2",
    question: "9 ning kvadrati nechiga teng?",
    options: ["72", "81", "99", "91"],
    answerIndex: 1,
    points: 80,
    category: "Matematika",
    timeLimit: 25,
    difficulty: "easy",
  },
  {
    id: "q3",
    question: "Eng katta okean qaysi?",
    options: ["Atlantika", "Tinch okeani", "Hind okeani", "Shimoliy muz"],
    answerIndex: 1,
    points: 120,
    category: "Geografiya",
    timeLimit: 35,
    difficulty: "medium",
  },
  {
    id: "q4",
    question: "Qaysi hayvon 'sahro kemasi' deb ataladi?",
    options: ["Ot", "Sigir", "Tuya", "Eshak"],
    answerIndex: 2,
    points: 90,
    category: "Biologiya",
    timeLimit: 30,
    difficulty: "medium",
  },
  {
    id: "q5",
    question: "20 + 35 - 12 = ?",
    options: ["43", "41", "45", "47"],
    answerIndex: 0,
    points: 70,
    category: "Matematika",
    timeLimit: 20,
    difficulty: "hard",
  },
  {
    id: "q6", question: "Yerning tabiiy yo'ldoshi qaysi?", options: ["Mars", "Oy", "Quyosh", "Venera"], answerIndex: 1, points: 90, category: "Astronomiya", timeLimit: 25, difficulty: "easy",
  },
  {
    id: "q7", question: "Bir yilda nechta oy bor?", options: ["10", "11", "12", "13"], answerIndex: 2, points: 70, category: "Umumiy bilim", timeLimit: 20, difficulty: "easy",
  },
  {
    id: "q8", question: "O'zbekiston bayrog'ida nechta yulduz bor?", options: ["10", "12", "14", "16"], answerIndex: 1, points: 100, category: "Tarix", timeLimit: 30, difficulty: "easy",
  },
  {
    id: "q9", question: "Suvning kimyoviy formulasi qaysi?", options: ["CO2", "O2", "H2O", "NaCl"], answerIndex: 2, points: 100, category: "Kimyo", timeLimit: 25, difficulty: "medium",
  },
  {
    id: "q10", question: "Amir Temur tavallud topgan shahar qaysi?", options: ["Samarqand", "Shahrisabz", "Buxoro", "Xiva"], answerIndex: 1, points: 120, category: "Tarix", timeLimit: 30, difficulty: "medium",
  },
  {
    id: "q11", question: "Fotosintez jarayonida o'simliklar qaysi gazni ajratadi?", options: ["Azot", "Kislorod", "Vodorod", "Karbonat angidrid"], answerIndex: 1, points: 110, category: "Biologiya", timeLimit: 30, difficulty: "medium",
  },
  {
    id: "q12", question: "144 sonining kvadrat ildizi nechaga teng?", options: ["10", "11", "12", "14"], answerIndex: 2, points: 100, category: "Matematika", timeLimit: 25, difficulty: "medium",
  },
  {
    id: "q13", question: "Yorug'lik vakuumda taxminan qanday tezlikda tarqaladi?", options: ["300 km/s", "3 000 km/s", "30 000 km/s", "300 000 km/s"], answerIndex: 3, points: 150, category: "Fizika", timeLimit: 35, difficulty: "hard",
  },
  {
    id: "q14", question: "Ikkilik sanoq tizimidagi 1010 soni o'nlikda nechaga teng?", options: ["8", "10", "12", "14"], answerIndex: 1, points: 140, category: "Informatika", timeLimit: 30, difficulty: "hard",
  },
  {
    id: "q15", question: "To'g'ri burchakli uchburchak katetlari 6 va 8 bo'lsa, gipotenuza nechaga teng?", options: ["9", "10", "12", "14"], answerIndex: 1, points: 160, category: "Matematika", timeLimit: 35, difficulty: "hard",
  },
  {
    id: "q16", question: "'Qutadg'u bilig' asari muallifi kim?", options: ["Alisher Navoiy", "Yusuf Xos Hojib", "Bobur", "Beruniy"], answerIndex: 1, points: 150, category: "Adabiyot", timeLimit: 35, difficulty: "hard",
  },
];

export const WHEEL_COLORS = [
  "#3b82f6",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#6366f1",
  "#06b6d4",
  "#84cc16",
  "#f59e0b",
  "#f43f5e",
  "#d946ef",
  "#8b5cf6",
  "#0ea5e9",
];

export const WHEEL_OF_FORTUNE_GAME_KEY = "wheel_of_fortune";
export const EMPTY_OPTIONS: [string, string, string, string] = ["", "", "", ""];
