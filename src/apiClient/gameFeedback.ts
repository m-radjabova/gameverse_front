import apiClient from "./apiClient";
import type { GameCommentOut, GameRatingSummary } from "../types/types";
import { getAccessToken } from "../utils/auth";

type RatingSummaryResponse = {
  game_key: string;
  average_rating: number;
  ratings_count: number;
  my_rating?: number | null;
};

type CommentsResponse = {
  items?: GameCommentOut[];
  comments?: GameCommentOut[];
};

type SubmitFeedbackPayload = {
  rating: number;
  comment: string;
};

const toSummaryPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/summary`;
const toCommentsPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/comments`;
const toMyFeedbackPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/my`;
const RECENT_PATH = "/game-feedback/recent";

export async function fetchGameRatingSummary(
  gameKey: string,
): Promise<GameRatingSummary | null> {
  try {
    const { data } = await apiClient.get<RatingSummaryResponse>(toSummaryPath(gameKey));
    if (!data || typeof data.average_rating !== "number" || typeof data.ratings_count !== "number") {
      return null;
    }
    return {
      game_key: data.game_key || gameKey,
      average_rating: data.average_rating,
      ratings_count: data.ratings_count,
      my_rating: data.my_rating ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchGameComments(gameKey: string): Promise<GameCommentOut[]> {
  try {
    const { data } = await apiClient.get<CommentsResponse>(toCommentsPath(gameKey));
    const items = data?.items ?? data?.comments ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function fetchRecentGameComments(limit = 20): Promise<GameCommentOut[]> {
  try {
    const { data } = await apiClient.get<CommentsResponse>(RECENT_PATH, {
      params: { limit },
    });
    const items = data?.items ?? data?.comments ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function submitMyGameFeedback(
  gameKey: string,
  payload: SubmitFeedbackPayload,
): Promise<boolean> {
  if (!getAccessToken()) return false;
  try {
    await apiClient.put(toMyFeedbackPath(gameKey), payload);
    return true;
  } catch {
    return false;
  }
}
