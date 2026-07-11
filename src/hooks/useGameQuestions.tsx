import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import { getAccessToken } from "../utils/auth";

type QuestionPayload<T> = {
  game_key?: string;
  teacher_id?: string | null;
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
    ["game-questions", gameKey, teacherId ?? "current-teacher"] as const,
};

function teacherParams(teacherId?: string) {
  return teacherId ? { teacher_id: teacherId } : undefined;
}

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

export async function fetchCurrentTeacherGameQuestions<T>(
  gameKey: string,
): Promise<T[] | null> {
  return fetchGameQuestions<T>(gameKey);
}

export async function fetchGameQuestionsByTeacher<T>(
  gameKey: string,
  teacherId?: string,
): Promise<T[] | null> {
  if (!getAccessToken()) return null;
  try {
    const { data } = await apiClient.get<QuestionPayload<T> | T[]>(toPath(gameKey), {
      params: teacherParams(teacherId),
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
    teacher_id: teacherId ?? null,
  };

  try {
    await apiClient.put<QuestionPayload<T>>(toPath(gameKey), payload, {
      params: teacherParams(teacherId),
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

  useEffect(() => {
    setQuestionsByGame({});
    setLoadingByGame({});
    setLoadedByGame({});
    setSavingByGame({});
  }, [teacherId]);

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
      if (teacherScoped && !teacherId) {
        return {
          ok: false,
          gameKey,
          questions,
          teacherId: undefined,
        };
      }

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

      if (teacherScoped && !getAccessToken()) {
        setQuestionsByGame((prev) => ({ ...prev, [gameKey]: [] }));
        setLoadedByGame((prev) => ({ ...prev, [gameKey]: true }));
        setLoadingByGame((prev) => ({ ...prev, [gameKey]: false }));
        return [];
      }

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
          teacherScoped
            ? fetchGameQuestionsByTeacher<T>(gameKey, scopedTeacherId)
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
      if (teacherScoped && !teacherId) {
        return false;
      }

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
