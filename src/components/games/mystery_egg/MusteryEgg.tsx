import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { FaBolt, FaCheck, FaClock, FaCrown, FaLock, FaPause, FaPlay, FaRotateRight, FaStar, FaTrophy, FaUsers } from "react-icons/fa6";
import { eggLevels, getEggImage, getQuestionsForLevel } from "./eggData";
import type { EggLevel, EggMode, EggQuestion } from "./types";
import useContextPro from "../../../hooks/useContextPro";
import useGameQuestions from "../../../hooks/useGameQuestions";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import BattleArena from "./BattleArena";
import MysteryHub from "./MysteryHub";
import { RewardPill } from "./RewardSvg";
import { useMysteryEggAudio } from "./useMysteryEggAudio";
import "./mysteryEgg.css";

type Screen = "mode" | "battleSetup" | "levels" | "countdown" | "game" | "battle" | "finish" | "collection";
const LETTERS = ["A", "B", "C", "D"];

type RunSummary = {
  correct: number;
  attempts: number;
  accuracy: number;
  stars: 1 | 2 | 3;
  coins: number;
  baseCoins: number;
  comboBonus: number;
  bestCombo: number;
  perfect: boolean;
};

const calculateStars = (correct: number, attempts: number): 1 | 2 | 3 => {
  const accuracy = correct / Math.max(1, attempts);
  if (accuracy === 1) return 3;
  if (accuracy >= 0.8) return 2;
  return 1;
};

const readBestStars = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem("mystery-egg-level-stars") || "{}") as Record<string, number>;
  } catch {
    return {};
  }
};

function ModeSelect({ onSelect, onCollection }: { onSelect: (mode: EggMode) => void; onCollection: () => void }) {
  const forest = eggLevels[0];
  return (
    <main className="me-screen me-mode-screen">
      <div className="me-stars" />
      <motion.section className="me-mode-hero" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
        <div className="me-kicker"><FaStar /> SIRLI BILIM SARGUZASHTI</div>
        <div className="me-hero-egg-wrap">
          <span className="me-orbit me-orbit-one" /><span className="me-orbit me-orbit-two" />
          <img src={forest.images.base} alt="Mystery Egg" className="me-hero-egg" />
        </div>
        <h1>MYSTERY <span>EGG</span></h1>
        <p>Savollarga javob bering, qadimiy tuxumlarni yorib, ichidagi afsonaviy jonzotlarni ozod qiling.</p>
        <div className="me-mode-grid">
          <button className="me-mode-card solo" onClick={() => onSelect("solo")}>
            <span className="me-card-icon"><FaPlay /></span><span><b>Solo sarguzasht</b><small>9 ta sirli dunyoni o'zingiz zabt eting</small></span><i>BOSHLASH</i>
          </button>
          <button className="me-mode-card battle" onClick={() => onSelect("battle")}>
            <span className="me-card-icon"><FaUsers /></span><span><b>Battle mode</b><small>Ikki o'yinchi — bir savol, ikki tuxum</small></span><i>JANGNI BOSHLASH</i>
          </button>
        </div>
        <div className="me-mini-stats"><span><FaTrophy /> 9 ta level</span><span><FaBolt /> 305+ savol</span><span><FaCrown /> 9 jonzot</span></div>
        <div className="me-hub-links"><button onClick={onCollection}><FaCrown/> COLLECTION</button></div>
      </motion.section>
    </main>
  );
}

function BattleSetup({ names, onNames, onStart }: { names: [string,string]; onNames: (names:[string,string])=>void; onStart:()=>void }) {
  return <main className="me-screen me-setup"><div className="me-stars"/><motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}}><div className="me-kicker"><FaBolt/> BATTLE ARENA</div><h1>JANGCHILARNI TAYYORLANG</h1><p>Har bir o'yinchi o'z variantlaridan javob beradi. Birinchi tuxumni ochgan o'yinchi g'olib!</p><div className="me-versus-setup"><label className="blue"><span>1</span><small>PLAYER ONE</small><input value={names[0]} maxLength={18} onChange={(e)=>onNames([e.target.value,names[1]])}/></label><b>VS</b><label className="pink"><span>2</span><small>PLAYER TWO</small><input value={names[1]} maxLength={18} onChange={(e)=>onNames([names[0],e.target.value])}/></label></div><button className="me-primary-btn" disabled={!names[0].trim()||!names[1].trim()} onClick={onStart}><FaPlay/> TUXUMNI TANLASH</button></motion.section></main>;
}

