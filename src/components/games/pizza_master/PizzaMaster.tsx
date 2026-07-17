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
import { saveGameSessionConfig } from "../../../hooks/gameSession";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import pizzaGameSound from "../../../assets/sounds/pizza-game.m4a";
import wrongSound from "../../../assets/sounds/wrong.mp3";

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
};

function normalizeTeacherQuestions(items: TeacherPizzaQuestion[]): PizzaQuestion[] {
  return items
    .map((item, index) => {
      const prompt = String(item.question ?? item.prompt ?? "").trim();
      const options = (item.options ?? item.variants ?? []).map((option) => String(option).trim()).filter(Boolean).slice(0, 4);
      const answer = Number(item.answerIndex);
      if (!prompt || options.length !== 4 || !Number.isInteger(answer) || answer < 0 || answer > 3) return null;
      return { id: index + 1, prompt, options, answer };
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
        setQuestions(normalized.length > 0 ? normalized : PIZZA_QUESTIONS);
        setQuestionsReady(true);
      })
      .catch(() => {
        if (!active) return;
        setQuestions(PIZZA_QUESTIONS);
        setQuestionsReady(true);
      });

    return () => { active = false; };
    // loadQuestions ichki cache state'iga bog'liq; uni dependency qilish request loop hosil qiladi.
    // Teacher yoki akkaunt almashgandagina ro'yxat qayta yuklanishi kifoya.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherOrAdmin, user?.id]);

  useGameResultSubmission(
    Boolean(winner),
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
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
              radial-gradient(circle at 20% 15%, rgba(249, 115, 22, 0.22), transparent 30%),
              radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.18), transparent 32%),
              linear-gradient(180deg, #160f2f 0%, #231447 45%, #160c25 100%);
            background-size: 42px 42px, 42px 42px, auto, auto, auto;
          }
          .pm-hud {
            border: 3px solid rgba(255,255,255,0.14);
            background: linear-gradient(180deg, rgba(42, 32, 86, 0.92), rgba(23, 19, 55, 0.92));
            box-shadow: 0 14px 0 rgba(0,0,0,0.25), 0 22px 50px rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.14);
          }
          .pm-card {
            border: 3px solid rgba(255,255,255,0.12);
            background: linear-gradient(180deg, rgba(44, 35, 88, 0.9), rgba(24, 18, 50, 0.92));
            box-shadow: 0 12px 0 rgba(0,0,0,0.22), 0 26px 48px rgba(0,0,0,0.28), inset 0 2px 0 rgba(255,255,255,0.12);
          }
          .pm-stage {
            border: 3px solid rgba(255, 190, 75, 0.22);
            background:
              radial-gradient(circle at 50% 45%, rgba(251, 191, 36, 0.16), transparent 48%),
              linear-gradient(180deg, rgba(55, 41, 90, 0.9), rgba(25, 19, 55, 0.9));
            box-shadow: 0 12px 0 rgba(0,0,0,0.22), 0 0 45px rgba(251, 146, 60, 0.12), inset 0 2px 0 rgba(255,255,255,0.12);
          }
          .pm-chip {
            border: 2px solid rgba(255,255,255,0.16);
            background: linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
            box-shadow: 0 5px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18);
          }
          .pm-answer {
            border-width: 3px !important;
            box-shadow: 0 7px 0 rgba(0,0,0,0.28), 0 15px 26px rgba(0,0,0,0.24), inset 0 2px 0 rgba(255,255,255,0.12);
          }
          .pm-answer:not(:disabled):hover {
            transform: translateY(-3px);
            filter: saturate(1.2);
          }
          .pm-menu-card {
            border: 3px solid rgba(255,255,255,0.14);
            background: linear-gradient(180deg, rgba(46, 35, 90, 0.95), rgba(18, 16, 46, 0.96));
            box-shadow: 0 14px 0 rgba(0,0,0,0.28), 0 34px 70px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.14);
          }
          .pm-reward {
            border: 4px solid rgba(251, 191, 36, 0.34);
            background: linear-gradient(180deg, rgba(48, 34, 84, 0.98), rgba(20, 15, 44, 0.98));
            box-shadow: 0 18px 0 rgba(0,0,0,0.3), 0 0 90px rgba(251, 146, 60, 0.28), inset 0 2px 0 rgba(255,255,255,0.16);
          }
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
