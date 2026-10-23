

export type Phase = "setup" | "spinning" | "question" | "finish";

export type Student = {
  id: string;
  name: string;
};

export type Question = {
  id: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  category: string;
  timeLimit: number;
  difficulty?: "easy" | "medium" | "hard";
};