function LevelSelect({ onChoose }: { onChoose: (level: EggLevel) => void }) {
  const [notice, setNotice] = useState("");
  const completed = Number(localStorage.getItem("mystery-egg-completed-level") || 0);
  const coins = Number(localStorage.getItem("mystery-egg-coins") || 0);
  const stars = Number(localStorage.getItem("mystery-egg-stars") || 0);
  const crystals = Number(localStorage.getItem("mystery-egg-crystals") || 0);
  const bestStars = readBestStars();
  const choose = (level: EggLevel) => {
    const unlocked = level.unlockedByDefault || completed >= level.id - 1;
    if (!unlocked) { setNotice(`${level.name} uchun avvalgi tuxumni oching`); return; }
    onChoose(level);
  };
  return (
    <main className="me-screen me-level-screen me-journey-screen">
      <div className="me-stars" />
      <header className="me-level-header no-back">
        <div><span>{completed}/9 DUNYO ZABT ETILDI</span><h1>SEHRLI OLAMLAR YO'LI</h1><p>Portal bo'ylab yuqoriga ko'taring va barcha sirli jonzotlarni uyg'oting</p></div>
        <div className="me-journey-wallet"><RewardPill type="coin" value={coins}/><RewardPill type="star" value={stars}/><RewardPill type="crystal" value={crystals}/></div>
      </header>
      <div className="me-map-legend"><span><i className="open"/> Ochiq dunyo</span><span><i className="done"/> Zabt etilgan</span><span><i className="closed"/> Qulflangan</span></div>
      <section className="me-journey-map">
        <div className="me-journey-line"><i style={{ height: `${Math.max(6, Math.min(100, ((Math.max(completed, 1) - 1) / 8) * 100))}%` }} /></div>
        {eggLevels.map((level, index) => {
          const locked = !level.unlockedByDefault && completed < level.id - 1;
          const done = completed >= level.id;
          const current = !locked && !done && level.id === Math.min(9, completed + 1);
          return (
            <motion.div key={level.slug} className={`me-journey-stop side-${index % 2 ? "right" : "left"} ${locked ? "locked" : ""} ${done ? "completed" : ""} ${current ? "current" : ""}`} style={{ "--egg-color": level.color, "--egg-glow": level.glow } as React.CSSProperties} initial={{ opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: .55 }}>
              <span className="me-map-checkpoint">{done ? <FaCheck/> : locked ? <FaLock/> : level.id}<i/></span>
              <button className="me-world-card" onClick={() => choose(level)}>
                <span className="me-world-index">WORLD {String(level.id).padStart(2,"0")}</span>
                <div className="me-world-portal"><span className="me-world-rune"/><span className="me-world-glow"/><img src={done ? level.images.hatched : level.images.base} alt={level.name}/>{locked && <span className="me-world-lock"><FaLock/></span>}</div>
                <div className="me-world-copy"><small>{level.difficulty} · {level.requiredCorrectAnswers} SAVOL</small><h2>{locked ? "SIRLI DUNYO" : level.name}</h2><p>{locked ? "Oldingi dunyo qo'riqchisini uyg'oting" : level.subtitle}</p>{done && <div className="me-world-rating" aria-label={`${bestStars[level.id] || 1} ta yulduz`}><span>ENG YAXSHI</span>{[1,2,3].map((star)=><FaStar key={star} className={star <= (bestStars[level.id] || 1) ? "earned" : ""}/>)}</div>}<div className="me-world-rewards"><RewardPill type="coin" value={level.id*50}/><RewardPill type="crystal" value={1}/></div><span className="me-world-action">{done ? "QAYTA O'YNASH" : locked ? "QULFLANGAN" : "PORTALGA KIRISH"} <FaPlay/></span></div>
              </button>
              {current && <span className="me-you-are-here"><FaStar/> SIZ SHU YERDASIZ</span>}
            </motion.div>
          );
        })}
        <div className="me-final-gate"><FaCrown/><b>AFSONAVIY COLLECTION</b><span>Barcha 9 jonzotni uyg'oting</span></div>
      </section>
      <AnimatePresence>{notice && <motion.div className="me-toast" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onAnimationComplete={() => window.setTimeout(() => setNotice(""), 1600)}>{notice}</motion.div>}</AnimatePresence>
    </main>
  );
}

