export type TeamId = 0 | 1;

export type Question = {
  question: string;
  options: string[];
  answerIndex: number;
  category: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type Phase = "question-setup" | "team-setup" | "play" | "finish";

export type QuestionDraft = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  category: string;
};
