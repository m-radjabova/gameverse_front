export type AiQuestionLanguage = "uzbek" | "english" | "russian";

/**
 * The subject selector also determines the language of generated learning
 * content.  Keep this in one place so every AI question flow behaves alike.
 */
export function getAiQuestionLanguage(subject: string): AiQuestionLanguage {
  const normalized = subject.trim().toLocaleLowerCase();

  if (normalized.includes("ingliz") || normalized.includes("english")) return "english";
  if (normalized.includes("rus") || normalized.includes("russian")) return "russian";
  return "uzbek";
}

export function getAiQuestionLanguageInstruction(subject: string): string {
  switch (getAiQuestionLanguage(subject)) {
    case "english":
      return "LANGUAGE REQUIREMENT: Write every learner-visible value (questions, answers, choices, titles, hints, explanations and stories) only in English. Do not use Uzbek or Russian.";
    case "russian":
      return "ЯЗЫКОВОЕ ТРЕБОВАНИЕ: Все значения, видимые ученику (вопросы, ответы, варианты, заголовки, подсказки, объяснения и истории), пишите только на русском языке. Не используйте узбекский или английский язык.";
    default:
      return "Matn Uzbek (Latin) tilida bo'lsin.";
  }
}

export function getAiTopicInstruction(topic: string): string {
  return `TOPIC REQUIREMENT: Every question must directly assess the exact requested topic: "${topic}". Do not create generic subject questions or include unrelated facts.`;
}
