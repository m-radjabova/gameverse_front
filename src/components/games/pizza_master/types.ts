export type PizzaMode = "solo" | "battle";

export type PizzaSkillId = "freeze" | "shuffle" | "extra-time" | "double-slice";

export type PizzaIngredientId =
  | "sauce"
  | "cheese"
  | "pepperoni"
  | "mushroom"
  | "olive"
  | "corn"
  | "chicken"
  | "onion"
  | "pepper";

export type PizzaIngredient = {
  id: PizzaIngredientId;
  name: string;
  color: string;
  image: string;
  power: string;
};

export type PizzaQuestion = {
  id: number;
  prompt: string;
  options: string[];
  answer: number;
  difficulty?: "easy" | "medium" | "hard" | "chef";
};

export type PizzaPlayer = {
  name: string;
  ingredients: number;
  correctAnswers: number;
  xp: number;
  coins: number;
  combo: number;
  bestCombo: number;
  skills: PizzaSkillId[];
  doubleNext: boolean;
  lastEvent?: string;
};
