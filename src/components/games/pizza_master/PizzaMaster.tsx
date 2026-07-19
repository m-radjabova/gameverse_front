import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import GameModeSelect from "./GameModeSelect";
import BattleArena from "./BattleArena";
import VictoryModal from "./VictoryModal";
import SoloPizzaArena from "./SoloPizzaArena";
import { createPlayer, CORRECT_ANSWERS_PER_INGREDIENT, PIZZA_INGREDIENTS, PIZZA_MAX_CORRECT_ANSWERS, PIZZA_QUESTIONS } from "./pizzaData";
import type { PizzaIngredientId, PizzaMode, PizzaPlayer, PizzaQuestion, PizzaSkillId } from "./types";
import { writeLastPlayedGame } from "../../../utils/gameHistory";
import useContextPro from "../../../hooks/useContextPro";
import useGameQuestions from "../../../hooks/useGameQuestions";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { getGameQuestionDifficulty, saveGameSessionConfig } from "../../../hooks/gameSession";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import pizzaGameSound from "../../../assets/sounds/pizza-game.m4a";
import wrongSound from "../../../assets/sounds/wrong.mp3";
import { filterGameQuestionsByDifficulty } from "../../../utils/gameQuestionDifficulty";

const QUESTION_SECONDS = 15;
const CHEF_CHALLENGE_SECONDS = 10;
const PIZZA_MASTER_QUESTION_KEY = "pizza_master";
const PIZZA_MASTER_RESULT_KEY = "pizza-master";
const BATTLE_SKILL_DECK: PizzaSkillId[] = ["freeze", "shuffle", "extra-time", "double-slice"];

type TeacherPizzaQuestion = {
  id?: string;
  question?: string;
  prompt?: string;
  options?: string[];
  variants?: string[];
  answerIndex?: number;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
};