function Countdown({ level, onDone }: { level: EggLevel; onDone: () => void }) {
  const [count, setCount] = useState(3);
  useEffect(() => { const id = window.setInterval(() => setCount((n) => { if (n <= 1) { window.clearInterval(id); window.setTimeout(onDone, 450); return 0; } return n - 1; }), 850); return () => window.clearInterval(id); }, [onDone]);
  return <main className="me-screen me-countdown" style={{ "--egg-color": level.color } as React.CSSProperties}><div className="me-stars" /><div className="me-countdown-rune" /><img src={level.images.base} alt="" /><p>LEVEL {level.id} · {level.name}</p><AnimatePresence mode="wait"><motion.b key={count} initial={{ scale: .25, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.8, opacity: 0 }}>{count || "BOSHLADIK!"}</motion.b></AnimatePresence><span>{level.requiredCorrectAnswers} ta to'g'ri javob · {level.difficulty} daraja</span></main>;
}

function SoloGame({ level, questions: suppliedQuestions, onFinish, onWrong, onCrack }: { level: EggLevel; questions: EggQuestion[]; onFinish: (summary: RunSummary) => void; onWrong: () => void; onCrack: () => void }) {
  const roundSeconds = level.id <= 2 ? 20 : level.id <= 5 ? 18 : level.id <= 7 ? 16 : 14;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(roundSeconds);
  const [paused, setPaused] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [comboBonus, setComboBonus] = useState(0);
  const [bonusPop, setBonusPop] = useState<{ key: number; amount: number } | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const lock = useRef(false);
  const questions = suppliedQuestions;
  const question = questions[questionIndex % questions.length];
  const progress = Math.min(100, Math.round((correct / level.requiredCorrectAnswers) * 100));
  const eggImage = getEggImage(level, progress);
  const nextQuestion = () => { setQuestionIndex((n) => n + 1); setSelected(null); setFeedback(null); setTimeLeft(roundSeconds); lock.current = false; };
  const answer = (index: number | null) => {
    if (lock.current || paused) return;
    lock.current = true; setSelected(index);
    const isCorrect = index === question.answerIndex;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextBestCombo = Math.max(bestCombo, nextStreak);
      const earnedComboCoins = nextStreak >= 2 ? Math.min(20, (nextStreak - 1) * 2) : 0;
      const nextComboBonus = comboBonus + earnedComboCoins;
      const nextProgress = Math.min(100, Math.round((nextCorrect / level.requiredCorrectAnswers) * 100));
      if (getEggImage(level,progress) !== getEggImage(level,nextProgress)) onCrack();
      setCorrect(nextCorrect); setStreak(nextStreak); setBestCombo(nextBestCombo); setComboBonus(nextComboBonus); setShakeKey((n) => n + 1);
      if (earnedComboCoins > 0) setBonusPop({ key: Date.now(), amount: earnedComboCoins });
      if (nextCorrect >= level.requiredCorrectAnswers) {
        const accuracy = Math.round((nextCorrect / nextAttempts) * 100);
        const stars = calculateStars(nextCorrect, nextAttempts);
        window.setTimeout(() => onFinish({ correct: nextCorrect, attempts: nextAttempts, accuracy, stars, baseCoins: level.id * 50, comboBonus: nextComboBonus, coins: level.id * 50 + nextComboBonus, bestCombo: nextBestCombo, perfect: stars === 3 }), 850);
        return;
      }
    } else {
      if (index !== null) onWrong();
      setStreak(0);
    }
    window.setTimeout(nextQuestion, 850);
  };
  useEffect(() => { if (paused || selected !== null) return; const id = window.setInterval(() => setTimeLeft((n) => { if (n <= 1) { window.clearInterval(id); window.setTimeout(() => answer(null), 0); return 0; } return n - 1; }), 1000); return () => window.clearInterval(id); });
  return (
    <main className="me-screen me-game-screen" style={{ "--egg-color": level.color } as React.CSSProperties}>
      <div className="me-stars" />
      <header className="me-game-header"><div className="me-game-title"><img src={level.images.base} alt="" /><span><small>LEVEL {level.id} · {level.difficulty}</small><b>{level.name}</b></span></div>{streak > 1 && <motion.div className="me-streak" initial={{ scale: .5 }} animate={{ scale: 1 }}><FaBolt /> {streak} COMBO <small>+{comboBonus} coin</small></motion.div>}<div className="me-question-count"><b>TO'G'RI JAVOB {correct} / {level.requiredCorrectAnswers}</b><span><i style={{ width: `${progress}%` }} /></span></div><div className={`me-timer ${timeLeft <= 5 ? "urgent" : ""}`}><FaClock /> {timeLeft}</div><button className="me-icon-btn" onClick={() => setPaused((v) => !v)}>{paused ? <FaPlay /> : <FaPause />}</button></header>
      <section className="me-arena">
        <div className="me-egg-zone"><div className="me-portal"><i /><i /><i /></div><div className="me-fireflies" /><div className="me-stage-ring" /><motion.img key={`${eggImage}-${shakeKey}`} src={eggImage} alt={`${progress}% yorilgan tuxum`} className="me-game-egg" initial={{ scale: .96 }} animate={{ scale: [1, 1.045, .98, 1], rotate: [0, -1.8, 1.8, 0] }} transition={{ duration: .55 }} /><AnimatePresence>{feedback && <motion.div className={`me-feedback ${feedback}`} initial={{ opacity: 0, scale: .5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}>{feedback === "correct" ? <><FaCheck /> AJOYIB!</> : "YANA URINIB KO'RING"}</motion.div>}{bonusPop && <motion.div key={bonusPop.key} className="me-combo-pop" initial={{ opacity: 0, scale: .65, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -35 }} transition={{ duration: .35 }} onAnimationComplete={() => window.setTimeout(() => setBonusPop(null), 450)}><FaBolt/> COMBO BONUS +{bonusPop.amount}</motion.div>}</AnimatePresence><div className="me-progress-number"><b>{progress}%</b><span>{progress < 20 ? "Tuxum uyg'onmoqda..." : progress < 60 ? "Yoriqlar paydo bo'ldi!" : progress < 100 ? "Sir ochilishiga oz qoldi!" : "Ochildi!"}</span></div></div>
        <div className="me-question-zone"><div className="me-subject"><FaStar /> {question.subject}<span>•</span>{level.difficulty}</div><motion.div key={question.id + questionIndex} className="me-question-card" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }}><small>SAVOL {questionIndex + 1}</small><h2>{question.question}</h2><div className="me-options">{question.options.map((option, index) => { const correctChoice = selected !== null && index === question.answerIndex; const wrongChoice = selected === index && index !== question.answerIndex; return <button key={option} disabled={lock.current || paused} onClick={() => answer(index)} className={`${correctChoice ? "correct" : ""} ${wrongChoice ? "wrong" : ""}`}><span>{LETTERS[index]}</span><b>{option}</b>{correctChoice && <FaCheck />}</button>; })}</div></motion.div><div className="me-tip"><FaBolt /><span><b>Sehr kuchi:</b> Har bir to'g'ri javob progressni {Math.round(100 / level.requiredCorrectAnswers)}% ga oshiradi.</span></div></div>
      </section>
      <AnimatePresence>{paused && <motion.div className="me-pause" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div><FaPause /><h2>O'yin to'xtatildi</h2><p>Davom etishga tayyor bo'lsangiz bosing</p><button onClick={() => setPaused(false)}><FaPlay /> DAVOM ETISH</button></div></motion.div>}</AnimatePresence>
    </main>
  );
}

