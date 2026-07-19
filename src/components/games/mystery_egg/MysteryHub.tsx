import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa6";
import { eggLevels } from "./eggData";
import { CrystalSvg, RewardPill } from "./RewardSvg";

export default function MysteryHub() {
  const completed = Number(localStorage.getItem("mystery-egg-completed-level") || 0);
  const coins = Number(localStorage.getItem("mystery-egg-coins") || 0);
  const stars = Number(localStorage.getItem("mystery-egg-stars") || 0);
  const crystals = Number(localStorage.getItem("mystery-egg-crystals") || 0);
  return <main className="me-screen me-hub"><div className="me-stars"/><header className="me-hub-header no-back"><div><small>SIZNING XAZINANGIZ</small><h1>JONZOTLAR COLLECTION</h1></div><div className="me-wallet"><RewardPill type="coin" value={coins}/><RewardPill type="star" value={stars}/><RewardPill type="crystal" value={crystals}/></div></header>
    <section className="me-collection-grid">{eggLevels.map((level, index) => { const found = completed >= level.id; return <motion.article key={level.slug} className={`me-creature-card ${found ? "found" : "missing"}`} style={{ "--egg-color": level.color } as React.CSSProperties} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:index*.05}}><span className="me-collection-level">#{level.id}</span><div className="me-creature-image"><div className="me-collection-glow"/><img src={found ? level.images.hatched : level.images.base} alt={level.name} loading="lazy" decoding="async"/>{!found && <span className="me-big-lock"><FaLock/></span>}</div><h2>{found ? level.name : "???"}</h2><p>{found ? level.subtitle : "Bu jonzotni topish uchun tuxumni oching"}</p><div className="me-rarity"><CrystalSvg color={level.color} size={20}/>{level.difficulty}</div></motion.article>})}</section>
  </main>;
}
