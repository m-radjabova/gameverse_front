import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { AdminGameComment, GameComment, GameRatingSummary } from "../types/types";
import { getAccessToken } from "../utils/auth";

type RatingSummaryResponse = {
  game_key: string;
  average_rating: number;
  ratings_count: number;
  my_rating?: number | null;
};

type CommentsResponse = {
  items?: GameComment[];
  comments?: GameComment[];
};

type AdminCommentsResponse = {
  items?: AdminGameComment[];
};

const toSummaryPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/summary`;
const toCommentsPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/comments`;
const toMyFeedbackPath = (gameKey: string) =>
  `/game-feedback/${encodeURIComponent(gameKey)}/my`;
const toRecentCommentsPath = "/game-feedback/recent";
const toPendingCommentsPath = "/game-feedback/admin/pending";
const toApprovedCommentsPath = "/game-feedback/admin/approved";
const toApproveCommentPath = (feedbackId: string) =>
  `/game-feedback/admin/${encodeURIComponent(feedbackId)}/approve`;
const toRejectCommentPath = (feedbackId: string) =>
  `/game-feedback/admin/${encodeURIComponent(feedbackId)}/reject`;
const toUnapproveCommentPath = (feedbackId: string) =>
  `/game-feedback/admin/${encodeURIComponent(feedbackId)}/unapprove`;

const gameFeedbackKeys = {
  summary: (gameKey: string) => ["game-feedback", gameKey, "summary"] as const,
  comments: (gameKey: string) => ["game-feedback", gameKey, "comments"] as const,
  recent: (limit: number) => ["game-feedback", "recent", limit] as const,
  pending: ["game-feedback", "admin", "pending"] as const,
  approved: ["game-feedback", "admin", "approved"] as const,
};

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

export async function fetchGameComments(gameKey: string): Promise<GameComment[]> {
  try {
    const { data } = await apiClient.get<CommentsResponse>(toCommentsPath(gameKey));
    const items = data?.items ?? data?.comments ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function fetchRecentGameComments(limit = 20): Promise<GameComment[]> {
  try {
    const { data } = await apiClient.get<CommentsResponse>(toRecentCommentsPath, {
      params: { limit },
    });
    const items = data?.items ?? data?.comments ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function fetchPendingGameComments(): Promise<AdminGameComment[]> {
  try {
    const { data } = await apiClient.get<AdminCommentsResponse>(toPendingCommentsPath);
    const items = data?.items ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function fetchApprovedGameComments(): Promise<AdminGameComment[]> {
  try {
    const { data } = await apiClient.get<AdminCommentsResponse>(toApprovedCommentsPath);
    const items = data?.items ?? [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function approveGameComment(feedbackId: string): Promise<boolean> {
  try {
    await apiClient.post(toApproveCommentPath(feedbackId));
    return true;
  } catch {
    return false;
  }
}

export async function rejectGameComment(feedbackId: string): Promise<boolean> {
  try {
    await apiClient.delete(toRejectCommentPath(feedbackId));
    return true;
  } catch {
    return false;
  }
}

export async function unapproveGameComment(feedbackId: string): Promise<boolean> {
  try {
    await apiClient.post(toUnapproveCommentPath(feedbackId));
    return true;
  } catch {
    return false;
  }
}

export async function submitMyGameFeedback(
  gameKey: string,
  payload: { rating: number; comment: string },
): Promise<boolean> {
  if (!getAccessToken()) return false;
  try {
    await apiClient.put(toMyFeedbackPath(gameKey), payload);
    return true;
  } catch {
    return false;
  }
}

export default function useGameFeedback(gameKey: string) {
  const queryClient = useQueryClient();
  const enabled = Boolean(gameKey);

  const summaryQuery = useQuery({
    queryKey: gameFeedbackKeys.summary(gameKey),
    queryFn: () => fetchGameRatingSummary(gameKey),
    enabled,
  });

  const commentsQuery = useQuery({
    queryKey: gameFeedbackKeys.comments(gameKey),
    queryFn: () => fetchGameComments(gameKey),
    enabled,
  });

  const reload = useCallback(async () => {
    const [summaryData, commentsData] = await Promise.all([
      queryClient.fetchQuery({
        queryKey: gameFeedbackKeys.summary(gameKey),
        queryFn: () => fetchGameRatingSummary(gameKey),
      }),
      queryClient.fetchQuery({
        queryKey: gameFeedbackKeys.comments(gameKey),
        queryFn: () => fetchGameComments(gameKey),
      }),
    ]);

    return { summary: summaryData, comments: commentsData };
  }, [gameKey, queryClient]);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (payload: { rating: number; comment: string }) =>
      submitMyGameFeedback(gameKey, payload),
    onSuccess: async (ok) => {
      if (!ok) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.summary(gameKey) }),
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.comments(gameKey) }),
      ]);
    },
  });

  const submitFeedback = useCallback(
    (payload: { rating: number; comment: string }) =>
      submitFeedbackMutation.mutateAsync(payload),
    [submitFeedbackMutation],
  );

  return {
    loading:
      summaryQuery.isLoading ||
      commentsQuery.isLoading ||
      summaryQuery.isFetching ||
      commentsQuery.isFetching,
    submitting: submitFeedbackMutation.isPending,
    summary: summaryQuery.data ?? null,
    comments: commentsQuery.data ?? [],
    reload,
    submitFeedback,
  };
}

export function useRecentGameFeedback(limit = 20) {
  const query = useQuery({
    queryKey: gameFeedbackKeys.recent(limit),
    queryFn: () => fetchRecentGameComments(limit),
  });

  return {
    loading: query.isLoading || query.isFetching,
    comments: query.data ?? [],
  };
}

export function useAdminPendingGameFeedback() {
  const queryClient = useQueryClient();
  const pendingQuery = useQuery({
    queryKey: gameFeedbackKeys.pending,
    queryFn: fetchPendingGameComments,
  });

  const approveMutation = useMutation({
    mutationFn: (feedbackId: string) => approveGameComment(feedbackId),
    onSuccess: async (ok) => {
      if (!ok) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.pending }),
        queryClient.invalidateQueries({ queryKey: ["game-feedback"] }),
      ]);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (feedbackId: string) => rejectGameComment(feedbackId),
    onSuccess: async (ok) => {
      if (!ok) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.pending }),
        queryClient.invalidateQueries({ queryKey: ["game-feedback"] }),
      ]);
    },
  });

  return {
    loading: pendingQuery.isLoading || pendingQuery.isFetching,
    approving: approveMutation.isPending,
    rejecting: rejectMutation.isPending,
    comments: pendingQuery.data ?? [],
    approve: (feedbackId: string) => approveMutation.mutateAsync(feedbackId),
    reject: (feedbackId: string) => rejectMutation.mutateAsync(feedbackId),
  };
}

export function useAdminApprovedGameFeedback() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: gameFeedbackKeys.approved,
    queryFn: fetchApprovedGameComments,
  });

  const unapproveMutation = useMutation({
    mutationFn: (feedbackId: string) => unapproveGameComment(feedbackId),
    onSuccess: async (ok) => {
      if (!ok) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.approved }),
        queryClient.invalidateQueries({ queryKey: gameFeedbackKeys.pending }),
        queryClient.invalidateQueries({ queryKey: ["game-feedback"] }),
      ]);
    },
  });

  return {
    loading: query.isLoading || query.isFetching,
    unapproving: unapproveMutation.isPending,
    comments: query.data ?? [],
    unapprove: (feedbackId: string) => unapproveMutation.mutateAsync(feedbackId),
  };
}
