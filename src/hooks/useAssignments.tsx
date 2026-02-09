import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { AssignmentOut, SubmissionOut } from "../types/types";
import {
  isValidHttpUrl,
  isValidUuid,
  toIsoDatetime,
  toNumberOrNull,
} from "../utils/validation";

export type AssignmentCreatePayload = {
  title: string;
  description?: string | null;
  order: number | string;
  due_at?: string | null;
  max_score?: number | string | null;
  is_required: boolean;
};

export type AssignmentUpdatePayload = Partial<AssignmentCreatePayload>;

export function useLessonAssignments(lessonId: string) {
  return useQuery<AssignmentOut[]>({
    queryKey: ["assignments", lessonId],
    queryFn: async () => (await apiClient.get(`/assignments/lessons/${lessonId}`)).data,
    enabled: !!lessonId,
  });
}

export function useAssignmentActions(lessonId: string) {
  const queryClient = useQueryClient();

  const createAssignment = useMutation({
    mutationFn: async (payload: AssignmentCreatePayload) => {
      if (!isValidUuid(lessonId)) {
        throw new Error("lesson_id UUID bo'lishi shart");
      }

      const order = toNumberOrNull(payload.order);
      const maxScore = toNumberOrNull(payload.max_score);
      const dueAt = toIsoDatetime(payload.due_at);

      if (order === null) {
        throw new Error("order number bo'lishi shart");
      }
      if (payload.max_score !== undefined && payload.max_score !== null && maxScore === null) {
        throw new Error("max_score number bo'lishi shart");
      }
      if (payload.due_at && !dueAt) {
        throw new Error("due_at ISO datetime bo'lishi shart");
      }

      return (
        await apiClient.post(`/assignments/lessons/${lessonId}`, {
          ...payload,
          order,
          max_score: maxScore,
          due_at: dueAt,
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments", lessonId] }),
  });

  const updateAssignment = useMutation({
    mutationFn: async ({
      assignmentId,
      payload,
    }: {
      assignmentId: string;
      payload: AssignmentUpdatePayload;
    }) => {
      const normalized: Record<string, unknown> = { ...payload };
      if (payload.order !== undefined) {
        const order = toNumberOrNull(payload.order);
        if (order === null) throw new Error("order number bo'lishi shart");
        normalized.order = order;
      }
      if (payload.max_score !== undefined) {
        const maxScore = toNumberOrNull(payload.max_score);
        if (payload.max_score !== null && maxScore === null) {
          throw new Error("max_score number bo'lishi shart");
        }
        normalized.max_score = maxScore;
      }
      if (payload.due_at !== undefined) {
        const dueAt = toIsoDatetime(payload.due_at);
        if (payload.due_at && !dueAt) throw new Error("due_at ISO datetime bo'lishi shart");
        normalized.due_at = dueAt;
      }

      return (await apiClient.patch(`/assignments/${assignmentId}`, normalized)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments", lessonId] }),
  });

  const deleteAssignment = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiClient.delete(`/assignments/${assignmentId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assignments", lessonId] }),
  });

  return {
    createAssignment: createAssignment.mutateAsync,
    updateAssignment: updateAssignment.mutateAsync,
    deleteAssignment: deleteAssignment.mutateAsync,
  };
}

export function useSubmissionActions(assignmentId: string) {
  const queryClient = useQueryClient();

  const mySubmission = useQuery<SubmissionOut | null>({
    queryKey: ["my-submission", assignmentId],
    queryFn: async () =>
      (await apiClient.get(`/assignments/${assignmentId}/my-submission`)).data,
    enabled: !!assignmentId,
    retry: false,
  });

  const submissions = useQuery<SubmissionOut[]>({
    queryKey: ["submissions", assignmentId],
    queryFn: async () =>
      (await apiClient.get(`/assignments/${assignmentId}/submissions`)).data,
    enabled: !!assignmentId,
  });

  const submitAssignment = useMutation({
    mutationFn: async (payload: { text_answer?: string; file_url?: string }) => {
      if (!payload.text_answer?.trim() && !payload.file_url?.trim()) {
        throw new Error("text_answer yoki file_url dan bittasi to'ldirilishi shart");
      }
      if (payload.file_url?.trim() && !isValidHttpUrl(payload.file_url.trim())) {
        throw new Error("file_url http/https bo'lishi shart");
      }
      return (await apiClient.post(`/assignments/${assignmentId}/submit`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-submission", assignmentId] });
      queryClient.invalidateQueries({ queryKey: ["submissions", assignmentId] });
    },
  });

  const gradeSubmission = useMutation({
    mutationFn: async ({
      submissionId,
      score,
      status,
    }: {
      submissionId: string;
      score: number | string;
      status: string;
    }) => {
      const normalizedScore = toNumberOrNull(score);
      if (normalizedScore === null) throw new Error("score number bo'lishi shart");
      return (
        await apiClient.post(`/assignments/submissions/${submissionId}/grade`, {
          score: normalizedScore,
          status,
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["submissions", assignmentId] }),
  });

  return {
    mySubmission,
    submissions,
    submitAssignment: submitAssignment.mutateAsync,
    gradeSubmission: gradeSubmission.mutateAsync,
  };
}