function Finish({ level, winner, summary, onLevels, onRestart, onReveal, onApplause, onStopApplause }: { level: EggLevel; winner?: string | null; summary: RunSummary; onLevels: () => void; onRestart: () => void; onReveal: () => void; onApplause: () => void; onStopApplause: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const timers = [window.setTimeout(() => setPhase(1), 450), window.setTimeout(() => { setPhase(2); onReveal(); }, 1250), window.setTimeout(() => { setPhase(3); onApplause(); }, 2200)]; return () => { timers.forEach(clearTimeout); onStopApplause(); }; }, [onApplause,onReveal,onStopApplause]);
  return <main className={`me-screen me-finish phase-${phase}`}><div className="me-stars" />{phase >= 3 && <ReactConfetti recycle={false} numberOfPieces={420} gravity={.18} />}
    <div className="me-finish-light" /><motion.img src={phase >= 3 ? level.images.hatched : level.images.crack4} alt="Tuxum ochildi" className="me-finish-egg" animate={phase < 3 ? { rotate: [0, -3, 3, -5, 5, 0], scale: phase === 2 ? [1, 1.08, 1] : 1 } : { scale: [0.5, 1.15, 1], y: [30, -12, 0] }} transition={{ repeat: phase === 1 ? Infinity : 0, duration: phase === 1 ? .38 : .9 }} />
    <AnimatePresence>{phase >= 3 && <motion.section className="me-finish-card" style={{ "--egg-color": level.color } as React.CSSProperties} initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }}><div className="me-unlocked"><FaCrown /> {winner === null ? "BATTLE YAKUNLANDI" : winner ? "BATTLE G'OLIBI" : summary.perfect ? "PERFECT HATCH!" : "YANGI JONZOT OCHILDI"}</div><h1>{winner === null ? "DURRANG!" : winner ? `${winner.toUpperCase()} G'OLIB!` : `${level.name.toUpperCase()} OCHILDI!`}</h1><p>{winner === null ? "Hisoblar teng. Yana bir jangda g'olibni aniqlang!" : summary.perfect && !winner ? "Birorta ham xatosiz — noyob mukammal ochilish!" : `${level.subtitle} qo'riqchisi sizning bilimingiz tufayli uyg'ondi.`}</p><div className="me-finish-stars" aria-label={`${summary.stars} ta yulduz`}>{[1,2,3].map((star)=><motion.span key={star} className={star <= summary.stars ? "earned" : ""} initial={{ opacity: 0, scale: 0, rotate: -25 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .65 + star * .18, type: "spring" }}><FaStar/></motion.span>)}</div><div className="me-finish-rewards"><RewardPill type="coin" value={summary.coins}/><RewardPill type="star" value={summary.stars}/><RewardPill type="crystal" value={1}/></div>{summary.comboBonus > 0 && <div className="me-reward-breakdown"><span>Asosiy mukofot +{summary.baseCoins}</span><b><FaBolt/> Combo bonusi +{summary.comboBonus} coin</b></div>}<div className="me-result-row"><span><FaCheck /> {summary.correct}/{summary.attempts} javob</span><span><FaStar /> {summary.accuracy}% aniqlik</span><span><FaTrophy /> {summary.bestCombo > 1 ? `${summary.bestCombo}x combo` : `Level ${level.id}`}</span></div><div className="me-finish-actions"><button className="secondary" onClick={onRestart}><FaRotateRight /> QAYTA O'YNASH</button><button onClick={onLevels}>{level.id < 9 ? "KEYINGI LEVEL" : "TUXUMLAR SAHIFASI"} <FaPlay /></button></div></motion.section>}</AnimatePresence>
  </main>;
}

