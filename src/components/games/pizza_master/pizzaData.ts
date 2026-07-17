import type { PizzaIngredient, PizzaQuestion } from "./types";
import cheeseLayer from "./images/cheese-layer.png";
import chickenLayer from "./images/chicken-layer.png";
import cornLayer from "./images/corn-layer.png";
import mushroomLayer from "./images/mushroom-layer.png";
import oliveLayer from "./images/olive-layer.png";
import onionLayer from "./images/onin-layer.png";
import pepperLayer from "./images/pepper-layer.png";
import pepperoniLayer from "./images/pepperoni-layer.png";
import sauceLayer from "./images/sauce-layer.png";

export const PIZZA_INGREDIENTS: PizzaIngredient[] = [
  { id: "sauce", name: "Tomato Sauce", color: "bg-red-500", image: sauceLayer, power: "Oddiy progress" },
  { id: "cheese", name: "Cheese", color: "bg-yellow-400", image: cheeseLayer, power: "Keyingi savolga +2s" },
  { id: "pepperoni", name: "Pepperoni", color: "bg-orange-500", image: pepperoniLayer, power: "Battle'da raqibni 1s freeze" },
  { id: "mushroom", name: "Mushroom", color: "bg-amber-700", image: mushroomLayer, power: "Xato jarimasini kamaytiradi" },
  { id: "olive", name: "Olive", color: "bg-emerald-600", image: oliveLayer, power: "Combo mukofotini oshiradi" },
  { id: "corn", name: "Corn", color: "bg-yellow-300", image: cornLayer, power: "Har javobda +10 coin bonus" },
  { id: "chicken", name: "Chicken", color: "bg-amber-400", image: chickenLayer, power: "Combo 5 da bonus bo'lak" },
  { id: "onion", name: "Onion", color: "bg-purple-300", image: onionLayer, power: "Xatoda progress ko'proq saqlanadi" },
  { id: "pepper", name: "Pepper", color: "bg-green-500", image: pepperLayer, power: "Final challenge mukofoti x2" },
];

export const CORRECT_ANSWERS_PER_INGREDIENT = 2;
export const PIZZA_MAX_CORRECT_ANSWERS = PIZZA_INGREDIENTS.length * CORRECT_ANSWERS_PER_INGREDIENT;

export const PIZZA_QUESTIONS: PizzaQuestion[] = [
  { id: 1, prompt: "2 x 4 = ?", options: ["6", "8", "10", "12"], answer: 1, difficulty: "easy" },
  { id: 2, prompt: "5 x 3 = ?", options: ["10", "12", "15", "18"], answer: 2, difficulty: "easy" },
  { id: 3, prompt: "25 + 17 = ?", options: ["42", "40", "43", "45"], answer: 0, difficulty: "easy" },
  { id: 4, prompt: "48 : 6 = ?", options: ["6", "7", "8", "9"], answer: 2, difficulty: "easy" },
  { id: 5, prompt: "5 x 8 = ?", options: ["35", "45", "40", "48"], answer: 2, difficulty: "medium" },
  { id: 6, prompt: "72 : 9 = ?", options: ["7", "8", "9", "6"], answer: 1, difficulty: "medium" },
  { id: 7, prompt: "34 + 29 = ?", options: ["53", "63", "73", "62"], answer: 1, difficulty: "medium" },
  { id: 8, prompt: "90 - 28 = ?", options: ["72", "62", "52", "68"], answer: 1, difficulty: "medium" },
  { id: 9, prompt: "9 x 7 = ?", options: ["54", "63", "72", "81"], answer: 1, difficulty: "medium" },
  { id: 10, prompt: "8 x 9 = ?", options: ["64", "72", "81", "70"], answer: 1, difficulty: "medium" },
  { id: 11, prompt: "63 : 9 = ?", options: ["6", "7", "8", "9"], answer: 1, difficulty: "medium" },
  { id: 12, prompt: "120 - 47 = ?", options: ["73", "83", "67", "77"], answer: 0, difficulty: "hard" },
  { id: 13, prompt: "12 x 8 = ?", options: ["84", "92", "96", "108"], answer: 2, difficulty: "hard" },
  { id: 14, prompt: "15 x 4 = ?", options: ["45", "50", "60", "75"], answer: 2, difficulty: "hard" },
  { id: 15, prompt: "96 : 12 = ?", options: ["6", "7", "8", "9"], answer: 2, difficulty: "hard" },
  { id: 16, prompt: "150 - 65 = ?", options: ["75", "85", "95", "105"], answer: 1, difficulty: "hard" },
  { id: 17, prompt: "11 x 6 = ?", options: ["56", "66", "76", "62"], answer: 1, difficulty: "hard" },
  { id: 18, prompt: "84 : 7 = ?", options: ["11", "12", "13", "14"], answer: 1, difficulty: "hard" },
  { id: 19, prompt: "9 x ? = 81", options: ["7", "8", "9", "10"], answer: 2, difficulty: "chef" },
  { id: 20, prompt: "72 : ? = 8", options: ["6", "7", "8", "9"], answer: 3, difficulty: "chef" },
  { id: 21, prompt: "8 x ? = 56", options: ["6", "7", "8", "9"], answer: 1, difficulty: "chef" },
  { id: 22, prompt: "? x 6 = 72", options: ["10", "11", "12", "13"], answer: 2, difficulty: "chef" },
  { id: 23, prompt: "56 : 8 = ?", options: ["6", "7", "8", "9"], answer: 1, difficulty: "chef" },
  { id: 24, prompt: "13 x 5 = ?", options: ["55", "60", "65", "75"], answer: 2, difficulty: "chef" },
];

export const createPlayer = (name: string) => ({
  name,
  ingredients: 0,
  correctAnswers: 0,
  xp: 0,
  coins: 0,
  combo: 0,
  bestCombo: 0,
  skills: [],
  doubleNext: false,
  lastEvent: undefined,
});
