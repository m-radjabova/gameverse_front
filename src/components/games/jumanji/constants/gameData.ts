import fireMedallion from "../../../../assets/fire_medallion_transparent-Photoroom.png";
import leafMedallion from "../../../../assets/leaf_medallion_transparent-Photoroom.png";
import maskMedallion from "../../../../assets/mask_medallion_transparent-Photoroom.png";
import snakeMedallion from "../../../../assets/snake_medallion_transparent-Photoroom.png";
import type { Tile, TileType } from "../types";

export const TEAM_AVATARS = ["🦁", "🐅", "🐘", "🦊"];
export const TEAM_TITLES = ["AZURE", "EMERALD", "CRIMSON", "ONYX"];

export const TEAM_COLORS = [
  {
    primary: "from-amber-500 to-yellow-500",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    primary: "from-red-500 to-rose-500",
    text: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  {
    primary: "from-green-500 to-emerald-500",
    text: "text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  {
    primary: "from-purple-500 to-pink-500",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
];

export const TEAM_MEDALLIONS = [
  fireMedallion,
  leafMedallion,
  maskMedallion,
  snakeMedallion,
];

export const DICE_ROLL_TICK_MS = 120;
export const DICE_ROLL_STEPS = 12;
export const MOVE_STEP_DURATION_MS = 460;
export const MOVE_FINISH_BUFFER_MS = 160;

const TILE_STYLES: Record<TileType, Omit<Tile, "id" | "type">> = {
  question: {
    icon: "Q",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  bonus: {
    icon: "B",
    color: "from-green-500 to-emerald-500",
    name: "BONUS",
  },
  trap: {
    icon: "T",
    color: "from-red-500 to-rose-500",
    name: "TUZOQ",
  },
  challenge: {
    icon: "C",
    color: "from-purple-500 to-pink-500",
    name: "CHALLENGE",
  },
  boss: {
    icon: "X",
    color: "from-red-600 to-amber-600",
    name: "BOSS",
  },
};

const SPECIAL_CYCLE: TileType[] = ["bonus", "trap", "question", "challenge", "question"];

export const createTiles = (questionCount: number): Tile[] => {
  // Board length follows question count, with a minimum path for stable gameplay.
  const playableTileCount = Math.max(20, questionCount);
  const specialCount = Math.max(4, Math.round(playableTileCount * 0.22));
  const spacing = Math.max(3, Math.floor((playableTileCount - 2) / specialCount));

  const specialIndexes = new Set<number>();
  for (let i = 1; i <= specialCount; i++) {
    const idx = Math.min(playableTileCount - 2, i * spacing);
    specialIndexes.add(idx);
  }

  let specialSlot = 0;

  const tiles: Tile[] = Array.from({ length: playableTileCount }, (_, idx) => {
    let type: TileType = "question";

    if (idx > 0 && specialIndexes.has(idx)) {
      type = SPECIAL_CYCLE[specialSlot % SPECIAL_CYCLE.length];
      specialSlot += 1;
    }

    const style = TILE_STYLES[type];
    return {
      id: idx + 1,
      type,
      icon: style.icon,
      color: style.color,
      name: style.name,
    };
  });

  const bossStyle = TILE_STYLES.boss;
  tiles.push({
    id: playableTileCount + 1,
    type: "boss",
    icon: bossStyle.icon,
    color: bossStyle.color,
    name: bossStyle.name,
  });

  return tiles;
};

export const SUBJECTS = [
  "Matematika",
  "Ingliz tili",
  "Rus tili",
  "Ona tili",
  "Tarix",
  "Geografiya",
  "Biologiya",
];
