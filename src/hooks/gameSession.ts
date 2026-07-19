export type ParticipantType = "player" | "team";
export type GameQuestionDifficulty = "easy" | "medium" | "hard";

export type GameSessionConfig = {
  gameId: string;
  participantCount: number;
  participantType: ParticipantType;
  participantLabel: string;
  participantLabels: string[];
  questionDifficulty: GameQuestionDifficulty;
  selectedAt: string;
};

type ParsedPlayersInfo = {
  min: number;
  max: number;
  participantType: ParticipantType;
  participantLabel: string;
};

const STORAGE_KEY_PREFIX = "game-session:";
const DIFFICULTY_STORAGE_KEY_PREFIX = "game-question-difficulty:";
const sessionCache = new Map<string, GameSessionConfig>();

const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  player: "o'yinchi",
  team: "jamoa",
};

export function parsePlayersInfo(playersLabel: string): ParsedPlayersInfo | null {
  const match =
    playersLabel.match(/(\d+)\s*-\s*(\d+)\s*(o'yinchi|jamoa|guruh)/i) ??
    playersLabel.match(/(\d+)\s*(o'yinchi|jamoa|guruh)/i);

  if (!match) {
    return null;
  }

  const min = Number(match[1]);
  const max = match[2] ? Number(match[2]) : min;
  const rawLabel = (match[3] ?? match[2] ?? "").toLowerCase();
  const participantType: ParticipantType =
    rawLabel === "o'yinchi" ? "player" : "team";

  return {
    min,
    max,
    participantType,
    participantLabel: PARTICIPANT_LABELS[participantType],
  };
}

export function buildParticipantOptions(playersLabel: string) {
  const parsed = parsePlayersInfo(playersLabel);

  if (!parsed) {
    return [];
  }

  return Array.from({ length: Math.max(0, parsed.max - parsed.min + 1) }, (_, index) => {
    const count = parsed.min + index;
    return {
      count,
      participantType: parsed.participantType,
      participantLabel: parsed.participantLabel,
      label: `${count} ${parsed.participantLabel}`,
    };
  });
}

export function supportsSinglePlayerMode(playersLabel: string): boolean {
  const parsed = parsePlayersInfo(playersLabel);
  return Boolean(parsed && parsed.participantType === "player" && parsed.min === 1);
}

const LEADERBOARD_DISABLED_GAME_IDS = new Set(["jumanji", "treasure-hunt"]);

export function supportsGameLeaderboard(gameId: string, playersLabel: string): boolean {
  return !LEADERBOARD_DISABLED_GAME_IDS.has(gameId) && supportsSinglePlayerMode(playersLabel);
}

export function getGameSessionConfig(gameId: string): GameSessionConfig | null {
  const cached = sessionCache.get(gameId);
  if (cached) {
    return cached;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameId}`);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameSessionConfig;
    sessionCache.set(gameId, parsed);
    return parsed;
  } catch {
    window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${gameId}`);
    return null;
  }
}

export function saveGameSessionConfig(config: GameSessionConfig) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${config.gameId}`,
      JSON.stringify(config),
    );
  }

  sessionCache.set(config.gameId, config);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("game-session-updated", { detail: config }));
  }
}

export function getGameQuestionDifficulty(gameId: string): GameQuestionDifficulty {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(`${DIFFICULTY_STORAGE_KEY_PREFIX}${gameId}`);
    if (stored === "easy" || stored === "medium" || stored === "hard") return stored;
  }
  return getGameSessionConfig(gameId)?.questionDifficulty ?? "easy";
}

export function saveGameQuestionDifficulty(gameId: string, difficulty: GameQuestionDifficulty) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${DIFFICULTY_STORAGE_KEY_PREFIX}${gameId}`, difficulty);
}