function normalizeTeacherQuestions(items: TeacherPizzaQuestion[]): PizzaQuestion[] {
  return items
    .map((item, index) => {
      const prompt = String(item.question ?? item.prompt ?? "").trim();
      const options = (item.options ?? item.variants ?? []).map((option) => String(option).trim()).filter(Boolean).slice(0, 4);
      const answer = Number(item.answerIndex);
      if (!prompt || options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
      const normalized: PizzaQuestion = { id: index + 1, prompt, options, answer, difficulty: item.difficulty };
      return normalized;
    })
    .filter((item): item is PizzaQuestion => Boolean(item));
}

const hasIngredient = (player: PizzaPlayer, id: PizzaIngredientId) => {
  const index = PIZZA_INGREDIENTS.findIndex((ingredient) => ingredient.id === id);
  return index >= 0 && player.ingredients > index;
};

const getIngredientCount = (correctAnswers: number) => (
  Math.min(PIZZA_INGREDIENTS.length, Math.floor(correctAnswers / CORRECT_ANSWERS_PER_INGREDIENT))
);

const getDifficulty = (correctAnswers: number): NonNullable<PizzaQuestion["difficulty"]> => {
  if (correctAnswers >= PIZZA_MAX_CORRECT_ANSWERS - CORRECT_ANSWERS_PER_INGREDIENT) return "chef";
  if (correctAnswers >= 12) return "hard";
  if (correctAnswers >= 4) return "medium";
  return "easy";
};

const selectQuestion = (items: PizzaQuestion[], index: number, correctAnswers: number) => {
  const difficulty = getDifficulty(correctAnswers);
  const staged = items.filter((item) => item.difficulty === difficulty);
  const source = staged.length > 0 ? staged : items;
  return source[index % source.length];
};

const getRoundSeconds = (player: PizzaPlayer) => {
  const base = getDifficulty(player.correctAnswers) === "chef" ? CHEF_CHALLENGE_SECONDS : QUESTION_SECONDS;
  return base + (hasIngredient(player, "cheese") ? 2 : 0);
};

const nextBattleSkill = (combo: number, playerIndex: number) => BATTLE_SKILL_DECK[(Math.floor(combo / 3) + playerIndex) % BATTLE_SKILL_DECK.length];

function applyCorrectAnswer(player: PizzaPlayer, playerIndex: number, mode: PizzaMode) {
  const previousIngredients = player.ingredients;
  const combo = player.combo + 1;
  const isChefChallenge = getDifficulty(player.correctAnswers) === "chef";
  const comboProgressBonus = combo >= 3 ? 1 : 0;
  const chickenBonus = combo >= 5 && hasIngredient(player, "chicken") ? 1 : 0;
  const doubleSliceBonus = player.doubleNext ? 1 : 0;
  const gainedAnswers = 1 + comboProgressBonus + chickenBonus + doubleSliceBonus;
  const correctAnswers = Math.min(PIZZA_MAX_CORRECT_ANSWERS, player.correctAnswers + gainedAnswers);
  const ingredients = getIngredientCount(correctAnswers);
  const rewardMultiplier = (combo >= 2 ? 2 : 1) + (combo >= 2 && hasIngredient(player, "olive") ? 1 : 0);
  const chefMultiplier = isChefChallenge && hasIngredient(player, "pepper") ? 2 : 1;
  const cornBonus = hasIngredient(player, "corn") ? 10 : 0;
  const xp = player.xp + 100 * rewardMultiplier * chefMultiplier;
  const coins = player.coins + (50 * rewardMultiplier + cornBonus) * chefMultiplier;
  const unlocked = PIZZA_INGREDIENTS.slice(previousIngredients, ingredients);
  const unlockedText = unlocked.length > 0 ? `Yangi ingredient: ${unlocked.map((item) => item.name).join(", ")}` : undefined;
  const progressText = gainedAnswers > 1 ? `Combo bonus: +${gainedAnswers} progress` : undefined;
  const grantedSkill = mode === "battle" && combo % 3 === 0 ? nextBattleSkill(combo, playerIndex) : undefined;
  const skills = grantedSkill ? [...player.skills, grantedSkill] : player.skills;

  return {
    player: {
      ...player,
      ingredients,
      correctAnswers,
      xp,
      coins,
      combo,
      bestCombo: Math.max(player.bestCombo, combo),
      skills,
      doubleNext: false,
      lastEvent: grantedSkill ? `Skill ochildi: ${grantedSkill}` : unlockedText ?? progressText,
    },
    unlocked,
    completed: correctAnswers === PIZZA_MAX_CORRECT_ANSWERS,
  };
}

function applyWrongAnswer(player: PizzaPlayer) {
  const canShield = hasIngredient(player, "mushroom") || hasIngredient(player, "onion");
  const correctAnswers = canShield ? player.correctAnswers : Math.max(0, player.correctAnswers - 1);
  return {
    ...player,
    correctAnswers,
    ingredients: getIngredientCount(correctAnswers),
    combo: 0,
    doubleNext: false,
    lastEvent: canShield ? "Mushroom shield: progress saqlandi" : "Xato: -1 progress",
  };
}

export default function PizzaMaster() {
  const navigate = useNavigate();
  const { state: { user } } = useContextPro();
  const { loadQuestions } = useGameQuestions<TeacherPizzaQuestion>({ teacherId: user?.id });
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<PizzaMode | null>(null);
  const [players, setPlayers] = useState<PizzaPlayer[]>([createPlayer("Siz"), createPlayer("Player 2")]);
  const [activePlayer, setActivePlayer] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [roundSeconds, setRoundSeconds] = useState(QUESTION_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [winner, setWinner] = useState<PizzaPlayer | null>(null);
  const [battleAnswered, setBattleAnswered] = useState<[boolean, boolean]>([false, false]);
  const [questions, setQuestions] = useState(PIZZA_QUESTIONS);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [frozenPlayers, setFrozenPlayers] = useState<[boolean, boolean]>([false, false]);
  const [shuffledPlayers, setShuffledPlayers] = useState<[boolean, boolean]>([false, false]);
  const backgroundParticles = useMemo(
    () => Array.from({ length: 14 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 5}s`,
    })),
    [],
  );

  const isTeacherOrAdmin = Boolean(
    user?.id && user.roles?.some((role: string) => ["teacher", "admin"].includes(role.toLowerCase())),
  );

  const leadingCorrectAnswers = Math.max(players[0]?.correctAnswers ?? 0, players[1]?.correctAnswers ?? 0);
  const activeCorrectAnswers = mode === "battle" ? leadingCorrectAnswers : players[activePlayer]?.correctAnswers ?? 0;
  const question = useMemo(() => selectQuestion(questions, questionIndex, activeCorrectAnswers), [activeCorrectAnswers, questionIndex, questions]);
  const resetRoundTimer = useCallback((seconds = QUESTION_SECONDS) => {
    setRoundSeconds(seconds);
    setTimeLeft(seconds);
  }, []);

  useEffect(() => {
    let active = true;
    setQuestionsReady(false);

    void loadQuestions(PIZZA_MASTER_QUESTION_KEY, {
      teacherScoped: isTeacherOrAdmin,
    })
      .then((remoteQuestions) => {
        if (!active) return;
        const normalized = normalizeTeacherQuestions(remoteQuestions ?? []);
        // Teacher savollari mavjud bo'lsa, demo ro'yxatni to'liq almashtiramiz.
        const source = normalized.length > 0 ? normalized : PIZZA_QUESTIONS;
        setQuestions(filterGameQuestionsByDifficulty(source, getGameQuestionDifficulty("pizza-master")));
        setQuestionsReady(true);
      })
      .catch(() => {
        if (!active) return;
        setQuestions(filterGameQuestionsByDifficulty(PIZZA_QUESTIONS, getGameQuestionDifficulty("pizza-master")));
        setQuestionsReady(true);
      });

    return () => { active = false; };
    // loadQuestions ichki cache state'iga bog'liq; uni dependency qilish request loop hosil qiladi.
    // Teacher yoki akkaunt almashgandagina ro'yxat qayta yuklanishi kifoya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherOrAdmin, user?.id]);

  useGameResultSubmission(
    Boolean(winner) && mode !== "battle",
    PIZZA_MASTER_RESULT_KEY,
    winner
      ? (mode === "battle"
          ? players.map((player) => ({ participant_name: player.name, participant_mode: "2 o'yinchi", score: player.xp, metadata: { coins: player.coins, combo: player.bestCombo, winner: player.name === winner.name } }))
          : [{ participant_name: winner.name, participant_mode: "1 o'yinchi", score: winner.xp, metadata: { coins: winner.coins, combo: winner.bestCombo } }])
      : [],
  );
  useFinishApplause(Boolean(winner));

  useEffect(() => {
    const background = new Audio(pizzaGameSound);
    background.loop = true;
    background.volume = 0.38;
    backgroundAudioRef.current = background;

    const wrong = new Audio(wrongSound);
    wrong.volume = 0.75;
    wrongAudioRef.current = wrong;

    return () => {
      [backgroundAudioRef, wrongAudioRef].forEach((ref) => {
        ref.current?.pause();
        if (ref.current) ref.current.currentTime = 0;
      });
    };
  }, []);

  const prepareBackgroundMusic = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    // User click ichida playbackni ochib qo'yamiz, shunda countdowndan keyin browser ovozni bloklamaydi.
    audio.muted = true;
    void audio.play().catch(() => undefined);
  }, []);

  const beginBackgroundMusic = useCallback(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 0.38;
    if (audio.paused) void audio.play().catch(() => undefined);
  }, []);

  const playWrongSound = useCallback(() => {
    const audio = wrongAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!winner) return;
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, [winner]);

  useEffect(() => {
    if (!mode || !gameStarted || winner || locked) return;
    const timer = window.setInterval(() => setTimeLeft((time) => Math.max(0, time - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [gameStarted, mode, winner, locked]);

  useEffect(() => {
    if (!mode || !gameStarted || winner || locked) return;
    const timer = window.setInterval(() => setElapsed((time) => time + 1), 1000);
    return () => window.clearInterval(timer);
  }, [gameStarted, mode, winner, locked]);

  const advance = useCallback((wasCorrect: boolean) => {
    setPlayers((current) => {
      const updated = current.map((player, index) => {
        if (index !== activePlayer) return player;
        const result = wasCorrect ? applyCorrectAnswer(player, index, mode ?? "solo") : { player: applyWrongAnswer(player), unlocked: [], completed: false };
        if (wasCorrect && result.completed) setWinner(result.player);
        return result.player;
      });
      return updated;
    });
    if (mode === "battle") {
      if (activePlayer === 0) setActivePlayer(1);
      else { setActivePlayer(0); setQuestionIndex((index) => index + 1); }
    } else setQuestionIndex((index) => index + 1);
    const nextPlayer = mode === "battle" ? players[activePlayer === 0 ? 1 : 0] : players[activePlayer];
    resetRoundTimer(getRoundSeconds(nextPlayer));
  }, [activePlayer, mode, resetRoundTimer]);

  const answerBattle = (playerIndex: number, answerIndex: number) => {
    if (!gameStarted || locked || winner || battleAnswered[playerIndex]) return;
    const isCorrect = answerIndex === question.answer;
    setBattleAnswered((current) => {
      const next: [boolean, boolean] = [...current] as [boolean, boolean];
      next[playerIndex] = true;
      return next;
    });
    if (isCorrect) {
      const effects: Array<{ playerIndex: number; unlocked: PizzaIngredientId[] }> = [];
      setPlayers((current) => current.map((player, index) => {
        if (index !== playerIndex) return player;
        const result = applyCorrectAnswer(player, index, "battle");
        effects.push({ playerIndex, unlocked: result.unlocked.map((item) => item.id) });
        if (result.completed) setWinner(result.player);
        return result.player;
      }));
      effects.forEach((effect) => {
        const opponent = effect.playerIndex === 0 ? 1 : 0;
        if (effect.unlocked.includes("pepperoni")) {
          setFrozenPlayers((current) => {
            const next: [boolean, boolean] = [...current] as [boolean, boolean];
            next[opponent] = true;
            return next;
          });
          window.setTimeout(() => {
            setFrozenPlayers((current) => {
              const next: [boolean, boolean] = [...current] as [boolean, boolean];
              next[opponent] = false;
              return next;
            });
          }, 1000);
        }
      });
    } else {
      playWrongSound();
      setTimeLeft((time) => Math.max(0, time - 1));
      setPlayers((current) => current.map((player, index) => {
        if (index === playerIndex) return applyWrongAnswer(player);
        return { ...player, coins: player.coins + 25, lastEvent: "Raqib xato qildi: +25 coin" };
      }));
    }
  };

  const useBattleSkill = (playerIndex: number, skill: PizzaSkillId) => {
    if (mode !== "battle" || !gameStarted || locked || winner) return;
    const opponent = playerIndex === 0 ? 1 : 0;
    if (!players[playerIndex].skills.includes(skill)) return;

    setPlayers((current) => current.map((player, index) => {
      if (index !== playerIndex) return player;
      const skillIndex = player.skills.indexOf(skill);
      return {
        ...player,
        skills: player.skills.filter((_, index) => index !== skillIndex),
        doubleNext: skill === "double-slice" ? true : player.doubleNext,
        lastEvent: `Skill ishladi: ${skill}`,
      };
    }));

    if (skill === "freeze") {
      setFrozenPlayers((current) => {
        const next: [boolean, boolean] = [...current] as [boolean, boolean];
        next[opponent] = true;
        return next;
      });
      window.setTimeout(() => {
        setFrozenPlayers((current) => {
          const next: [boolean, boolean] = [...current] as [boolean, boolean];
          next[opponent] = false;
          return next;
        });
      }, 1000);
    }
    if (skill === "shuffle") {
      setShuffledPlayers((current) => {
        const next: [boolean, boolean] = [...current] as [boolean, boolean];
        next[opponent] = true;
        return next;
      });
    }
    if (skill === "extra-time") {
      setTimeLeft((time) => Math.min(roundSeconds + 4, time + 2));
    }
  };

  const answer = (answerIndex: number) => {
    if (!gameStarted || locked || winner) return;
    setLocked(true);
    const isCorrect = answerIndex === question.answer;
    if (!isCorrect) playWrongSound();
    window.setTimeout(() => { advance(isCorrect); setLocked(false); }, 380);
  };

  useEffect(() => {
    // Battle mode o'zining ikkala o'yinchi uchun umumiy o'tish oqimiga ega.
    // Aks holda bu effect activePlayer ni almashtirib, battle transition bilan
    // bir vaqtda ishlashi mumkin.
    if (timeLeft === 0 && mode === "solo" && gameStarted && !locked && !winner) {
      setLocked(true);
      window.setTimeout(() => { advance(false); setLocked(false); }, 250);
    }
  }, [advance, gameStarted, locked, mode, timeLeft, winner]);

  useEffect(() => {
    if (mode !== "battle" || !gameStarted || winner) return;
    if (!battleAnswered[0] && !battleAnswered[1] && timeLeft > 0) return;
    setLocked(true);
    const timer = window.setTimeout(() => {
      setQuestionIndex((index) => index + 1);
      setBattleAnswered([false, false]);
      setShuffledPlayers([false, false]);
      resetRoundTimer(Math.max(getRoundSeconds(players[0]), getRoundSeconds(players[1])));
      setLocked(false);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [battleAnswered, gameStarted, locked, mode, players, resetRoundTimer, timeLeft, winner]);

  const startGame = (selectedMode: PizzaMode, names?: [string, string]) => {
    writeLastPlayedGame("pizza-master");
    const participantCount = selectedMode === "battle" ? 2 : 1;
    saveGameSessionConfig({
      gameId: "pizza-master",
      participantCount,
      participantType: "player",
      participantLabel: "o'yinchi",
      participantLabels: participantCount === 2 ? [names?.[0] || "Player 1", names?.[1] || "Player 2"] : [names?.[0] || user?.username?.trim() || "Siz"],
      questionDifficulty: getGameQuestionDifficulty("pizza-master"),
      selectedAt: new Date().toISOString(),
    });
    setMode(selectedMode);
    setPlayers([createPlayer(names?.[0] || (selectedMode === "solo" ? user?.username?.trim() || "Siz" : "Player 1")), createPlayer(names?.[1] || "Player 2")]);
    setActivePlayer(0); setQuestionIndex(0); setElapsed(0); setWinner(null); setLocked(false); setGameStarted(false); resetRoundTimer();
    setBattleAnswered([false, false]);
    setFrozenPlayers([false, false]);
    setShuffledPlayers([false, false]);
    prepareBackgroundMusic();
    runStartCountdown(() => {
      setGameStarted(true);
      beginBackgroundMusic();
    });
  };

  const restart = () => startGame(mode ?? "solo");

  if (!questionsReady) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#0d0d1a] p-6 text-center">
        <div className="rounded-3xl border border-orange-400/20 bg-white/5 px-8 py-7 shadow-2xl backdrop-blur">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-300/20 border-t-orange-400" />
          <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-orange-300">Savollar yuklanmoqda</p>
          <p className="mt-2 text-sm text-white/60">Pizza Master siz uchun tayyorlanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!mode) return <GameModeSelect onSelect={startGame} />;

  return (
    <div className="pm-screen fixed inset-0 z-50 flex flex-col overflow-hidden">
      <div className="pm-kitchen-atmosphere" aria-hidden="true">
        <span className="pm-kitchen-lamp lamp-left"><i /></span>
        <span className="pm-kitchen-lamp lamp-right"><i /></span>
        <div className="pm-kitchen-shelf"><span>🍅</span><span>🌿</span><span>🫒</span><span>🧀</span></div>
        <div className="pm-oven-glow" />
      </div>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-500/8 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: "2s" }} />
        {backgroundParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-orange-400/40 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              animation: particle.animation,
              animationDelay: particle.animationDelay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-auto">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
            50% { box-shadow: 0 0 40px rgba(251, 146, 60, 0.6); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          .pizza-glow {
            animation: glow-pulse 2s ease-in-out infinite;
          }
          .pizza-float {
            animation: float 3s ease-in-out infinite;
          }
          .pm-screen {
            background:
              linear-gradient(rgba(255,245,220,0.055) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255,245,220,0.055) 2px, transparent 2px),
              radial-gradient(circle at 50% 48%, rgba(255,125,36,0.2), transparent 32%),
              linear-gradient(180deg, #25130f 0%, #3a1e16 58%, #1b0d0a 100%);
            background-size: 62px 62px, 62px 62px, auto, auto;
          }
          .pm-screen:before {
            content: ""; position: absolute; z-index: 0; left: 0; right: 0; bottom: 0; height: 29%; pointer-events: none;
            border-top: 10px solid #170a07;
            background: repeating-linear-gradient(88deg,#5a2d18 0 46px,#6d381f 46px 49px,#42200f 49px 92px,#774324 92px 96px);
            box-shadow: inset 0 8px 22px #0008,0 -10px 35px #0008;
          }
          .pm-screen:after {
            content: ""; position: absolute; z-index: 0; left: 0; right: 0; top: 58px; height: 16px; pointer-events: none;
            background: repeating-linear-gradient(90deg,#8f221b 0 28px,#f4e3bd 28px 56px); box-shadow:0 5px 15px #0007;
          }
          .pm-kitchen-atmosphere{position:absolute;z-index:1;inset:0;overflow:hidden;pointer-events:none}
          .pm-kitchen-lamp{position:absolute;top:-4px;width:2px;height:78px;background:#140805;box-shadow:0 0 5px #000}.pm-kitchen-lamp:after{content:"";position:absolute;left:50%;bottom:-22px;width:76px;height:38px;transform:translateX(-50%);border-radius:45px 45px 8px 8px;background:linear-gradient(180deg,#24100b,#7d361b);border:2px solid #c87935;box-shadow:0 13px 30px #ff8a2855}.pm-kitchen-lamp i{position:absolute;left:50%;bottom:-38px;width:34px;height:22px;transform:translateX(-50%);border-radius:50%;background:#ffd18a;filter:blur(9px);opacity:.55}.pm-kitchen-lamp.lamp-left{left:9%}.pm-kitchen-lamp.lamp-right{right:9%}
          .pm-kitchen-shelf{position:absolute;left:5%;top:115px;display:flex;gap:14px;align-items:flex-end;padding:7px 18px 9px;border-bottom:8px solid #4b210f;background:#1a0b0788;border-radius:8px;box-shadow:0 12px 20px #0008;font-size:24px}.pm-kitchen-shelf span{filter:drop-shadow(0 4px 3px #0008)}
          .pm-oven-glow{position:absolute;right:8%;top:22%;width:240px;height:170px;border:10px solid #160a07;border-radius:90px 90px 18px 18px;background:radial-gradient(ellipse at 50% 90%,#ffbf4e99,#d5441838 42%,#090301 70%);box-shadow:inset 0 0 35px #000,0 0 65px #ff6a2530;opacity:.5}
          .pm-hud {
            border: 2px solid rgba(245,184,92,0.3);
            background: linear-gradient(180deg, rgba(65,31,20,0.96), rgba(30,14,11,0.97));
            box-shadow: 0 10px 0 rgba(18,7,4,0.7), 0 22px 50px rgba(0,0,0,0.38), inset 0 2px 0 rgba(255,224,171,0.11);
          }
          .pm-card {
            border: 2px solid rgba(239,178,91,0.24);
            background: linear-gradient(160deg, rgba(62,30,20,0.95), rgba(25,13,11,0.97));
            box-shadow: 0 10px 0 rgba(15,6,4,0.62), 0 24px 45px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,224,171,0.12);
          }
          .pm-stage {
            border: 3px solid rgba(255, 196, 103, 0.3);
            background:
              radial-gradient(circle at 50% 44%, rgba(255, 187, 77, 0.18), transparent 46%),
              repeating-linear-gradient(92deg,rgba(103,50,25,.96) 0 58px,rgba(78,34,18,.96) 58px 62px,rgba(116,59,30,.96) 62px 120px);
            box-shadow: 0 12px 0 rgba(24,9,4,0.72), 0 0 45px rgba(251, 146, 60, 0.16), inset 0 2px 0 rgba(255,224,171,0.16);
          }
          .pm-chip {
            border: 1px solid rgba(255,201,123,0.2);
            background: linear-gradient(180deg, rgba(255,210,142,0.12), rgba(68,28,16,0.14));
            box-shadow: 0 5px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18);
          }
          .pm-answer {
            border-width: 2px !important;
            box-shadow: 0 7px 0 rgba(0,0,0,0.28), 0 15px 26px rgba(0,0,0,0.24), inset 0 2px 0 rgba(255,255,255,0.12);
          }
          .pm-answer:not(:disabled):hover {
            transform: translateY(-3px);
            filter: saturate(1.2);
          }
          .pm-menu-card {
            border: 2px solid rgba(255,193,105,0.24);
            background: linear-gradient(180deg, rgba(65,31,20,0.97), rgba(25,12,9,0.98));
            box-shadow: 0 14px 0 rgba(0,0,0,0.28), 0 34px 70px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.14);
          }
          .pm-reward {
            border: 3px solid rgba(251, 191, 36, 0.4);
            background: linear-gradient(180deg, rgba(70,35,20,0.98), rgba(24,11,8,0.99));
            box-shadow: 0 18px 0 rgba(0,0,0,0.3), 0 0 90px rgba(251, 146, 60, 0.28), inset 0 2px 0 rgba(255,255,255,0.16);
          }
          @media(max-width:700px){.pm-kitchen-lamp{display:none}.pm-kitchen-shelf{top:78px;left:3%;font-size:17px;opacity:.55}.pm-oven-glow{right:-70px;top:20%;transform:scale(.7)}.pm-screen:after{top:48px;height:10px}}
        `}</style>
        {mode === "solo" && <SoloPizzaArena player={players[0]} question={question} timeLeft={timeLeft} roundSeconds={roundSeconds} onAnswer={answer} disabled={!gameStarted || locked || Boolean(winner)} />}
        {mode === "battle" && <BattleArena players={players} answered={battleAnswered} question={question} timeLeft={timeLeft} roundSeconds={roundSeconds} frozenPlayers={frozenPlayers} shuffledPlayers={shuffledPlayers} onUseSkill={useBattleSkill} onAnswer={answerBattle} disabled={!gameStarted || locked || Boolean(winner)} />}
      </div>
      <AnimatePresence>
        {winner && (
          <VictoryModal
            player={winner}
            mode={mode}
            elapsed={elapsed}
            onRestart={restart}
            onFinish={() => navigate("/games/pizza-master", { replace: true })}
          />
        )}
      </AnimatePresence>
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
