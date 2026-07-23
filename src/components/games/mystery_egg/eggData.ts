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
  { id: 25, subject: "Matematika", question: "50 ning yarmining yarmi nechaga teng?", options: ["10", "12.5", "25", "15"], answerIndex: 1 },
  { id: 26, subject: "Fizika", question: "Suv necha gradusda qaynaydi (normal bosimda)?", options: ["0 °C", "50 °C", "100 °C", "150 °C"], answerIndex: 2 },
  { id: 27, subject: "Tarix", question: "Alisher Navoiy tavallud topgan yil qaysi?", options: ["1441", "1336", "1483", "1500"], answerIndex: 0 },
  { id: 28, subject: "Geografiya", question: "Dunyodagi eng baland cho'qqi qaysi?", options: ["Kilimanjaro", "Elbrus", "Everest (Chomolungma)", "Mont-Blank"], answerIndex: 2 },
  { id: 29, subject: "Kimyo", question: "Havo tarkibida eng ko'p mavjud bo'lgan gaz qaysi?", options: ["Kislorod", "Azot", "Uglerod dioksid", "Vodorod"], answerIndex: 1 },
  { id: 30, subject: "Biologiya", question: "Inson tanasida nechta suyak bor (kattalarda)?", options: ["206", "180", "240", "300"], answerIndex: 0 },
  { id: 31, subject: "Informatika", question: "Qaysi biri operatsion tizim hisoblanadi?", options: ["Microsoft Word", "Google Chrome", "Linux", "Adobe Photoshop"], answerIndex: 2 },
  { id: 32, subject: "Astronomiya", question: "Qizil sayyora deb nomlanuvchi sayyora qaysi?", options: ["Venera", "Mars", "Saturn", "Merkuriy"], answerIndex: 1 },
  { id: 33, subject: "Ona tili", question: "O'zbek alifbosida nechta harf bor?", options: ["26", "28", "29", "33"], answerIndex: 2 },
  { id: 34, subject: "Mantiq", question: "Uchta olma bor edi, ikkitasini oldingiz. Sizda nechta olma bor?", options: ["1 ta", "2 ta", "3 ta", "Hech qancha"], answerIndex: 1 },
  { id: 35, subject: "Matematika", question: "To'g'ri burchak necha gradusga teng?", options: ["45°", "90°", "180°", "360°"], answerIndex: 1 },
  { id: 36, subject: "Fizika", question: "Tovush havodagiga qaraganda qaysi muhitda tezroq tarqaladi?", options: ["Suvda", "Vakuumda", "Fazoda", "G'ovak moddada"], answerIndex: 0 },
  { id: 37, subject: "Tarix", question: "Ikkinchi jahon urushi qaysi yillarda bo'lib o'tgan?", options: ["1914–1918", "1939–1945", "1941–1945", "1935–1940"], answerIndex: 1 },
  { id: 38, subject: "Geografiya", question: "Afrikadagi eng uzun daryo qaysi?", options: ["Amazonka", "Nil", "Missisipi", "Yangtse"], answerIndex: 1 },
  { id: 39, subject: "Kimyo", question: "Oltin elementining kimyoviy belgisi qaysi?", options: ["Ag", "Au", "Cu", "Fe"], answerIndex: 1 },
  { id: 40, subject: "Biologiya", question: "Vitamin C yetishmasligidan kelib chiqadigan kasallik nima?", options: ["Raxit", "Singa (skorbut)", "Kamqonlik", "Gripp"], answerIndex: 1 },
  { id: 41, subject: "Informatika", question: "1 Bayt necha Bitdan iborat?", options: ["4", "8", "16", "32"], answerIndex: 1 },
  { id: 42, subject: "Astronomiya", question: "Quyoshga eng yaqin turuvchi sayyora qaysi?", options: ["Venera", "Yer", "Merkuriy", "Mars"], answerIndex: 2 },
  { id: 43, subject: "Ona tili", question: "Qaysi so'z imlosi to'g'ri yozilgan?", options: ["Maktab", "Maktap", "Magtab", "Magtap"], answerIndex: 0 },
  { id: 44, subject: "Matematika", question: "Doiraning yuzini topish formulasi qaysi?", options: ["S = πr²", "S = 4πr", "S = a × b", "S = 2πr"], answerIndex: 0 },
  { id: 45, subject: "Mantiq", question: "Bir kishi shimolga 5 km, g'arbga 5 km yurdi. U qaysi tomonga qarab yurgan bo'lishi mumkin edi?", options: ["Faqat shimolga", "Har xil tomonga", "Boshlang'ich nuqtaga", "Aylana bo'ylab"], answerIndex: 1 },
  { id: 46, subject: "Tarix", question: "Qadimgi Misr piramidalari asosan nima uchun qurilgan?", options: ["Saroy sifatida", "Omborxona sifatida", "Fironlarning maqbarasi sifatida", "Rasadxona sifatida"], answerIndex: 2 },
  { id: 47, subject: "Geografiya", question: "Yevropadagi eng uzun daryo qaysi?", options: ["Dunay", "Volga", "Reyn", "Temza"], answerIndex: 1 },
  { id: 48, subject: "Fizika", question: "Oq rang nechta asosiy rangdan tashkil topgan (kamalak ranglari)?", options: ["5", "6", "7", "8"], answerIndex: 2 },
  { id: 49, subject: "Biologiya", question: "Qonning qizil rangda bo'lishini ta'minlovchi modda nima?", options: ["Plazma", "Gemoglobin", "Leykotsit", "Trombotsit"], answerIndex: 1 },
  { id: 50, subject: "Informatika", question: "Qaysi qurilma ma'lumotni qog'ozga chiqarish (chop etish) uchun ishlatiladi?", options: ["Skaner", "Printer", "Proyektor", "Karnay"], answerIndex: 1 },
  { id: 51, subject: "Matematika", question: "30 ning uchdan biri nechaga teng?", options: ["5", "10", "15", "20"], answerIndex: 1 },
  { id: 52, subject: "Fizika", question: "Tok kuchi qaysi birlikda o'lchanadi?", options: ["Volt", "Amper", "Ohm", "Vatt"], answerIndex: 1 },
  { id: 53, subject: "Kimyo", question: "Osh tuzining kimyoviy formulasi qaysi?", options: ["NaCl", "H₂SO₄", "NaOH", "HCl"], answerIndex: 0 },
  { id: 54, subject: "Biologiya", question: "Inson tanasidagi eng uzun suyak qaysi?", options: ["Yelka suyagi", "Son suyagi", "Boldir suyagi", "Bilak suyagi"], answerIndex: 1 },
  { id: 55, subject: "Tarix", question: "Temuriylar davrida yashagan buyuk astronom kim?", options: ["Al-Xorazmiy", "Mirzo Ulug'bek", "Abu Rayhon Beruniy", "Ibn Sino"], answerIndex: 1 },
  { id: 56, subject: "Geografiya", question: "Maydoni bo'yicha eng katta davlat qaysi?", options: ["Xitoy", "AQSh", "Rossiya", "Kanada"], answerIndex: 2 },
  { id: 57, subject: "Astronomiya", question: "Saturn sayyorasining asosi nimasi bilan mashhur?", options: ["Halqalari bilan", "Eng issiqligi bilan", "Yo'qotilganligi bilan", "Kichikligi bilan"], answerIndex: 0 },
  { id: 58, subject: "Informatika", question: "Internet tarmog'ining asosiy protokoli qaysi?", options: ["FTP", "HTTP / IP", "USB", "PDF"], answerIndex: 1 },
  { id: 59, subject: "Ona tili", question: "Fe'l turkumidagi so'zni toping?", options: ["Baland", "Yugurdi", "Qalam", "Oppoq"], answerIndex: 1 },
  { id: 60, subject: "Mantiq", question: "Moshinada 4 kishi ketayotgandi, yana 2 kishi chiqdi. Hammasi bo'lib nechta kishi bo'ldi?", options: ["4 kishi", "6 kishi", "8 kishi", "2 kishi"], answerIndex: 1 },
  { id: 61, subject: "Matematika", question: "1 dan 10 gacha bo'lgan sonlar yig'indisi nechaga teng?", options: ["45", "50", "55", "60"], answerIndex: 2 },
  { id: 62, subject: "Fizika", question: "Energiyaning o'lchov birligi nima?", options: ["Joul", "Nyuton", "Vatt", "Paskal"], answerIndex: 0 },
  { id: 63, subject: "Tarix", question: "Jaloliddin Manguberdi kimga qarshi kurashgan?", options: ["Mo'g'ullarga", "Arab xalifaligiga", "Rus knyazliklariga", "Rim imperiyasiga"], answerIndex: 0 },
  { id: 64, subject: "Geografiya", question: "Janubiy Amerikaning eng uzun daryosi?", options: ["Nil", "Amazonka", "Missisipi", "Dunay"], answerIndex: 1 },
  { id: 65, subject: "Kimyo", question: "Kislorodning kimyoviy belgisi nima?", options: ["C", "O", "N", "H"], answerIndex: 1 },
  { id: 66, subject: "Biologiya", question: "Asalari qaysi oilaga mansub hasharot?", options: ["Qanotlilar", "Ijtimoiy hasharotlar", "Zararkunandalar", "Parazitlar"], answerIndex: 1 },
  { id: 67, subject: "Astronomiya", question: "Yulduzlar nurlanishining asosiy manbai nima?", options: ["Yadro reaksiyalari", "Elektr toki", "Quyosh nuri qaytishi", "Issiqlik tarqalishi"], answerIndex: 0 },
  { id: 68, subject: "Informatika", question: "Fayl hajmini kichraytirish jarayoni qanday ataladi?", options: ["Arxivlash (siqish)", "Nusxalash", "O'chirish", "Formatlash"], answerIndex: 0 },
  { id: 69, subject: "Ona tili", question: "Antonim so'zlarni toping:", options: ["Issiq - Sovuq", "Katta - Katta", "Kitob - Daftar", "Tez - Tez"], answerIndex: 0 },
  { id: 70, subject: "Mantiq", question: "Bitta sham yonib turgandi, 2 tasi o'chdi. Qanchasi qoldi?", options: ["3 ta", "1 ta", "2 ta", "Hech qancha"], answerIndex: 1 },
  { id: 71, subject: "Matematika", question: "Kvadratning perimetri 20 sm bo'lsa, uning tomoni nechaga teng?", options: ["4 sm", "5 sm", "10 sm", "20 sm"], answerIndex: 1 },
  { id: 72, subject: "Fizika", question: "Bosimning o'lchov birligi nima?", options: ["Paskal", "Nyuton", "Vatt", "Joul"], answerIndex: 0 },
  { id: 73, subject: "Tarix", question: "Qadimgi Rim asos solingan shahar?", options: ["Afina", "Rim", "Parij", "Kohna Urganch"], answerIndex: 1 },
  { id: 74, subject: "Geografiya", question: "Osiyo va Yevropani ajratib turuvchi tog' tizmasi?", options: ["Alp tog'lari", "Ural tog'lari", " Himolay", "Kavkaz"], answerIndex: 1 },
  { id: 75, subject: "Kimyo", question: "Uglerod dioksid formulasi qaysi?", options: ["CO", "CO₂", "H₂O", "CH₄"], answerIndex: 1 },
  { id: 76, subject: "Biologiya", question: "Fotosintez jarayonida o'simlik qaysi gazni yutadi?", options: ["Kislorod", "Uglerod dioksid", "Azot", "Vodorod"], answerIndex: 1 },
  { id: 77, subject: "Astronomiya", question: "Yer o'z o'qi atrofida bir marta aylanishi uchun qancha vaqt ketadi?", options: ["1 yil", "1 oy", "24 soat", "1 hafta"], answerIndex: 2 },
  { id: 78, subject: "Informatika", question: "Keyboard (klaviatura) qanday qurilma?", options: ["Kiritish qurilmasi", "Chiqarish qurilmasi", "Saqlash qurilmasi", "Hisoblash qurilmasi"], answerIndex: 0 },
  { id: 79, subject: "Ona tili", question: "Sinonim so'zlarni toping:", options: ["Chiroyli - Go'zal", "Tez - Sekin", "Oq - Qora", "Katta - Kichik"], answerIndex: 0 },
  { id: 80, subject: "Mantiq", question: "Qaysi idishga suv quyib bo'lmaydi?", options: ["Stakanga", "Kosaga", "Chizilgan rasmga", "Chelakka"], answerIndex: 2 },
  { id: 81, subject: "Matematika", question: "8 ning kubi (8³) nechaga teng?", options: ["24", "64", "512", "128"], answerIndex: 2 },
  { id: 82, subject: "Fizika", question: "Mexanik ishning formulasi qaysi?", options: ["A = F × s", "F = m × g", "v = s / t", "p = F / S"], answerIndex: 0 },
  { id: 83, subject: "Tarix", question: "Qadimgi Xitoyda ixtiro qilingan to'rt buyuk kashfiyotga nima kirmaydi?", options: ["Kompas", "Qog'oz", "Telefon", "Porox"], answerIndex: 2 },
  { id: 84, subject: "Geografiya", question: "Avstraliya qit'asi qaysi yarimsharda joylashgan?", options: ["Shimoliy yarimsharda", "Janubiy yarimsharda", "Faqat g'arbiy yarimsharda", "Shimoliy va sharqiy"], answerIndex: 1 },
  { id: 85, subject: "Kimyo", question: "Eng yengil kimyoviy element qaysi?", options: ["Geliy", "Vodorod", "Kislorod", "Azot"], answerIndex: 1 },
  { id: 86, subject: "Biologiya", question: "Viruslar hujayrali tuzilishga egami?", options: ["Ha, ega", "Yo'q, huceyrasiz shakllar", "Faqat o'simlik viruslari ega", "Faqat hayvon viruslari ega"], answerIndex: 1 },
  { id: 87, subject: "Astronomiya", question: "Koinotga uchgan ilk kosmonavt kim?", options: ["Neil Armstrong", "Yuri Gagarin", "Valter Shirra", "Vladimir Jonibekov"], answerIndex: 1 },
  { id: 88, subject: "Informatika", question: "Qaysi fayl formati matnli hujjatga tegishli?", options: [".mp3", ".jpg", ".docx", ".mp4"], answerIndex: 2 },
  { id: 89, subject: "Ona tili", question: "Ega va kesim birgalikda nima deb ataladi?", options: ["Gap bo'laklari", "So'z birikmasi", "Grammatik asos", "Uyushiq bo'lak"], answerIndex: 2 },
  { id: 90, subject: "Mantiq", question: "Daraxtda 5 ta qush o'tirgandi, ovchi bittasini otib tushirdi. Daraxtda nechta qush qoldi?", options: ["4 ta", "1 ta", "Hech qancha", "2 ta"], answerIndex: 2 },
  { id: 91, subject: "Matematika", question: "Uchburchak burchaklari yig'indisi nechaga teng?", options: ["90°", "180°", "270°", "360°"], answerIndex: 1 },
  { id: 92, subject: "Fizika", question: "Jismning massasi qanday asbobda o'lchanadi?", options: ["Termometr", "Tarozi", "Dinamometr", "Barometr"], answerIndex: 1 },
  { id: 93, subject: "Tarix", question: "Zahiriddin Muhammad Bobur asos solgan sulola?", options: ["Temuriylar", "Boburiylar", "Shayboniylar", "Safaviylar"], answerIndex: 1 },
  { id: 94, subject: "Geografiya", question: "Dunyo bo'yicha eng yirik cho'l qaysi?", options: ["Qoraqum", "Sahara", "Gobi", "Kalaaxari"], answerIndex: 1 },
  { id: 95, subject: "Kimyo", question: "Simob (Hg) oddiy sharoitda qaysi holatda bo'ladi?", options: ["Qattiq", "Suyuq", "Gazsimon", "Plazma"], answerIndex: 1 },
  { id: 96, subject: "Biologiya", question: "Odam organizmida qon aylanish sistemasi nechta doiradan iborat?", options: ["1 ta", "2 ta", "3 ta", "4 ta"], answerIndex: 1 },
  { id: 97, subject: "Astronomiya", question: "Oydagi birinchi bo'lib qadam qo'ygan inson kim?", options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "Alexey Leonov"], answerIndex: 1 },
  { id: 98, subject: "Informatika", question: "Monitor qanday qurilma turi hisoblanadi?", options: ["Kiritish", "Chiqarish", "Saqlash", "Boshqarish"], answerIndex: 1 },
  { id: 99, subject: "Ona tili", question: "Qaysi so'z ot turkumiga kiradi?", options: ["Yugurmoq", "Chiroyli", "Maktab", "Tez"], answerIndex: 2 },
  { id: 100, subject: "Mantiq", question: "Bir haftada nechta kun bor va ulardan nechta kun 'S' harfi bilan boshlanadi?", options: ["7 kun, 1 ta", "7 kun, 2 ta", "7 kun, 3 ta", "5 kun, 2 ta"], answerIndex: 2 }
];

export function getQuestionsForLevel(levelId: number) {
  // Har bir daraja uchun savollarni o'ziga xos tarzda siljitish va aralashtirish
  const questions = [...defaultEggQuestions];
  // levelId ga qarab elementlarni aylantiramiz (rotate)
  const shift = (levelId * 17) % questions.length;
  const rotated = [...questions.slice(shift), ...questions.slice(0, shift)];
  
  // Qo'shimcha ravishda levelId ga bog'liq holda deterministik tarzda tartibni biroz o'zgartiramiz
  return rotated.sort((a, b) => {
    const hashA = (a.id * levelId * 31) % 100;
    const hashB = (b.id * levelId * 31) % 100;
    return hashA - hashB;
  });
}

export function getEggImage(level: EggLevel, progress: number) {
  if (progress >= 100) return level.images.hatched ?? level.images.base;
  if (progress >= 80) return level.images.crack4 ?? level.images.base;
  if (progress >= 60) return level.images.crack3 ?? level.images.base;
  if (progress >= 40) return level.images.crack2 ?? level.images.base;
  if (progress >= 20) return level.images.crack1 ?? level.images.base;
  return level.images.base;
}
