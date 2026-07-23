import type { Question } from "./Millionaire";

export const QUESTION_BANK: Question[] = [
  // --- EASY (Osonroq, lekin qiziqarli mantiq va ingliz tili) ---
  {
    id: "e1",
    difficulty: "easy",
    category: "Vocabulary",
    text: "'Brave' so'zining ma'nosi qaysi?",
    options: { A: "Qo'rqoq", B: "Jasur", C: "Aqlli", D: "Dangasa" },
    correct: "B",
  },
  {
    id: "e2",
    difficulty: "easy",
    category: "Daily",
    text: "Ingliz tilida haftaning birinchi ish kuni qanday ataladi?",
    options: { A: "Sunday", B: "Monday", C: "Friday", D: "Saturday" },
    correct: "B",
  },
  {
    id: "e3",
    difficulty: "easy",
    category: "Grammar",
    text: "Qaysi olmosh birlik shaklda emas?",
    options: { A: "He", B: "She", C: "They", D: "It" },
    correct: "C",
  },
  {
    id: "e4",
    difficulty: "easy",
    category: "Colors & Nature",
    text: "Tabiatdagi barglarning yashil rangda bo'lishiga sabab nima?",
    options: { A: "Suv", B: "Xlorofill", C: "Kislorod", D: "Tuproq" },
    correct: "B",
  },
  {
    id: "e5",
    difficulty: "easy",
    category: "Numbers",
    text: "12 ning yarmi va 3 ning ko'paytmasi nechiga teng? (12 / 2 * 3)",
    options: { A: "18", B: "12", C: "24", D: "15" },
    correct: "A",
  },

  // --- MEDIUM (O'rtacha - fan, til va tarix) ---
  {
    id: "m1",
    difficulty: "medium",
    category: "Grammar",
    text: "Ifodani to'ldiring: 'Neither he nor I ___ going.'",
    options: { A: "is", B: "am", C: "are", D: "be" },
    correct: "B",
  },
  {
    id: "m2",
    difficulty: "medium",
    category: "Vocabulary",
    text: "'Transparent' so'zining sinonimi qaysi?",
    options: { A: "Xira", B: "Shaffof", C: "Qalin", D: "Og'ir" },
    correct: "B",
  },
  {
    id: "m3",
    difficulty: "medium",
    category: "Grammar",
    text: "Passiv turga o'giring: 'They clean the room every day.'",
    options: { 
      A: "The room is cleaned every day.", 
      B: "The room was cleaned every day.", 
      C: "The room cleaned every day.", 
      D: "The room has cleaned every day." 
    },
    correct: "A",
  },
  {
    id: "m4",
    difficulty: "medium",
    category: "History",
    text: "Buyuk ipak yo'lining asosiy chorrahasi bo'lgan ko'hna shahar?",
    options: { A: "Samarqand", B: "London", C: "Parij", D: "Rim" },
    correct: "A",
  },
  {
    id: "m5",
    difficulty: "medium",
    category: "Science",
    text: "Inson tanasidagi eng katta tashqi a'zo (organ) qaysi?",
    options: { A: "Jigar", B: "Yurak", C: "Teri", D: "O'pka" },
    correct: "C",
  },

  // --- HARD (Qiyinroq - grammatika va mantiq) ---
  {
    id: "h1",
    difficulty: "hard",
    category: "Grammar",
    text: "Uchinchi turdagi shartli gap (Third Conditional) qaysi javobda to'g'ri berilgan?",
    options: { 
      A: "If I see him, I will tell him.", 
      B: "If I saw him, I would tell him.", 
      C: "If I had seen him, I would have told him.", 
      D: "If I saw him, I had told him." 
    },
    correct: "C",
  },
  {
    id: "h2",
    difficulty: "hard",
    category: "Vocabulary",
    text: "'Ambiguous' so'zining ma'nosi nima?",
    options: { A: "Aniq va ravshan", B: "Ikki ma'noli / tushunarsiz", C: "Tezkor", D: "Foydali" },
    correct: "B",
  },
  {
    id: "h3",
    difficulty: "hard",
    category: "Reading / Logic",
    text: "'Despite' so'zidan keyin fe'l kelganda qaysi qo'shimcha olinadi?",
    options: { A: "To + verb", B: "Verb-ing", C: "Verb (V2)", D: "Have + V3" },
    correct: "B",
  },
  {
    id: "h4",
    difficulty: "hard",
    category: "Literature",
    text: "Alisher Navoiyning mashhur 'Xamsa' dostonlari tarkibiga kiruvchi birinchi doston?",
    options: { A: "Farhod va Shirin", B: "Leyli va Majnun", C: "Hayrat ul-abror", "D": "Saddi Iskandariy" },
    correct: "C",
  },
  {
    id: "h5",
    difficulty: "hard",
    category: "Science",
    text: "Quyosh sistemasidagi eng issiq sayyora qaysi?",
    options: { A: "Merkuriy", B: "Venera", C: "Mars", D: "Yupiter" },
    correct: "B",
  },

  // --- EXPERT (Juda qiyin, bilimdonlar uchun) ---
  {
    id: "x1",
    difficulty: "expert",
    category: "Advanced Grammar",
    text: "Inversiya qoidasi to'g'ri qo'llanilgan gapni toping:",
    options: { 
      A: "Never I have seen such a beautiful view.", 
      B: "Never have I seen such a beautiful view.", 
      C: "Have I never seen such a beautiful view.", 
      D: "I have never seen such a beautiful view." 
    },
    correct: "B",
  },
  {
    id: "x2",
    difficulty: "expert",
    category: "Vocabulary",
    text: "'Ephemeral' so'zining ma'nosi qaysi?",
    options: { A: "Abadiy", B: "O'tkinchi / qisqa muddatli", C: "Og'ir va mashaqqatli", D: "Sirli" },
    correct: "B",
  },
  {
    id: "x3",
    difficulty: "expert",
    category: "Philosophy & Logic",
    text: "'Men hech narsa bilmasligimni bilaman' iborasi qaysi antik faylasufga tegishli?",
    options: { A: "Sokrat", B: "Platon", C: "Aristotel", D: "Pifagor" },
    correct: "A",
  },
  {
    id: "x4",
    difficulty: "expert",
    category: "Mathematics / Physics",
    text: "Nyutonning ikkinchi qonuni formulasi qaysi?",
    options: { A: "E = mc^2", B: "F = ma", C: "P = UI", D: "a^2 + b^2 = c^2" },
    correct: "B",
  },
  {
    id: "x5",
    difficulty: "expert",
    category: "World History",
    text: "Ikkinchi jahon urushi yakunlangan rasmiy sana qaysi?",
    options: { A: "1945 yil 2 sentabr", B: "1945 yil 9 may", C: "1941 yil 22 iyun", D: "1944 yil 6 iyun" },
    correct: "A",
  },
];