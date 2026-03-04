import jumanjiBoardImage from "../../../../assets/jumanji_board.png";

export const JUMANJI_MAP_IMAGE = jumanjiBoardImage;

export const BOARD_TOKEN_SIZE = 7;
export const BOARD_TOKEN_NUDGE_X = 0;
export const BOARD_TOKEN_NUDGE_Y = -0.35;

export const BOARD_STACK_OFFSETS: [number, number][] = [
  [0, 0],
  [3.2, 0],
  [-3.2, 0],
  [6.2, 0],
  [-6.2, 0],
];

export type RoadPoint = { x: number; y: number };

export const createRoadPoints = (tileCount: number): RoadPoint[] => {
  const total = Math.max(2, tileCount);
  const xCenter = 50;
  const baseAmplitude = 22;
  const yStart = 90;
  const yEnd = 30;
  const turns = Math.max(3.4, Math.min(5.8, total / 5.5));
  const phase = -Math.PI / 2;

  return Array.from({ length: total }, (_, idx) => {
    const t = idx / (total - 1);
    const angle = phase + t * turns * Math.PI;
    const amplitude = baseAmplitude * (0.96 - t * 0.16);

    const baseX = xCenter + Math.sin(angle) * amplitude;
    const baseY = yStart - (yStart - yEnd) * t;

    // Gentle jitter keeps the path organic but continuous.
    const xJitter = Math.sin(angle * 1.35) * 0.55;
    const yJitter = Math.cos(angle * 2.1) * 0.7;

    return {
      x: Number((baseX + xJitter).toFixed(2)),
      y: Number((baseY + yJitter).toFixed(2)),
    };
  });
};
