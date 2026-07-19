import type { EggLevel, EggQuestion } from "./types";

const eggAssets = import.meta.glob("./images_eggs/**/*.png", { eager: true, import: "default" }) as Record<string, string>;

function asset(slug: string, stage: "egg" | "crack1" | "crack2" | "crack3" | "crack4" | "finish-egg") {
  const marker = `/${slug}/${slug}-${stage}`;
  return Object.entries(eggAssets).find(([path]) => path.includes(marker))?.[1] ?? "";
}

function images(slug: string) {
  return { base: asset(slug, "egg"), crack1: asset(slug, "crack1"), crack2: asset(slug, "crack2"), crack3: asset(slug, "crack3"), crack4: asset(slug, "crack4"), hatched: asset(slug, "finish-egg") };
}

export const eggLevels: EggLevel[] = [
  { id: 1, slug: "forest", name: "Forest Egg", subtitle: "Sehrli o'rmon", requiredCorrectAnswers: 10, difficulty: "Oson", unlockedByDefault: true, color: "#75e342", glow: "rgba(117,227,66,.42)", images: images("forest") },
  { id: 2, slug: "ocean", name: "Ocean Egg", subtitle: "Moviy qa'r", requiredCorrectAnswers: 15, difficulty: "O'rta", unlockedByDefault: false, color: "#38c7ff", glow: "rgba(56,199,255,.42)", images: images("ocean") },
  { id: 3, slug: "volcano", name: "Volcano Egg", subtitle: "Olovli cho'qqi", requiredCorrectAnswers: 25, difficulty: "O'rta", unlockedByDefault: false, color: "#ff6a35", glow: "rgba(255,91,45,.44)", images: images("volcano") },
  { id: 4, slug: "ice", name: "Ice Egg", subtitle: "Muz saroyi", requiredCorrectAnswers: 30, difficulty: "Qiyin", unlockedByDefault: false, color: "#8be7ff", glow: "rgba(100,210,255,.45)", images: images("ice") },
  { id: 5, slug: "thunder", name: "Thunder Egg", subtitle: "Chaqmoq vodiysi", requiredCorrectAnswers: 35, difficulty: "Qiyin", unlockedByDefault: false, color: "#ffd448", glow: "rgba(255,206,55,.45)", images: images("thunder") },
  { id: 6, slug: "sakura", name: "Sakura Egg", subtitle: "Gullar bog'i", requiredCorrectAnswers: 40, difficulty: "Qiyin", unlockedByDefault: false, color: "#ff7fc8", glow: "rgba(255,127,200,.42)", images: images("sakura") },
  { id: 7, slug: "galaxy", name: "Galaxy Egg", subtitle: "Sirli koinot", requiredCorrectAnswers: 50, difficulty: "Ekspert", unlockedByDefault: false, color: "#b471ff", glow: "rgba(180,113,255,.45)", images: images("galaxy") },
  { id: 8, slug: "royal", name: "Royal Egg", subtitle: "Qirollik siri", requiredCorrectAnswers: 60, difficulty: "Ekspert", unlockedByDefault: false, color: "#ffc94c", glow: "rgba(255,201,76,.44)", images: images("royal") },
  { id: 9, slug: "rainbow", name: "Rainbow Egg", subtitle: "Afsonaviy final", requiredCorrectAnswers: 70, difficulty: "Ekspert", unlockedByDefault: false, color: "#67e8f9", glow: "rgba(103,232,249,.44)", images: images("rainbow") },
];

