import type { Riddle } from "../types";

export 
const TREASURE_RIDDLES: Riddle[] = [
  {
    id: "1",
    title: "Qadimiy maqbar",
    story: "Cho'l qaqrida bir maqbaraga yetib keldingiz...",
    question: "Qaysi hayvon eng uzoq yashaydi?",
    options: ["Toshbaqa", "Fil", "Kit", "Kaptar"],
    answerIndex: 0,
    hint: "Bu hayvon 150 yilgacha yashay oladi",
    reward: 120
  },
  {
    id: "2",
    title: "Yo'qolgan shahar",
    story: "Qum ostida qolgan shahar qoldiqlari...",
    question: "Piramidalar qaysi davlatda joylashgan?",
    options: ["Gretsiya", "Misr", "Rim", "Iroq"],
    answerIndex: 1,
    hint: "Nil daryosi bo'yida joylashgan",
    reward: 150
  },
  {
    id: "3",
    title: "Sirli g'or",
    story: "G'or devorida qadimiy yozuvlar bor...",
    question: "Yerning eng yuqori nuqtasi?",
    options: ["Everest", "Kilimanjaro", "Elbrus", "Mont Blanc"],
    answerIndex: 0,
    hint: "Himolay tog'larida joylashgan",
    reward: 130
  },
  {
    id: "4",
    title: "Dengiz qaroqchilari",
    story: "Kema vayronalari orasida bir shisha topdingiz...",
    question: "Eng katta okean qaysi?",
    options: ["Atlantika", "Tinch", "Hind", "Shimoliy Muz"],
    answerIndex: 1,
    hint: "Bu okean dunyodagi eng katta",
    reward: 140
  },
  {
    id: "5",
    title: "Marjon ko'rfazi",
    story: "Rang-barang marjonlar orasida qadimiy kompas yaltiradi...",
    question: "Marjon riflari asosan qaysi jonivorlar tomonidan hosil qilinadi?",
    options: ["Mayda poliplar", "Baliqlar", "Dengiz o'tlari", "Qisqichbaqalar"],
    answerIndex: 0,
    hint: "Ular juda kichik bo'lsa ham, katta koloniyalar bo'lib yashaydi",
    reward: 150
  },
  {
    id: "6",
    title: "Kompas qoyasi",
    story: "Shamol yo'nalishni o'zgartirdi. Faqat kompas sizga yo'l ko'rsata oladi...",
    question: "Kompasning rangli uchi odatda qaysi tomonni ko'rsatadi?",
    options: ["Janub", "Sharq", "Shimol", "G'arb"],
    answerIndex: 2,
    hint: "Xaritada bu yo'nalish odatda tepada bo'ladi",
    reward: 130
  },
  {
    id: "7",
    title: "Yulduzlar bo'g'ozi",
    story: "Tun tushdi. Dengizchilar qadimdan yulduzlar yordamida yo'l topishgan...",
    question: "Qutb yulduzi qaysi yo'nalishni topishga yordam beradi?",
    options: ["Shimol", "Janub", "Sharq", "G'arb"],
    answerIndex: 0,
    hint: "U Shimoliy qutb tomonda deyarli qimirlamay ko'rinadi",
    reward: 150
  },
  {
    id: "8",
    title: "Vulqon oroli",
    story: "Orol markazidagi tog'dan tutun chiqmoqda. Tezda sirli belgini yeching...",
    question: "Yer ichidan otilib chiqqan suyuq tog' jinsi nima deyiladi?",
    options: ["Magma", "Lava", "Bazalt", "Qum"],
    answerIndex: 1,
    hint: "Yer ostida magma, yer yuziga chiqqach esa boshqa nom bilan ataladi",
    reward: 160
  },
  {
    id: "9",
    title: "Kitlar yo'li",
    story: "Ulkan ko'k kit kemangiz yonida suzmoqda va sizga yo'l ochmoqda...",
    question: "Kitlar qanday nafas oladi?",
    options: ["Jabra bilan", "Teri orqali", "O'pka bilan", "Suv orqali"],
    answerIndex: 2,
    hint: "Kit baliq emas, u sutemizuvchi hayvon",
    reward: 140
  },
  {
    id: "10",
    title: "Qadimiy mayoq",
    story: "Tuman ichida mayoq nuri ko'rindi. Uning eshigida matematik qulf bor...",
    question: "Bir sutkada necha soat bor?",
    options: ["12", "18", "24", "36"],
    answerIndex: 2,
    hint: "Ikki yarim kun 60 soat bo'ladi",
    reward: 120
  },
  {
    id: "11",
    title: "Shivirlovchi o'rmon",
    story: "Daraxtlar orasidan yashirin yo'l o'tadi. Tabiat haqidagi bilim uni ochadi...",
    question: "O'simliklar quyosh nuri yordamida oziqa yaratish jarayoni nima?",
    options: ["Bug'lanish", "Fotosintez", "Nafas olish", "Changlanish"],
    answerIndex: 1,
    hint: "Bu so'z 'yorug'lik' va 'birlashtirish' ma'nolaridan tuzilgan",
    reward: 160
  },
  {
    id: "12",
    title: "Kapitan sandig'i",
    story: "Xazina oroliga yetdingiz. Sandiqdagi so'nggi qulfni bilim kaliti ochadi...",
    question: "O'zbekiston poytaxti qaysi shahar?",
    options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"],
    answerIndex: 2,
    hint: "Bu Markaziy Osiyodagi eng yirik shaharlardan biri",
    reward: 180
  }
];
