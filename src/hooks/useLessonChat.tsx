import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { LessonChatMessageOut, LessonChatThreadOut } from "../types/types";

export function useMyLessonMessages(lessonId: string, enabled = true) {
  return useQuery<LessonChatMessageOut[]>({
    queryKey: ["lesson-chat", "lesson-messages", lessonId],
    queryFn: async () => (await apiClient.get(`/lesson-chat/lessons/${lessonId}/messages`)).data,
    enabled: !!lessonId && enabled,
    retry: false,
  });
}

export function useLessonThreads(lessonId: string, enabled = true) {
  return useQuery<LessonChatThreadOut[]>({
    queryKey: ["lesson-chat", "threads", lessonId],
    queryFn: async () => (await apiClient.get(`/lesson-chat/lessons/${lessonId}/threads`)).data,
    enabled: !!lessonId && enabled,
  });
}

export function useThreadMessages(threadId: string, enabled = true) {
  return useQuery<LessonChatMessageOut[]>({
    queryKey: ["lesson-chat", "thread-messages", threadId],
    queryFn: async () => (await apiClient.get(`/lesson-chat/threads/${threadId}/messages`)).data,
    enabled: !!threadId && enabled,
  });
}

export function useLessonChatActions(lessonId: string, threadId: string) {
  const queryClient = useQueryClient();

  const sendMyMessage = useMutation({
    mutationFn: async (text: string) => {
      const normalized = text.trim();
      if (!normalized) throw new Error("Xabar matni bo'sh bo'lmasligi kerak");
      return (
        await apiClient.post(`/lesson-chat/lessons/${lessonId}/messages`, {
          text: normalized,
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "lesson-messages", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "threads", lessonId] });
    },
  });

  const sendThreadMessage = useMutation({
    mutationFn: async (text: string) => {
      const normalized = text.trim();
      if (!normalized) throw new Error("Xabar matni bo'sh bo'lmasligi kerak");
      if (!threadId) throw new Error("Thread tanlanmagan");
      return (
        await apiClient.post(`/lesson-chat/threads/${threadId}/messages`, {
          text: normalized,
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "thread-messages", threadId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "threads", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "lesson-messages", lessonId] });
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ messageId, text }: { messageId: string; text: string }) => {
      const normalized = text.trim();
      if (!normalized) throw new Error("Xabar matni bo'sh bo'lmasligi kerak");
      return (await apiClient.patch(`/lesson-chat/messages/${messageId}`, { text: normalized })).data;
    },
    onSuccess: (updated: LessonChatMessageOut) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-chat", "thread-messages", updated.thread_id],
      });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "threads", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "lesson-messages", lessonId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async ({ messageId, targetThreadId }: { messageId: string; targetThreadId: string }) => {
      await apiClient.delete(`/lesson-chat/messages/${messageId}`);
      return { targetThreadId };
    },
    onSuccess: ({ targetThreadId }) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-chat", "thread-messages", targetThreadId],
      });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "threads", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-chat", "lesson-messages", lessonId] });
    },
  });

  return {
    sendMyMessage: sendMyMessage.mutateAsync,
    sendThreadMessage: sendThreadMessage.mutateAsync,
    updateMessage: updateMessage.mutateAsync,
    deleteMessage: deleteMessage.mutateAsync,
    isSending: sendMyMessage.isPending || sendThreadMessage.isPending,
    isMessageActionPending: updateMessage.isPending || deleteMessage.isPending,
  };
}