export const defaultEggQuestions: EggQuestion[] = [
  { id: 1, subject: "Matematika", question: "7 × 8 nechaga teng?", options: ["54", "56", "64", "72"], answerIndex: 1 },
  { id: 2, subject: "Biologiya", question: "O'simliklar oziq modda hosil qiladigan jarayon nima?", options: ["Bug'lanish", "Fotosintez", "Eroziya", "Muzlash"], answerIndex: 1 },
  { id: 3, subject: "Geografiya", question: "Dunyodagi eng katta okean qaysi?", options: ["Atlantika", "Hind", "Tinch", "Shimoliy Muz"], answerIndex: 2 },
  { id: 4, subject: "Ona tili", question: "Qaysi so'z sifat turkumiga kiradi?", options: ["Chiroyli", "Yugurmoq", "Kitob", "Sekin"], answerIndex: 0 },
  { id: 5, subject: "Fizika", question: "Kuchning o'lchov birligi nima?", options: ["Vatt", "Paskal", "Nyuton", "Joul"], answerIndex: 2 },
  { id: 6, subject: "Tarix", question: "Amir Temur saltanatining poytaxti qaysi shahar bo'lgan?", options: ["Buxoro", "Samarqand", "Xiva", "Toshkent"], answerIndex: 1 },
  { id: 7, subject: "Matematika", question: "144 ning kvadrat ildizi nechaga teng?", options: ["10", "11", "12", "14"], answerIndex: 2 },
  { id: 8, subject: "Informatika", question: "Kompyuterning 'miyasi' deb qaysi qism ataladi?", options: ["Monitor", "Protsessor", "Klaviatura", "Printer"], answerIndex: 1 },
  { id: 9, subject: "Kimyo", question: "Suvning kimyoviy formulasi qaysi?", options: ["CO₂", "O₂", "NaCl", "H₂O"], answerIndex: 3 },
  { id: 10, subject: "Astronomiya", question: "Quyosh tizimidagi eng katta sayyora qaysi?", options: ["Yer", "Mars", "Yupiter", "Saturn"], answerIndex: 2 },
  { id: 11, subject: "Mantiq", question: "2, 4, 8, 16 ketma-ketligida keyingi son qaysi?", options: ["20", "24", "30", "32"], answerIndex: 3 },
  { id: 12, subject: "Geografiya", question: "O'zbekiston poytaxti qaysi shahar?", options: ["Samarqand", "Toshkent", "Buxoro", "Nukus"], answerIndex: 1 },
  { id: 13, subject: "Matematika", question: "15 ning 20 foizi nechaga teng?", options: ["2", "3", "4", "5"], answerIndex: 1 },
  { id: 14, subject: "Biologiya", question: "Inson tanasidagi eng katta a'zo qaysi?", options: ["Yurak", "Jigar", "Teri", "O'pka"], answerIndex: 2 },
  { id: 15, subject: "Fizika", question: "Yorug'lik vakuumda taxminan qanday tezlikda tarqaladi?", options: ["300 km/s", "300 000 km/s", "30 000 km/s", "3 000 km/s"], answerIndex: 1 },
  { id: 16, subject: "Kimyo", question: "Davriy jadvaldagi Fe belgisi qaysi elementniki?", options: ["Ftor", "Temir", "Kumush", "Fosfor"], answerIndex: 1 },
  { id: 17, subject: "Tarix", question: "Buyuk ipak yo'li asosan qaysi hududlarni bog'lagan?", options: ["Osiyo va Yevropa", "Afrika va Amerika", "Avstraliya va Osiyo", "Faqat Yevropa"], answerIndex: 0 },
  { id: 18, subject: "Astronomiya", question: "Yerning tabiiy yo'ldoshi nima?", options: ["Mars", "Quyosh", "Oy", "Venera"], answerIndex: 2 },
  { id: 19, subject: "Informatika", question: "HTML asosan nima uchun ishlatiladi?", options: ["Veb sahifa tuzilishi", "Rasm chizish", "Audio yozish", "Fayl siqish"], answerIndex: 0 },
  { id: 20, subject: "Mantiq", question: "Barcha atirgullar gul. Qaysi fikr aniq to'g'ri?", options: ["Barcha gullar atirgul", "Atirgul — gul", "Hech bir gul qizil emas", "Barcha atirgullar qizil"], answerIndex: 1 },
  { id: 21, subject: "Geografiya", question: "Ekvator Yer sharini qanday qismlarga ajratadi?", options: ["Sharq va g'arb", "Shimol va janub", "Quruqlik va suv", "Tog' va tekislik"], answerIndex: 1 },
  { id: 22, subject: "Matematika", question: "3² + 4² nechaga teng?", options: ["12", "18", "25", "49"], answerIndex: 2 },
  { id: 23, subject: "Ona tili", question: "Qaysi gapda undalma bor?", options: ["Men maktabga bordim.", "Do'stim, bu yoqqa kel!", "Havo bugun iliq.", "Kitob stol ustida."], answerIndex: 1 },
  { id: 24, subject: "Biologiya", question: "DNKning asosiy vazifasi nima?", options: ["Energiya ishlab chiqarish", "Irsiy axborotni saqlash", "Qonni aylantirish", "Ovqatni hazm qilish"], answerIndex: 1 },
];

export function getQuestionsForLevel(levelId: number) {
  const offset = ((levelId - 1) * 3) % defaultEggQuestions.length;
  return [...defaultEggQuestions.slice(offset), ...defaultEggQuestions.slice(0, offset)];
}

export function getEggImage(level: EggLevel, progress: number) {
  if (progress >= 100) return level.images.hatched ?? level.images.base;
  if (progress >= 80) return level.images.crack4 ?? level.images.base;
  if (progress >= 60) return level.images.crack3 ?? level.images.base;
  if (progress >= 40) return level.images.crack2 ?? level.images.base;
  if (progress >= 20) return level.images.crack1 ?? level.images.base;
  return level.images.base;
}
