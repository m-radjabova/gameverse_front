import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { CourseRatingSummary } from "../types/types";

export function useCourseRating(courseId: string, enabled = true) {
  const queryClient = useQueryClient();

  const summary = useQuery<CourseRatingSummary>({
    queryKey: ["course-rating", courseId],
    queryFn: async () => (await apiClient.get(`/courses/${courseId}/rating`)).data,
    enabled: !!courseId && enabled,
    retry: false,
  });

  const rateCourse = useMutation({
    mutationFn: async (score: number) => {
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new Error("Rating 1 dan 5 gacha bo'lishi shart");
      }
      return (
        await apiClient.post<CourseRatingSummary>(`/courses/${courseId}/rating`, { score })
      ).data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-rating", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  return {
    summary,
    rateCourse: rateCourse.mutateAsync,
    isRatingPending: rateCourse.isPending,
  };
}
