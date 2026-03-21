import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type {
  GameLeaderboardEntry,
  SubmitGameResultPayload,
} from "../types/types";

type LeaderboardResponse = {
  items?: GameLeaderboardEntry[];
  results?: GameLeaderboardEntry[];
};

const LOCAL_KEY_PREFIX = "game-leaderboard:";

const toLeaderboardPath = (gameKey: string) =>
  `/game-results/${encodeURIComponent(gameKey)}/leaderboard`;
const toSubmitPath = (gameKey: string) =>
  `/game-results/${encodeURIComponent(gameKey)}`;

const gameLeaderboardKeys = {
  all: (gameKey: string) => ["game-leaderboard", gameKey] as const,
  list: (gameKey: string, limit: number) => ["game-leaderboard", gameKey, limit] as const,
};

function getLocalKey(gameKey: string) {
  return `${LOCAL_KEY_PREFIX}${gameKey}`;
}

function clearLocalEntries(gameKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getLocalKey(gameKey));
}

function normalizeKeyPart(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getParticipantCountFromMode(mode: string | undefined) {
  const normalized = normalizeKeyPart(mode);
  const match = normalized.match(/\d+/);

  if (!match) {
    return null;
  }

  const count = Number.parseInt(match[0], 10);
  return Number.isNaN(count) ? null : count;
}

function getEntryMetadataValue(
  entry: GameLeaderboardEntry,
  key: string,
): unknown {
  return entry.metadata && typeof entry.metadata === "object"
    ? entry.metadata[key]
    : undefined;
}

export function isSinglePlayerLeaderboardEntry(entry: GameLeaderboardEntry) {
  const metadataSingle = getEntryMetadataValue(entry, "is_single_player");
  if (typeof metadataSingle === "boolean") {
    return metadataSingle;
  }

  const metadataCount = getEntryMetadataValue(entry, "participant_count");
  if (typeof metadataCount === "number") {
    return metadataCount === 1;
  }

  const mode = normalizeKeyPart(entry.participant_mode);
  const count = getParticipantCountFromMode(mode);

  if (count !== null) {
    return count === 1;
  }

  return (
    mode.includes("solo") ||
    mode.includes("single") ||
    mode.includes("individual") ||
    mode.includes("yakka")
  );
}

function normalizeSubmittedEntry(
  entry: SubmitGameResultPayload,
): SubmitGameResultPayload {
  const participantCountFromMode = getParticipantCountFromMode(entry.participant_mode);
  const metadata = {
    ...(entry.metadata ?? {}),
  };

  if (typeof metadata.participant_count !== "number" && participantCountFromMode !== null) {
    metadata.participant_count = participantCountFromMode;
  }

  if (typeof metadata.is_single_player !== "boolean") {
    if (typeof metadata.participant_count === "number") {
      metadata.is_single_player = metadata.participant_count === 1;
    } else if (participantCountFromMode !== null) {
      metadata.is_single_player = participantCountFromMode === 1;
    }
  }

  return {
    ...entry,
    metadata,
  };
}

function getBestEntries(entries: GameLeaderboardEntry[]) {
  const bestByParticipant = new Map<string, GameLeaderboardEntry>();

  for (const entry of entries) {
    const participantKey = [
      normalizeKeyPart(entry.participant_name),
      normalizeKeyPart(entry.participant_mode),
    ].join("::");
    const current = bestByParticipant.get(participantKey);

    if (!current || entry.score > current.score) {
      bestByParticipant.set(participantKey, entry);
      continue;
    }

    if (
      entry.score === current.score &&
      new Date(entry.created_at ?? 0).getTime() > new Date(current.created_at ?? 0).getTime()
    ) {
      bestByParticipant.set(participantKey, entry);
    }
  }

  return Array.from(bestByParticipant.values()).sort((left, right) => right.score - left.score);
}

export async function fetchGameLeaderboard(
  gameKey: string,
  limit = 10,
): Promise<GameLeaderboardEntry[]> {
  try {
    const { data } = await apiClient.get<LeaderboardResponse>(
      toLeaderboardPath(gameKey),
      { params: { limit } },
    );
    const items = data?.items ?? data?.results ?? [];
    if (Array.isArray(items) && items.length > 0) {
      return items.slice(0, limit);
    }
  } catch {
    return [];
  }

  return [];
}

export async function submitGameResult(
  gameKey: string,
  payload: SubmitGameResultPayload,
): Promise<boolean> {
  try {
    await apiClient.post(toSubmitPath(gameKey), normalizeSubmittedEntry(payload));
    clearLocalEntries(gameKey);
    return true;
  } catch {
    clearLocalEntries(gameKey);
    return false;
  }
}

export function useSubmitGameResultMutation(gameKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitGameResultPayload) => submitGameResult(gameKey, payload),
    onSuccess: async (ok) => {
      if (!ok) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: gameLeaderboardKeys.all(gameKey),
      });
    },
  });
}

export default function useGameLeaderboard(gameKey: string, limit = 100) {
  const queryClient = useQueryClient();

  const leaderboardQuery = useQuery({
    queryKey: gameLeaderboardKeys.list(gameKey, limit),
    queryFn: async () => {
      const data = await fetchGameLeaderboard(gameKey, limit);
      return getBestEntries(
        data.filter((entry) => !entry.game_key || entry.game_key === gameKey),
      );
    },
    enabled: Boolean(gameKey),
  });

  const reload = useCallback(async () => {
    return queryClient.fetchQuery({
      queryKey: gameLeaderboardKeys.list(gameKey, limit),
      queryFn: async () => {
        const data = await fetchGameLeaderboard(gameKey, limit);
        return getBestEntries(
          data.filter((entry) => !entry.game_key || entry.game_key === gameKey),
        );
      },
    });
  }, [gameKey, limit, queryClient]);

  useEffect(() => {
    clearLocalEntries(gameKey);
  }, [gameKey]);

  const entries = useMemo(
    () => leaderboardQuery.data ?? [],
    [leaderboardQuery.data],
  );
  const topThree = useMemo(() => entries.slice(0, 3), [entries]);

  return {
    entries,
    topThree,
    loading: leaderboardQuery.isLoading,
    reload,
  };
}
