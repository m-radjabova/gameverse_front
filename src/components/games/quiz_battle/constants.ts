import type { Question, QuestionDraft } from "./types";

export const SECONDS_PER_QUESTION = 18;
export const BASE_POINTS = 10;
export const STREAK_BONUS = 5;
export const QUIZ_BATTLE_GAME_KEY = "quiz_battle";
export const QUIZ_BATTLE_RESULT_KEY = "quiz-battle";

export const DEFAULT_QUESTIONS: Question[] = [
  // --- OSON (Easy) ---
  { 
    question: "8 + 7 nechaga teng?", 
    options: ["13", "14", "15", "16"], 
    answerIndex: 2, 
    category: "Matematika", 
    difficulty: "easy" 
  },
  { 
    question: "O'zbekiston poytaxti qaysi shahar?", 
    options: ["Buxoro", "Toshkent", "Samarqand", "Xiva"], 
    answerIndex: 1, 
    category: "Geografiya", 
    difficulty: "easy" 
  },
  { 
    question: "Suv necha gradusda muzlaydi?", 
    options: ["0°C", "10°C", "50°C", "100°C"], 
    answerIndex: 0, 
    category: "Tabiat", 
    difficulty: "easy" 
  },
  { 
    question: "Bir haftada jami necha kun bor?", 
    options: ["5", "6", "7", "8"], 
    answerIndex: 2, 
    category: "Mantiq", 
    difficulty: "easy" 
  },
  { 
    question: "'Apple' so'zining o'zbekcha tarjimasi nima?", 
    options: ["Banan", "Olma", "Nok", "Uzum"], 
    answerIndex: 1, 
    category: "Ingliz tili", 
    difficulty: "easy" 
  },
  { 
    question: "Inson tanasidagi eng katta tashqi a'zo qaysi?", 
    options: ["Yurak", "Jigar", "Teri", "O'pka"], 
    answerIndex: 2, 
    category: "Biologiya", 
    difficulty: "easy" 
  },
  { 
    question: "Shaxmat taxtasida jami nechta katak bor?", 
    options: ["32", "48", "64", "81"], 
    answerIndex: 2, 
    category: "Mantiq", 
    difficulty: "easy" 
  },

  // --- O'RTA (Medium) ---
  { 
    question: "9 × 7 nechaga teng?", 
    options: ["56", "63", "72", "81"], 
    answerIndex: 1, 
    category: "Matematika", 
    difficulty: "medium" 
  },
  { 
    question: "Fotosintez jarayoni asosan o'simlikning qaysi organoidida kechadi?", 
    options: ["Yadro", "Ribosoma", "Xloroplast", "Vakuola"], 
    answerIndex: 2, 
    category: "Biologiya", 
    difficulty: "medium" 
  },
  { 
    question: "HTML nima maqsadda xizmat qiladi?", 
    options: ["Veb-sahifa tuzilishini belgilash", "Internet tezligini o'lchash", "Kompyuterni virusdan tozalash", "Parollarni shifrlash"], 
    answerIndex: 0, 
    category: "Informatika", 
    difficulty: "medium" 
  },
  { 
    question: "Amir Temur asos solgan imperiya poytaxti qaysi shahar edi?", 
    options: ["Toshkent", "Samarqand", "Buxoro", "Xiva"], 
    answerIndex: 1, 
    category: "Tarix", 
    difficulty: "medium" 
  },
  { 
    question: "Quyosh sistemasidagi eng katta sayyora qaysi?", 
    options: ["Saturn", "Yupiter", "Neptun", "Mars"], 
    answerIndex: 1, 
    category: "Astronomiya", 
    difficulty: "medium" 
  },
  { 
    question: "O'zbekistonning eng uzun daryosi qaysi?", 
    options: ["Zarafshon", "Sirdaryo", "Amudaryo", "Chirchiq"], 
    answerIndex: 2, 
    category: "Geografiya", 
    difficulty: "medium" 
  },
  { 
    question: "1 Bayt necha bitdan iborat?", 
    options: ["2", "4", "8", "16"], 
    answerIndex: 2, 
    category: "Informatika", 
    difficulty: "medium" 
  },

  // --- QIYIN (Hard) ---
  { 
    question: "3² + 4² yig'indisi nechaga teng?", 
    options: ["12", "18", "25", "49"], 
    answerIndex: 2, 
    category: "Matematika", 
    difficulty: "hard" 
  },
  { 
    question: "'Fe' qaysi kimyoviy elementning belgisi?", 
    options: ["Ftor", "Temir", "Fosfor", "Kumush"], 
    answerIndex: 1, 
    category: "Kimyo", 
    difficulty: "hard" 
  },
  { 
    question: "Yorug'lik vakuumda taxminan qanday tezlikda tarqaladi?", 
    options: ["300 km/s", "3 000 km/s", "30 000 km/s", "300 000 km/s"], 
    answerIndex: 3, 
    category: "Fizika", 
    difficulty: "hard" 
  },
  { 
    question: "Idishdagi suv hajmi har kuni 2 barobar ortib boradi. Agar idish 30 kunda to'lsa, u necha kunda yarmigacha to'lgan bo'ladi?", 
    options: ["15 kunda", "29 kunda", "14 kunda", "25 kunda"], 
    answerIndex: 1, 
    category: "Mantiq", 
    difficulty: "hard" 
  },
  { 
    question: "Dunyodagi eng chuqur ko'l qaysi?", 
    options: ["Kaspiy dengizi", "Baykal ko'li", "Tityaka", "Superior"], 
    answerIndex: 1, 
    category: "Geografiya", 
    difficulty: "hard" 
  },
  { 
    question: "Ikkilik sanoq sistemasidagi 1010 soni o'nlik sanoq sistemasida nechaga teng?", 
    options: ["8", "10", "12", "14"], 
    answerIndex: 1, 
    category: "Informatika", 
    difficulty: "hard" 
  },
  { 
    question: "Qaysi sayyora o'z o'qi atrofida sharqdan g'arbga (teskari) aylanadi?", 
    options: ["Mars", "Venera (Zuhra)", "Saturn", "Uran"], 
    answerIndex: 1, 
    category: "Astronomiya", 
    difficulty: "hard" 
  }
];

export const createEmptyDraft = (): QuestionDraft => ({
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
  category: "Umumiy",
});
