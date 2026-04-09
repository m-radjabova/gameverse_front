const LAST_PLAYED_GAME_KEY = "gameverse-last-played-game";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export interface LastPlayedGame {
  gameId: string | null;
  playedAt: number | null;
}

export function readLastPlayedGame(): LastPlayedGame {
  if (!canUseStorage()) {
    return { gameId: null, playedAt: null };
  }

  try {
    const raw = window.localStorage.getItem(LAST_PLAYED_GAME_KEY);

    if (!raw) {
      return { gameId: null, playedAt: null };
    }

    const parsed = JSON.parse(raw) as Partial<LastPlayedGame>;

    return {
      gameId: typeof parsed.gameId === "string" ? parsed.gameId : null,
      playedAt: typeof parsed.playedAt === "number" ? parsed.playedAt : null,
    };
  } catch {
    return { gameId: null, playedAt: null };
  }
}

export function writeLastPlayedGame(gameId: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    LAST_PLAYED_GAME_KEY,
    JSON.stringify({
      gameId,
      playedAt: Date.now(),
    } satisfies LastPlayedGame),
  );
}