export default function MusteryEgg() {
  const { state: { user } } = useContextPro();
  const { loadQuestions } = useGameQuestions<TeacherEggQuestion>({ teacherId: user?.id });
  const { prepare, playMusic, stopMusic, playWrong, playCrack, playReveal, playApplause, stopApplause } = useMysteryEggAudio();
  const [screen, setScreen] = useState<Screen>("mode");
  const [mode, setMode] = useState<EggMode>("solo");
  const [level, setLevel] = useState(eggLevels[0]);
  const [names,setNames] = useState<[string,string]>([user?.username?.trim() || "Player One","Player Two"]);
  const [remoteQuestions,setRemoteQuestions] = useState<TeacherEggQuestion[]>([]);
  const [winner,setWinner] = useState<string | null>();
  const [result,setResult] = useState<{name:string;score:number;mode:string;summary:RunSummary} | null>(null);
  const [runSummary,setRunSummary] = useState<RunSummary | null>(null);
  useEffect(()=>{
    let active=true;
    void loadQuestions("mystery_egg").then((items)=>{if(active)setRemoteQuestions(items ?? [])});
    return()=>{active=false};
    // loadQuestions cache state bilan o'zgaradi; faqat akkaunt almashganda qayta yuklaymiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user?.id]);
  const questions = useMemo(()=>{ const teacher = remoteQuestions.filter((item)=>Number(item.level||1)===level.id).map((item,index)=>normalizeTeacherQuestion(item,index)).filter((item):item is EggQuestion=>Boolean(item)); return teacher.length ? teacher : getQuestionsForLevel(level.id); },[level.id,remoteQuestions]);
  useGameResultSubmission(Boolean(result) && mode === "solo","mystery-egg",result ? [{participant_name:result.name,participant_mode:result.mode,score:result.score,metadata:{level:level.id,coins:result.summary.coins,stars:result.summary.stars,accuracy:result.summary.accuracy,best_combo:result.summary.bestCombo,perfect:result.summary.perfect}}] : []);
  useEffect(() => { if (screen === "countdown" || screen === "game" || screen === "battle") playMusic(); else stopMusic(); }, [screen,playMusic,stopMusic]);
  const onMode = (next: EggMode) => { prepare(); setMode(next); setScreen(next === "battle" ? "battleSetup" : "levels"); };
  const startLevel = (next: EggLevel) => { playMusic(); setRunSummary(null); setLevel(next); setScreen("countdown"); };
  const countdownDone = useMemo(() => () => setScreen(mode === "battle" ? "battle" : "game"), [mode]);
  const award = (summary: RunSummary) => { localStorage.setItem("mystery-egg-completed-level", String(Math.max(level.id, Number(localStorage.getItem("mystery-egg-completed-level") || 0)))); localStorage.setItem("mystery-egg-coins",String(Number(localStorage.getItem("mystery-egg-coins")||0)+summary.coins)); localStorage.setItem("mystery-egg-stars",String(Number(localStorage.getItem("mystery-egg-stars")||0)+summary.stars)); localStorage.setItem("mystery-egg-crystals",String(Number(localStorage.getItem("mystery-egg-crystals")||0)+1)); const bestStars=readBestStars(); bestStars[level.id]=Math.max(bestStars[level.id]||0,summary.stars); localStorage.setItem("mystery-egg-level-stars",JSON.stringify(bestStars)); };
  const finish = (summary: RunSummary) => { award(summary); const name=names[0]||"Siz"; const score=level.id*100+summary.accuracy+summary.comboBonus; saveLocalResult(name,score,"1 o'yinchi",level.id); setWinner(undefined); setRunSummary(summary); setResult({name,score,mode:"1 o'yinchi",summary}); setScreen("finish"); };
  const battleWin = (name:string|null,scores:[number,number]) => { const bestScore=Math.max(...scores); const accuracy=Math.round(bestScore/Math.max(1,level.requiredCorrectAnswers)*100); const stars:1|2|3=bestScore>=level.requiredCorrectAnswers?3:bestScore>=Math.ceil(level.requiredCorrectAnswers*.6)?2:1; const summary:RunSummary={correct:bestScore,attempts:level.requiredCorrectAnswers,accuracy,stars,baseCoins:level.id*50,comboBonus:0,coins:level.id*50,bestCombo:0,perfect:stars===3}; award(summary); const participant=name??`${names[0]} & ${names[1]}`; const score=level.id*100+bestScore*10; setWinner(name); setRunSummary(summary); setResult({name:participant,score,mode:"2 o'yinchi",summary}); setScreen("finish"); };
  if (screen === "mode") return <ModeSelect onSelect={onMode} onCollection={() => setScreen("collection")} />;
  if (screen === "battleSetup") return <BattleSetup names={names} onNames={setNames} onStart={()=>setScreen("levels")}/>;
  if (screen === "collection") return <MysteryHub/>;
  if (screen === "levels") return <LevelSelect onChoose={startLevel} />;
  if (screen === "countdown") return <Countdown level={level} onDone={countdownDone} />;
  if (screen === "finish" && runSummary) return <Finish level={level} winner={winner} summary={runSummary} onLevels={() => { stopApplause(); setScreen("levels"); }} onRestart={() => { stopApplause(); setResult(null);setRunSummary(null);setScreen("countdown")}} onReveal={playReveal} onApplause={playApplause} onStopApplause={stopApplause} />;
  if (screen === "battle") return <BattleArena level={level} names={names} questions={questions} onWin={battleWin} onWrong={playWrong} onCrack={playCrack}/>;
  return <SoloGame level={level} questions={questions} onFinish={finish} onWrong={playWrong} onCrack={playCrack} />;
}

type TeacherEggQuestion = { id?: string; subject?: string; question?: string; prompt?: string; options?: string[]; variants?: string[]; answerIndex?: number; level?: number };
function normalizeTeacherQuestion(item:TeacherEggQuestion,index:number):EggQuestion|null { const question=String(item.question??item.prompt??"").trim(); const options=(item.options??item.variants??[]).map(String).map((v)=>v.trim()).filter(Boolean).slice(0,4); const answerIndex=Number(item.answerIndex); if(!question||options.length!==4||!Number.isInteger(answerIndex)||answerIndex<0||answerIndex>3)return null; return {id:1000+index,subject:item.subject?.trim()||"Teacher savoli",question,options:options as [string,string,string,string],answerIndex}; }
function saveLocalResult(name:string,score:number,mode:string,level:number){ const key="mystery-egg-local-leaderboard"; try { const current=JSON.parse(localStorage.getItem(key)||"[]") as Array<{id:string;participant_name:string;participant_mode:string;score:number;level:number;created_at:string}>; current.push({id:`local-${Date.now()}`,participant_name:name,participant_mode:mode,score,level,created_at:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(current.sort((a,b)=>b.score-a.score).slice(0,30))); } catch { localStorage.setItem(key,"[]"); } }
