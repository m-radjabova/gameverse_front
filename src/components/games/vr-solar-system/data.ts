export type SolarPlanetType = "rocky" | "gas-giant" | "ice-giant" | "dwarf-planet";
export type SolarTextureVariant = "earth" | "banded" | "cloudy" | "dust" | "icy" | "deep" | "rocky";

export interface SolarMoon {
  id: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  color: string;
}

export interface SolarRing {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
}

export interface SolarPlanetVisual {
  accentColor: string;
  surfaceColors: string[];
  textureVariant: SolarTextureVariant;
  atmosphereColor?: string;
  cloudColor?: string;
  emissiveColor?: string;
}

export interface SolarSystemPlanet {
  id: string;
  slug: string;
  nameUz: string;
  nameEn: string;
  shortDescriptionUz: string;
  factsUz: string[];
  orderFromSun: number;
  type: SolarPlanetType;
  orbitRadius: number;
  radiusScale: number;
  rotationSpeed: number;
  orbitSpeed: number;
  initialAngle: number;
  tilt: number;
  focusDistance: number;
  uiBadge?: string;
  isBonusObject?: boolean;
  typeLabelUz: string;
  orbitalPositionUz: string;
  materialLabelUz: string;
  moons?: SolarMoon[];
  ring?: SolarRing;
  visual: SolarPlanetVisual;
}

