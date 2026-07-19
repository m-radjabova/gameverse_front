export type EggMode = "solo" | "battle";

export type EggTheme =
  | "forest"
  | "ocean"
  | "volcano"
  | "ice"
  | "thunder"
  | "sakura"
  | "galaxy"
  | "royal"
  | "rainbow";

export type EggImages = {
  base: string;
  crack1?: string;
  crack2?: string;
  crack3?: string;
  crack4?: string;
  hatched?: string;
};

export type EggLevel = {
  id: number;
  slug: EggTheme;
  name: string;
  subtitle: string;
  requiredCorrectAnswers: number;
  difficulty: "Oson" | "O'rta" | "Qiyin" | "Ekspert";
  unlockedByDefault: boolean;
  color: string;
  glow: string;
  images: EggImages;
};

export type EggQuestion = {
  id: number;
  subject: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
};
