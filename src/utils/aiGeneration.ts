export type GradeRange = "none" | "grades_1_4" | "grades_5_9" | "grades_10_11";

export const GRADE_RANGE_OPTIONS: Array<{ value: GradeRange; label: string }> = [
  { value: "none", label: "Farqsiz" },
  { value: "grades_1_4", label: "1-4-sinflar" },
  { value: "grades_5_9", label: "5-9-sinflar" },
  { value: "grades_10_11", label: "10-11-sinflar" },
];

export function getGradeRangeLabel(value: GradeRange): string {
  return GRADE_RANGE_OPTIONS.find((option) => option.value === value)?.label ?? "Farqsiz";
}

export function getGradeRangeInstruction(value: GradeRange): string {
  switch (value) {
    case "grades_1_4":
      return "Kontent 1-4-sinflar (boshlang'ich ta'lim) o'quvchilari uchun sodda, qisqa va yoshiga mos bo'lsin.";
    case "grades_5_9":
      return "Kontent 5-9-sinflar (o'rta ta'lim) o'quvchilari uchun mos, aniq va shu bosqich bilim darajasiga yaqin bo'lsin.";
    case "grades_10_11":
      return "Kontent 10-11-sinflar (yuqori sinflar) o'quvchilari uchun mos, chuqurroq va murakkabroq bo'lishi mumkin.";
    default:
      return "Sinf oralig'i cheklanmagan, maktab o'quvchilari uchun umumiy mos kontent bo'lsin.";
  }
}
