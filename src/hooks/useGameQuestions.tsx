import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import { getAccessToken } from "../utils/auth";

type QuestionPayload<T> = {
  game_key?: string;
  teacher_id?: string;
  questions?: T[];
  data?: T[];
};

type UseGameQuestionsOptions = {
  teacherId?: string;
};

type LoadQuestionsOptions = {
  force?: boolean;
  teacherScoped?: boolean;
};

const toPath = (gameKey: string) => `/game-questions/${encodeURIComponent(gameKey)}`;

const gameQuestionsKeys = {
  list: (gameKey: string, teacherId?: string) =>
    ["game-questions", gameKey, teacherId ?? "global"] as const,
};

function extractQuestions<T>(payload: unknown): T[] | null {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return null;
  const body = payload as QuestionPayload<T>;
  if (Array.isArray(body.questions)) return body.questions;
  if (Array.isArray(body.data)) return body.data;
  return null;
}

export async function fetchGameQuestions<T>(gameKey: string): Promise<T[] | null> {
  if (!getAccessToken()) return null;
  try {
    const { data } = await apiClient.get<QuestionPayload<T> | T[]>(toPath(gameKey));
    return extractQuestions<T>(data);
  } catch {
    return null;
  }
}

export async function fetchGameQuestionsByTeacher<T>(
  gameKey: string,
  teacherId: string,
): Promise<T[] | null> {
  if (!getAccessToken()) return null;
  try {
    const { data } = await apiClient.get<QuestionPayload<T> | T[]>(toPath(gameKey), {
      params: { teacher_id: teacherId },
    });
    return extractQuestions<T>(data);
  } catch {
    return null;
  }
}

export async function saveGameQuestions<T>(
  gameKey: string,
  questions: T[],
  teacherId?: string,
): Promise<boolean> {
  if (!getAccessToken()) return false;
  const payload: QuestionPayload<T> = {
    questions,
    ...(teacherId ? { teacher_id: teacherId } : {}),
  };

  try {
    await apiClient.put<QuestionPayload<T>>(toPath(gameKey), payload, {
      params: teacherId ? { teacher_id: teacherId } : undefined,
    });
    return true;
  } catch {
    return false;
  }
}

export default function useGameQuestions<T>({
  teacherId,
}: UseGameQuestionsOptions = {}) {
  const queryClient = useQueryClient();
  const [questionsByGame, setQuestionsByGame] = useState<Record<string, T[]>>({});
  const [loadingByGame, setLoadingByGame] = useState<Record<string, boolean>>({});
  const [loadedByGame, setLoadedByGame] = useState<Record<string, boolean>>({});
  const [savingByGame, setSavingByGame] = useState<Record<string, boolean>>({});

  const saveQuestionsMutation = useMutation({
    mutationFn: async ({
      gameKey,
      questions,
      teacherScoped,
    }: {
      gameKey: string;
      questions: T[];
      teacherScoped: boolean;
    }) => {
      const scopedTeacherId = teacherScoped && teacherId ? teacherId : undefined;
      const ok = await saveGameQuestions(gameKey, questions, scopedTeacherId);

      return {
        ok,
        gameKey,
        questions,
        teacherId: scopedTeacherId,
      };
    },
    onSuccess: async ({ ok, gameKey, questions, teacherId: scopedTeacherId }) => {
      if (!ok) {
        return;
      }

      queryClient.setQueryData(
        gameQuestionsKeys.list(gameKey, scopedTeacherId),
        questions,
      );
      await queryClient.invalidateQueries({
        queryKey: gameQuestionsKeys.list(gameKey, scopedTeacherId),
      });
    },
  });

  const loadQuestions = useCallback(
    async (
      gameKey: string,
      { force = false, teacherScoped = Boolean(teacherId) }: LoadQuestionsOptions = {},
    ) => {
      const scopedTeacherId = teacherScoped && teacherId ? teacherId : undefined;
      const queryKey = gameQuestionsKeys.list(gameKey, scopedTeacherId);
      const cachedQuestions = queryClient.getQueryData<T[]>(queryKey);

      if (!force && cachedQuestions) {
        setQuestionsByGame((prev) => ({ ...prev, [gameKey]: cachedQuestions }));
        setLoadedByGame((prev) => ({ ...prev, [gameKey]: true }));
        setLoadingByGame((prev) => ({ ...prev, [gameKey]: false }));
        return cachedQuestions;
      }

      if (!force && loadedByGame[gameKey]) {
        return questionsByGame[gameKey] ?? [];
      }

      setLoadingByGame((prev) => ({ ...prev, [gameKey]: true }));

      const items = await queryClient.fetchQuery({
        queryKey,
        queryFn: () =>
          teacherScoped && teacherId
            ? fetchGameQuestionsByTeacher<T>(gameKey, teacherId)
            : fetchGameQuestions<T>(gameKey),
      });

      const nextItems = items ?? [];
      setQuestionsByGame((prev) => ({ ...prev, [gameKey]: nextItems }));
      setLoadedByGame((prev) => ({ ...prev, [gameKey]: true }));
      setLoadingByGame((prev) => ({ ...prev, [gameKey]: false }));
      return nextItems;
    },
    [loadedByGame, queryClient, questionsByGame, teacherId],
  );

  const saveQuestionsForGame = useCallback(
    async (gameKey: string, questions: T[], teacherScoped = Boolean(teacherId)) => {
      setSavingByGame((prev) => ({ ...prev, [gameKey]: true }));
      const { ok } = await saveQuestionsMutation.mutateAsync({
        gameKey,
        questions,
        teacherScoped,
      });
      setSavingByGame((prev) => ({ ...prev, [gameKey]: false }));

      if (!ok) {
        return false;
      }

      setQuestionsByGame((prev) => ({ ...prev, [gameKey]: questions }));
      setLoadedByGame((prev) => ({ ...prev, [gameKey]: true }));
      return true;
    },
    [saveQuestionsMutation, teacherId],
  );

  const setQuestionsForGame = useCallback((gameKey: string, questions: T[]) => {
    setQuestionsByGame((prev) => ({ ...prev, [gameKey]: questions }));
    setLoadedByGame((prev) => ({ ...prev, [gameKey]: true }));
    queryClient.setQueryData(gameQuestionsKeys.list(gameKey, teacherId), questions);
  }, [queryClient, teacherId]);

  const getQuestions = useCallback(
    (gameKey: string) => questionsByGame[gameKey] ?? [],
    [questionsByGame],
  );

  const anyLoading = useMemo(
    () => Object.values(loadingByGame).some(Boolean),
    [loadingByGame],
  );
  const anySaving = useMemo(
    () => Object.values(savingByGame).some(Boolean),
    [savingByGame],
  );

  return {
    questionsByGame,
    getQuestions,
    loadQuestions,
    saveQuestionsForGame,
    setQuestionsForGame,
    loadingByGame,
    loadedByGame,
    savingByGame,
    anyLoading,
    anySaving,
  };
}
