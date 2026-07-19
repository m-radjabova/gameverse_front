import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaBolt, FaCheck, FaClock } from "react-icons/fa6";
import { getEggImage } from "./eggData";
import type { EggLevel, EggQuestion } from "./types";
import { CoinSvg, CrystalSvg, StarSvg } from "./RewardSvg";

const LETTERS = ["A", "B", "C", "D"];
type Props = { level: EggLevel; names: [string,string]; questions: EggQuestion[]; onWin: (winner: string | null, scores: [number,number]) => void; onWrong: () => void; onCrack: () => void };

export default function BattleArena({ level, names, questions, onWin, onWrong, onCrack }: Props) {
  const seconds = level.id <= 3 ? 18 : level.id <= 6 ? 16 : 14;
  const totalRounds = level.requiredCorrectAnswers;
  const [scores,setScores] = useState<[number,number]>([0,0]);
  const [round,setRound] = useState(0);
  const [time,setTime] = useState(seconds);
  const [answers,setAnswers] = useState<[number|null,number|null]>([null,null]);
  const [locked,setLocked] = useState(false);
  const firstAnswerRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const question = questions[round % questions.length];
  const progress = scores.map((score) => Math.min(100,Math.round(score / level.requiredCorrectAnswers * 100))) as [number,number];
  const optionOrders = (round % 2 === 0 ? [[0,1,2,3],[2,0,3,1]] : [[1,3,0,2],[3,2,1,0]]) as readonly [readonly number[],readonly number[]];
  const finishBattle = useCallback((finalScores:[number,number]) => {
    const winner = finalScores[0] === finalScores[1] ? null : names[finalScores[0] > finalScores[1] ? 0 : 1];
    onWin(winner,finalScores);
  },[names,onWin]);
  const scheduleTransition = (callback:()=>void,delay:number) => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current=window.setTimeout(callback,delay);
  };
  const next = useCallback((finalScores:[number,number]) => {
    if (round + 1 >= totalRounds) { finishBattle(finalScores); return; }
    firstAnswerRef.current=false;
    setRound((n)=>n+1);
    setAnswers([null,null]);
    setTime(seconds);
    setLocked(false);
  }, [finishBattle,round,seconds,totalRounds]);
  const answer = (player:number,index:number) => {
    if (firstAnswerRef.current || locked || answers[player] !== null) return;
    firstAnswerRef.current=true;
    setLocked(true);
    const nextAnswers = [...answers] as [number|null,number|null]; nextAnswers[player]=index; setAnswers(nextAnswers);
    if (index === question.answerIndex) {
      const nextScores = [...scores] as [number,number]; nextScores[player] += 1; setScores(nextScores);
      const oldProgress = Math.min(100,Math.round(scores[player] / level.requiredCorrectAnswers * 100));
      const newProgress = Math.min(100,Math.round(nextScores[player] / level.requiredCorrectAnswers * 100));
      if (getEggImage(level,oldProgress) !== getEggImage(level,newProgress)) onCrack();
      if (nextScores[player] >= level.requiredCorrectAnswers) {
        scheduleTransition(()=>finishBattle(nextScores),900);
        return;
      }
      scheduleTransition(()=>next(nextScores),700);
      return;
    }
    onWrong();
    scheduleTransition(()=>next(scores),700);
  };
  useEffect(()=>()=>{ if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current); },[]);
  useEffect(()=>{ if(locked)return; const id=window.setInterval(()=>setTime((n)=>Math.max(0,n-1)),1000); return()=>clearInterval(id)},[locked,round]);
  useEffect(()=>{ if(locked || time>0)return; firstAnswerRef.current=true; setLocked(true); scheduleTransition(()=>next(scores),700); },[time,locked,next,scores]);
  return <main className="me-screen me-battle" style={{"--egg-color":level.color} as React.CSSProperties}><div className="me-stars"/><header className="me-battle-head"><div className="me-battle-player blue"><span>{names[0].slice(0,1).toUpperCase()}</span><div><b>{names[0]}</b><small><StarSvg size={17}/>{scores[0]} ball</small></div></div><div className={`me-battle-clock ${time <= 5 ? "urgent" : ""}`}><FaClock/>{time}<small>ROUND {round+1}/{totalRounds}</small></div><div className="me-battle-player pink"><div><b>{names[1]}</b><small><CoinSvg size={17}/>{scores[1]} ball</small></div><span>{names[1].slice(0,1).toUpperCase()}</span></div></header>
    <section className="me-battle-question-bar"><div className="me-battle-subject"><CrystalSvg color={level.color} size={22}/>{question.subject}</div><motion.div key={round} className="me-shared-question" initial={{y:-16,opacity:0}} animate={{y:0,opacity:1}}><small>BIRINCHI JAVOB — BIRINCHI IMKONIYAT</small><h2>{question.question}</h2></motion.div><span className="me-round-rule"><FaBolt/> Kim birinchi bossa, raund o'shaniki</span></section>
    <section className="me-battle-grid"><PlayerSide player={0} name={names[0]} level={level} progress={progress[0]} score={scores[0]} question={question} order={optionOrders[0]} selected={answers[0]} roundLocked={locked} onAnswer={(i)=>answer(0,i)}/><div className="me-vs-divider"><span>VS</span></div><PlayerSide player={1} name={names[1]} level={level} progress={progress[1]} score={scores[1]} question={question} order={optionOrders[1]} selected={answers[1]} roundLocked={locked} onAnswer={(i)=>answer(1,i)}/></section>
  </main>;
}

function PlayerSide({player,name,level,progress,score,question,order,selected,roundLocked,onAnswer}:{player:number;name:string;level:EggLevel;progress:number;score:number;question:EggQuestion;order:readonly number[];selected:number|null;roundLocked:boolean;onAnswer:(index:number)=>void}){
  return <section className={`me-player-side player-${player}`}><div className="me-mini-progress"><span><i style={{width:`${progress}%`}}/></span><b>{progress}%</b></div><div className="me-battle-egg-wrap"><div className="me-portal"><i/><i/><i/></div><motion.img key={`${progress}-${score}`} src={getEggImage(level,progress)} alt={`${name} tuxumi`} animate={{rotate:[0,-2,2,0],scale:[1,1.04,1]}}/><AnimatePresence>{selected===question.answerIndex&&<motion.div className="me-battle-correct" initial={{scale:0}} animate={{scale:1}}><FaCheck/> +1</motion.div>}</AnimatePresence></div><div className="me-battle-options">{order.map((index)=>{const chosen=selected===index;const correct=chosen&&index===question.answerIndex;return <button key={index} disabled={roundLocked} onClick={()=>onAnswer(index)} className={correct?"correct":chosen?"wrong":""}><span>{LETTERS[index]}</span><b>{question.options[index]}</b>{correct&&<FaCheck/>}</button>})}</div><div className="me-player-energy"><FaBolt/> {score > 0 ? `${score} sehr kuchi` : "Javobni tanlang"}</div></section>;
}
