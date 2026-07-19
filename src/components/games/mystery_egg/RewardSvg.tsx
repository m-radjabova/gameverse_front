export function CrystalSvg({ color = "#a855f7", size = 28 }: { color?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id={`cr-${color.replace("#", "")}`} x1="12" y1="8" x2="52" y2="58"><stop stopColor="#fff"/><stop offset=".22" stopColor={color}/><stop offset="1" stopColor="#32106b"/></linearGradient></defs><path d="M19 7h26l12 17-25 34L7 24 19 7Z" fill={`url(#cr-${color.replace("#", "")})`} stroke="#fff" strokeOpacity=".55" strokeWidth="2"/><path d="m19 7 5 17 8 34 8-34 5-17M7 24h50M24 24h16" stroke="#fff" strokeOpacity=".42" strokeWidth="2"/><path d="m16 17 6-7" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>;
}

export function CoinSvg({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="#8b4b05"/><circle cx="32" cy="29" r="25" fill="url(#coinGold)" stroke="#fff4a3" strokeWidth="2"/><circle cx="32" cy="29" r="18" stroke="#b86908" strokeWidth="2"/><path d="m32 14 4.2 8.6 9.5 1.4-6.9 6.7 1.7 9.5-8.5-4.5-8.5 4.5 1.7-9.5-6.9-6.7 9.5-1.4L32 14Z" fill="#fff1a0" stroke="#d18a0d"/><defs><linearGradient id="coinGold" x1="14" y1="8" x2="48" y2="53"><stop stopColor="#fff486"/><stop offset=".48" stopColor="#ffc52f"/><stop offset="1" stopColor="#ed850b"/></linearGradient></defs></svg>;
}

export function StarSvg({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 5 7.8 16 17.7 2.6-12.8 12.5 3 17.6L32 45.4l-15.7 8.3 3-17.6L6.5 23.6 24.2 21 32 5Z" fill="url(#starGold)" stroke="#fff6b2" strokeWidth="2"/><path d="m25 18 3-6" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><defs><linearGradient id="starGold" x1="14" y1="10" x2="48" y2="54"><stop stopColor="#fff69a"/><stop offset=".48" stopColor="#ffd52f"/><stop offset="1" stopColor="#f08313"/></linearGradient></defs></svg>;
}

export function RewardPill({ type, value }: { type: "coin" | "star" | "crystal"; value: number }) {
  return <span className={`me-reward-pill ${type}`}>{type === "coin" ? <CoinSvg size={25}/> : type === "star" ? <StarSvg size={25}/> : <CrystalSvg size={25}/>}<b>{value}</b></span>;
}