export const solarSystemPlanets: SolarSystemPlanet[] = [
  {
    id: "mercury",
    slug: "merkuriy",
    nameUz: "Merkuriy",
    nameEn: "Mercury",
    shortDescriptionUz: "Quyoshga eng yaqin, sirtida kraterlar ko'p bo'lgan ixcham sayyora.",
    factsUz: [
      "Bir yili juda qisqa, lekin o'z o'qi atrofidagi kuni juda uzun.",
      "Atmosferasi nihoyatda siyrak, shu sabab harorat keskin almashadi.",
    ],
    orderFromSun: 1,
    type: "rocky",
    typeLabelUz: "Toshli sayyora",
    orbitalPositionUz: "Quyoshga eng yaqin hudud",
    materialLabelUz: "Temir yadroli, qoyatoshli sirt",
    orbitRadius: 11,
    radiusScale: 1.04,
    rotationSpeed: 0.16,
    orbitSpeed: 0.74,
    initialAngle: 0.2,
    tilt: 0.03,
    focusDistance: 5.8,
    visual: {
      accentColor: "#f4c98f",
      surfaceColors: ["#6f5642", "#b98f6a", "#4f382d"],
      textureVariant: "rocky",
      emissiveColor: "#4c3422",
    },
  },
  {
    id: "venus",
    slug: "venera",
    nameUz: "Venera",
    nameEn: "Venus",
    shortDescriptionUz: "Qalin bulutlari sabab oltin tusda ko'rinadigan juda issiq sayyora.",
    factsUz: [
      "Qalin atmosfera issiqlikni ushlab, kuchli issiqxona effektini yaratadi.",
      "Ko'plab sayyoralardan farqli ravishda teskari yo'nalishda aylanadi.",
    ],
    orderFromSun: 2,
    type: "rocky",
    typeLabelUz: "Toshli sayyora",
    orbitalPositionUz: "Quyoshga yaqin ichki orbit",
    materialLabelUz: "Qalin karbonat angidrid atmosferasi",
    orbitRadius: 17,
    radiusScale: 1.42,
    rotationSpeed: 0.07,
    orbitSpeed: 0.51,
    initialAngle: 1.1,
    tilt: 0.08,
    focusDistance: 6.5,
    uiBadge: "Bulutli",
    visual: {
      accentColor: "#ffd7a4",
      surfaceColors: ["#b17842", "#f1c170", "#8e542f"],
      textureVariant: "cloudy",
      cloudColor: "#fff2cf",
      atmosphereColor: "#ffd6a0",
      emissiveColor: "#6b4420",
    },
  },
  {
    id: "earth",
    slug: "yer",
    nameUz: "Yer",
    nameEn: "Earth",
    shortDescriptionUz: "Suv, atmosfera va hayot uyg'unlashgan ko'k sayyora.",
    factsUz: [
      "Yuzasining katta qismi suvlardan iborat.",
      "Oy bilan juftligi to'lqinlar va tungi yoritishga ta'sir qiladi.",
    ],
    orderFromSun: 3,
    type: "rocky",
    typeLabelUz: "Toshli sayyora",
    orbitalPositionUz: "Yashashga qulay zona",
    materialLabelUz: "Suvli sirt va azot-kislorod atmosferasi",
    orbitRadius: 23,
    radiusScale: 1.58,
    rotationSpeed: 0.22,
    orbitSpeed: 0.38,
    initialAngle: 2.05,
    tilt: 0.41,
    focusDistance: 7.1,
    uiBadge: "Hayot maskani",
    moons: [
      {
        id: "moon",
        orbitRadius: 2.7,
        orbitSpeed: 1.4,
        size: 0.28,
        color: "#d8dbe2",
      },
    ],
    visual: {
      accentColor: "#5ec7ff",
      surfaceColors: ["#1f4f8b", "#4fa2ff", "#0f2747"],
      textureVariant: "earth",
      cloudColor: "#ffffff",
      atmosphereColor: "#8fe5ff",
      emissiveColor: "#0d3158",
    },
  },
  {
    id: "mars",
    slug: "mars",
    nameUz: "Mars",
    nameEn: "Mars",
    shortDescriptionUz: "Qizg'ish sirtli, tadqiqotlar markazida turgan sovuq sayyora.",
    factsUz: [
      "Qizil tusini temir oksidga boy tuproq beradi.",
      "Unda ulkan vulqonlar va chuqur daralar mavjud.",
    ],
    orderFromSun: 4,
    type: "rocky",
    typeLabelUz: "Toshli sayyora",
    orbitalPositionUz: "Ichki tizimning tashqi chekkasi",
    materialLabelUz: "Changli sirt va yupqa atmosfera",
    orbitRadius: 29,
    radiusScale: 1.23,
    rotationSpeed: 0.18,
    orbitSpeed: 0.29,
    initialAngle: 2.9,
    tilt: 0.18,
    focusDistance: 6.3,
    visual: {
      accentColor: "#ff8a6b",
      surfaceColors: ["#7f2e1f", "#c65f33", "#f6b37d"],
      textureVariant: "dust",
      atmosphereColor: "#ffb38c",
      emissiveColor: "#4c1d14",
    },
  },
  {
    id: "jupiter",
    slug: "yupiter",
    nameUz: "Yupiter",
    nameEn: "Jupiter",
    shortDescriptionUz: "Kuchli bo'ronlari va ulkan hajmi bilan ajralib turadigan eng katta sayyora.",
    factsUz: [
      "Quyosh tizimidagi eng katta sayyora bo'lib, Yer yonida juda ulkan ko'rinadi.",
      "Buyuk Qizil Dog' deb ataladigan bo'roni yuz yillardan beri davom etmoqda.",
    ],
    orderFromSun: 5,
    type: "gas-giant",
    typeLabelUz: "Gaz giganti",
    orbitalPositionUz: "Asteroid kamaridan keyingi yirik orbit",
    materialLabelUz: "Vodorod va geliy qatlamlari",
    orbitRadius: 40,
    radiusScale: 3.28,
    rotationSpeed: 0.26,
    orbitSpeed: 0.13,
    initialAngle: 3.7,
    tilt: 0.08,
    focusDistance: 11.4,
    uiBadge: "Gigant",
    moons: [
      { id: "io", orbitRadius: 4.8, orbitSpeed: 1.1, size: 0.34, color: "#efe1a1" },
      { id: "europa", orbitRadius: 5.8, orbitSpeed: 0.92, size: 0.28, color: "#dce8ff" },
      { id: "ganymede", orbitRadius: 7.2, orbitSpeed: 0.8, size: 0.42, color: "#b8a58c" },
    ],
    visual: {
      accentColor: "#f6c392",
      surfaceColors: ["#8d5634", "#d6a77a", "#f1d0ac", "#b07046"],
      textureVariant: "banded",
      atmosphereColor: "#f7d4ad",
      emissiveColor: "#59321e",
    },
  },
  {
    id: "saturn",
    slug: "saturn",
    nameUz: "Saturn",
    nameEn: "Saturn",
    shortDescriptionUz: "Yirik hajmi va shaffof halqalari bilan darhol taniladigan sayyora.",
    factsUz: [
      "Halqalari muz va tosh zarralaridan iborat juda keng tizim hosil qiladi.",
      "Zichligi suvdan ham past bo'lgan yengil gaz giganti hisoblanadi.",
    ],
    orderFromSun: 6,
    type: "gas-giant",
    typeLabelUz: "Gaz giganti",
    orbitalPositionUz: "Tashqi tizimning halqali markazi",
    materialLabelUz: "Gaz qatlamlari va muzli halqalar",
    orbitRadius: 53,
    radiusScale: 2.92,
    rotationSpeed: 0.22,
    orbitSpeed: 0.09,
    initialAngle: 4.85,
    tilt: 0.48,
    focusDistance: 10.5,
    uiBadge: "Halqali",
    ring: {
      innerRadius: 3.7,
      outerRadius: 5.8,
      color: "#e6d1a3",
      opacity: 0.68,
    },
    moons: [
      { id: "titan", orbitRadius: 6.5, orbitSpeed: 0.78, size: 0.38, color: "#d6b274" },
    ],
    visual: {
      accentColor: "#ffe3a6",
      surfaceColors: ["#9d7e4e", "#d8bf8d", "#f5e1b5", "#b39260"],
      textureVariant: "banded",
      atmosphereColor: "#f8dfac",
      emissiveColor: "#5f4a2a",
    },
  },
  {
    id: "uranus",
    slug: "uran",
    nameUz: "Uran",
    nameEn: "Uranus",
    shortDescriptionUz: "Yonboshlab aylanishi bilan mashhur bo'lgan sokin muz giganti.",
    factsUz: [
      "O'qining kuchli qiyaligi sabab deyarli yon tomonida aylanadi.",
      "Ko'kimtir tusini metan gazi beradi.",
    ],
    orderFromSun: 7,
    type: "ice-giant",
    typeLabelUz: "Muz giganti",
    orbitalPositionUz: "Tashqi tizimning sovuq hududi",
    materialLabelUz: "Muzsimon birikmalar va sovuq gazlar",
    orbitRadius: 66,
    radiusScale: 2.24,
    rotationSpeed: 0.16,
    orbitSpeed: 0.06,
    initialAngle: 5.75,
    tilt: 1.2,
    focusDistance: 8.9,
    visual: {
      accentColor: "#9ef7ff",
      surfaceColors: ["#70cbd2", "#a7eef2", "#5eaab4"],
      textureVariant: "icy",
      atmosphereColor: "#bbf6ff",
      emissiveColor: "#1c6674",
    },
  },
  {
    id: "neptune",
    slug: "neptun",
    nameUz: "Neptun",
    nameEn: "Neptune",
    shortDescriptionUz: "Chuqur ko'k rangi va tez shamollari bilan jozibali muz giganti.",
    factsUz: [
      "Quyosh tizimidagi eng tez shamollardan ba'zilari aynan shu yerda kuzatiladi.",
      "Quyoshdan juda uzoqda bo'lsa ham, sahnada aniq ajralib turadi.",
    ],
    orderFromSun: 8,
    type: "ice-giant",
    typeLabelUz: "Muz giganti",
    orbitalPositionUz: "Asosiy sakkizlikning eng tashqi orbitasi",
    materialLabelUz: "Muzsimon qatlamlar va metanli atmosfera",
    orbitRadius: 79,
    radiusScale: 2.12,
    rotationSpeed: 0.18,
    orbitSpeed: 0.045,
    initialAngle: 0.95,
    tilt: 0.5,
    focusDistance: 8.5,
    visual: {
      accentColor: "#6ca6ff",
      surfaceColors: ["#123f97", "#2760d8", "#66a6ff"],
      textureVariant: "deep",
      atmosphereColor: "#8eb8ff",
      emissiveColor: "#0f2465",
    },
  },
  {
    id: "pluto",
    slug: "pluton",
    nameUz: "Pluton",
    nameEn: "Pluto",
    shortDescriptionUz: "Asosiy sakkizlikdan tashqarida ko'rsatilgan qiziqarli mitti sayyora.",
    factsUz: [
      "Hozir mitti sayyora sifatida tasniflanadi.",
      "Ta'limiy ko'rinishlarda ko'pincha bonus obyekt sifatida beriladi.",
    ],
    orderFromSun: 9,
    type: "dwarf-planet",
    typeLabelUz: "Mitti sayyora",
    orbitalPositionUz: "Kuiper mintaqasiga yaqin uzoq hudud",
    materialLabelUz: "Muzli va qoyatoshli sirt",
    orbitRadius: 92,
    radiusScale: 0.82,
    rotationSpeed: 0.1,
    orbitSpeed: 0.03,
    initialAngle: 2.45,
    tilt: 0.26,
    focusDistance: 5.4,
    uiBadge: "Bonus",
    isBonusObject: true,
    visual: {
      accentColor: "#e7d7cc",
      surfaceColors: ["#5a463b", "#cab09b", "#8a7362"],
      textureVariant: "rocky",
      emissiveColor: "#2e241d",
    },
  },
];

export const primarySolarSystemPlanets = solarSystemPlanets.filter((planet) => !planet.isBonusObject);
