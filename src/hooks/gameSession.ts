export type ParticipantType = "player" | "team";

export type GameSessionConfig = {
  gameId: string;
  participantCount: number;
  participantType: ParticipantType;
  participantLabel: string;
  participantLabels: string[];
  selectedAt: string;
};

type ParsedPlayersInfo = {
  min: number;
  max: number;
  participantType: ParticipantType;
  participantLabel: string;
};

const STORAGE_KEY_PREFIX = "game-session:";
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
}
