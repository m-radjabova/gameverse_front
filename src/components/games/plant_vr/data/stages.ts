import type { PlantStage, StageDefinition } from "../types";

export const STAGE_DEFINITIONS: StageDefinition[] = [
  {
    stage: "seed",
    minProgress: 0,
    label: "Urug' Bosqichi",
    tip: "Urug' avval namlik va xavfsiz tuproq muhitiga muhtoj bo'ladi.",
    milestone: "Urug' ichida yangi o'simlik uchun energiya zaxirasi saqlanadi.",
  },
  {
    stage: "sprout",
    minProgress: 20,
    label: "Nihol Bosqichi",
    tip: "Unib chiqqan nihol suv va yorug'likni muvozanat bilan olishi kerak.",
    milestone: "Ildizlar tuproqdan suv va minerallarni faol tortishni boshlaydi.",
  },
  {
    stage: "young plant",
    minProgress: 45,
    label: "Yosh O'simlik",
    tip: "Yosh o'simlik ko'proq fotosintez qilib poya va barglarini rivojlantiradi.",
    milestone: "Barglar soni oshgani sari o'simlik ko'proq oziqa ishlab chiqaradi.",
  },
  {
    stage: "mature plant",
    minProgress: 72,
    label: "Yetilgan O'simlik",
    tip: "Bu bosqichda tuproq sifati va barqaror parvarish nihoyatda muhim.",
    milestone: "Yetuk o'simlik gullash uchun ko'proq energiya to'playdi.",
  },
  {
    stage: "flowering plant",
    minProgress: 100,
    label: "Gullagan O'simlik",
    tip: "Sog'lom o'simlik to'g'ri sharoitda gullab, ko'payishga tayyor bo'ladi.",
    milestone: "Gullash o'simlikning muvaffaqiyatli hayot sikliga kirganini ko'rsatadi.",
  },
];

export const STAGE_ORDER: PlantStage[] = STAGE_DEFINITIONS.map(
  ({ stage }) => stage,
);

export const getStageDefinition = (stage: PlantStage) =>
  STAGE_DEFINITIONS.find((item) => item.stage === stage) ?? STAGE_DEFINITIONS[0];

export const getStageForProgress = (progress: number): StageDefinition => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  for (let index = STAGE_DEFINITIONS.length - 1; index >= 0; index -= 1) {
    const stage = STAGE_DEFINITIONS[index];
    if (clampedProgress >= stage.minProgress) {
      return stage;
    }
  }

  return STAGE_DEFINITIONS[0];
};
