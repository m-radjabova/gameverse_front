export const SAMPLE_16_LINES = [
  "🪐 | Sayyora | quiz | Quyoshga eng yaqin sayyora qaysi? | Merkuriy | Mars | Yupiter | A",
  "💧 | Ilm | tf | Suv normal bosimda 100°C da qaynaydi. |  |  |  | true",
  "💃 | Challenge | task | 5 soniyada 3 ta hayvon nomini ayting! |  |  |  |",
  "📚 | Adabiyot | quiz | \"O'tkan kunlar\" asari muallifi kim? | Abdulla Qodiriy | Cho'lpon | Erkin Vohidov | A",
  "🧠 | Mantiq | quiz | 2, 4, 8, 16 dan keyingi son qaysi? | 18 | 32 | 24 | B",
  "🌍 | Geografiya | tf | Afrika dunyodagi eng katta qit'adir. |  |  |  | false",
  "🎤 | Nutq | task | 10 soniyada mini nutq qiling: \"Mening orzum\". |  |  |  |",
  "⚡ | Fizika | quiz | Elektr toki birligi qaysi? | Volt | Amper | Vatt | B",
  "🧮 | Matematika | quiz | 12 ning 25 foizi nechaga teng? | 2 | 3 | 4 | B",
  "🌱 | Biologiya | tf | O'simliklar fotosintezda kislorod ajratadi. |  |  |  | true",
  "🎯 | Challenge | task | 5 soniyada 5 gacha teskari sanang! |  |  |  |",
  "🗣️ | Ingliz tili | quiz | \"Apple\" so'zining tarjimasi qaysi? | Olma | Anor | Gilos | A",
  "🏛️ | Tarix | quiz | Amir Temur qaysi shaharda tug'ilgan? | Buxoro | Shahrisabz | Xiva | B",
  "☀️ | Tabiat | tf | Quyosh sharqdan chiqadi. |  |  |  | true",
  "🎨 | Ijod | task | Bitta hayvonni imo-ishora bilan ko'rsating! |  |  |  |",
  "💡 | Topqirlik | quiz | Bir haftada nechta kun bor? | 5 | 6 | 7 | C",
].join("\n");

const MEDIUM_16_LINES = [
  "🧮 | Matematika | quiz | 3/4 ning 40 ga ko'paytmasi nechaga teng? | 20 | 30 | 35 | B",
  "🌍 | Geografiya | quiz | O'zbekistonning eng uzun daryosi qaysi? | Amudaryo | Zarafshon | Chirchiq | A",
  "⚛️ | Fizika | tf | Yorug'lik vakuumda tovushdan tez tarqaladi. |  |  |  | true",
  "📖 | Adabiyot | quiz | Alisher Navoiyning 'Xamsa'si nechta dostondan iborat? | 3 | 5 | 7 | B",
  "🧠 | Mantiq | quiz | 1, 4, 9, 16 dan keyingi son qaysi? | 20 | 25 | 32 | B",
  "🧬 | Biologiya | tf | Inson yuragi to'rtta kameradan iborat. |  |  |  | true",
  "🏛️ | Tarix | quiz | Amir Temur davlati poytaxti qaysi shahar bo'lgan? | Samarqand | Toshkent | Buxoro | A",
  "🗣️ | Ingliz tili | quiz | 'Went' qaysi fe'lning o'tgan zamon shakli? | Win | Go | Want | B",
  "🧪 | Kimyo | quiz | Suvning kimyoviy formulasi qaysi? | CO2 | H2O | O2 | B",
  "💻 | Informatika | tf | 1 kilobayt odatda 1024 baytga teng. |  |  |  | true",
  "➗ | Matematika | quiz | 144 ning kvadrat ildizi nechaga teng? | 10 | 12 | 14 | B",
  "🌱 | Tabiat | quiz | Fotosintez asosan o'simlikning qaysi qismida kechadi? | Ildiz | Barg | Gul | B",
  "🧩 | Mantiq | task | 15 soniyada 4 ta juft son ayting. |  |  |  |",
  "🗺️ | Geografiya | tf | Ekvator Yer sharini Shimoliy va Janubiy yarimsharlarga ajratadi. |  |  |  | true",
  "🔤 | Ona tili | quiz | 'Kitoblar' so'zidagi ko'plik qo'shimchasi qaysi? | -ob | -lar | -kit | B",
  "🎯 | Topqirlik | task | 10 soniyada bir xil harf bilan boshlanuvchi 3 ta so'z ayting. |  |  |  |",
].join("\n");

const HARD_16_LINES = [
  "📐 | Matematika | quiz | To'g'ri burchakli uchburchak katetlari 6 va 8 bo'lsa, gipotenuza nechaga teng? | 10 | 12 | 14 | A",
  "⚡ | Fizika | quiz | Elektr qarshilikning SI birligi qaysi? | Om | Amper | Kulon | A",
  "🧪 | Kimyo | quiz | pH qiymati 7 dan kichik bo'lgan muhit qanday ataladi? | Ishqoriy | Neytral | Kislotali | C",
  "🌐 | Geografiya | tf | Grinvich meridiani 0 darajali uzunlik sifatida qabul qilingan. |  |  |  | true",
  "🧬 | Biologiya | quiz | Hujayraning irsiy axboroti asosan qayerda saqlanadi? | Ribosomada | DNKda | Sitoplazmada | B",
  "🏛️ | Tarix | quiz | Movarounnahr atamasi qanday ma'noni bildiradi? | Tog'lar orti | Daryoning narigi tomoni | Cho'l o'lkasi | B",
  "🧠 | Mantiq | quiz | 2, 6, 12, 20, 30 dan keyingi son qaysi? | 36 | 40 | 42 | C",
  "📚 | Adabiyot | quiz | 'Qutadg'u bilig' asari muallifi kim? | Yusuf Xos Hojib | Mahmud Qoshg'ariy | Ahmad Yugnakiy | A",
  "💻 | Informatika | quiz | Ikkilik sanoq tizimidagi 1010 soni o'nlikda nechaga teng? | 8 | 10 | 12 | B",
  "➗ | Matematika | tf | Har qanday tub son toq son bo'ladi. |  |  |  | false",
  "🔭 | Astronomiya | quiz | Quyosh tizimidagi eng katta sayyora qaysi? | Saturn | Yupiter | Neptun | B",
  "🗣️ | Ingliz tili | quiz | 'If I had known' qaysi grammatik tuzilishga kiradi? | First conditional | Second conditional | Third conditional | C",
  "🧩 | Mantiq | task | 20 soniyada 3 ta tub son va 3 ta murakkab son ayting. |  |  |  |",
  "🌿 | Biologiya | tf | Mitoxondriya hujayrada energiya ishlab chiqarishda qatnashadi. |  |  |  | true",
  "📏 | Geometriya | quiz | Aylana uzunligi formulasi qaysi? | πr² | 2πr | a² | B",
  "🎯 | Topqirlik | task | 'Bilim' so'zidagi harflardan 15 soniyada yangi so'z tuzing. |  |  |  |",
].join("\n");

export function getDefaultBingoLines(difficulty: "easy" | "medium" | "hard") {
  if (difficulty === "medium") return MEDIUM_16_LINES;
  if (difficulty === "hard") return HARD_16_LINES;
  return SAMPLE_16_LINES;
}
