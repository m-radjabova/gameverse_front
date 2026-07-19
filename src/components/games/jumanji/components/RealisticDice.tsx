import "./realistic-dice.css";

const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

function DiceFace({ side, value }: { side: string; value: number }) {
  return (
    <div className={`real-dice-face real-dice-${side}`} aria-hidden="true">
      <div className="real-dice-face-shine" />
      {PIPS[value].map((position) => (
        <i key={position} className={`real-dice-pip pip-${position}`} />
      ))}
    </div>
  );
}

function RealisticDice({ value }: { value: number }) {
  const safeValue = Math.max(1, Math.min(6, Math.round(value)));
  const topValue = safeValue === 1 || safeValue === 6 ? 3 : 6;
  const rightValue = safeValue === 2 || safeValue === 5 ? 4 : 2;

  return (
    <div className="real-dice-scene" role="img" aria-label={`Zar natijasi: ${safeValue}`}>
      <div className="real-dice-floor-shadow" />
      <div className="real-dice-cube">
        <DiceFace side="front" value={safeValue} />
        <DiceFace side="back" value={7 - safeValue} />
        <DiceFace side="right" value={rightValue} />
        <DiceFace side="left" value={7 - rightValue} />
        <DiceFace side="top" value={topValue} />
        <DiceFace side="bottom" value={7 - topValue} />
      </div>
    </div>
  );
}

export default RealisticDice;
