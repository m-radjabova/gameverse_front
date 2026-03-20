

export type Phase = "setup" | "spinning" | "question" | "finish";

export type Student = {
  id: string;
  name: string;
  score: number;
};

export type Question = {
  id: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  category: string;
  points: number;
  timeLimit: number;
};