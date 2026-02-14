import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { CourseApi } from "../types/types";
import { isValidUuid, toNumberOrNull } from "../utils/validation";

type CreateCourseInput = {
  category_id: string;
  title: string;
  description?: string;
  level?: string;
  price: number | string;
  duration: number | string;
  rating: number | string;
  image?: File | null;
};

type UpdateCourseInput = {
  id: string;
  title?: string;
  description?: string | null;
  level?: string | null;
  price?: number;
  duration?: number;
  rating?: number;
  category_id?: string;
};

type CourseFilters = {
  categoryId?: string;
  level?: string;
  search?: string;
};

function useCourses(filters: CourseFilters = {}) {
  const categoryId = filters.categoryId;
  const normalizedCategoryId =
    categoryId && isValidUuid(categoryId) ? categoryId : undefined;
  const normalizedLevel = filters.level?.trim().toLowerCase() || undefined;
  const normalizedSearch = filters.search?.trim() || undefined;

  const queryClient = useQueryClient();
  const {
    data: courses = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery<CourseApi[]>({
    queryKey: [
      "courses",
      normalizedCategoryId ?? "all",
      normalizedLevel ?? "all",
      normalizedSearch ?? "",
    ],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (normalizedCategoryId) params.category_id = normalizedCategoryId;
      if (normalizedLevel) params.level = normalizedLevel;
      if (normalizedSearch) params.search = normalizedSearch;

      return (await apiClient.get("/courses/", { params })).data;
    },
  });

  const addCourse = useMutation({
    mutationFn: async (payload: CreateCourseInput) => {
      if (!isValidUuid(payload.category_id)) {
        throw new Error("category_id UUID bo'lishi shart");
      }

      const price = toNumberOrNull(payload.price);
      const duration = toNumberOrNull(payload.duration);
      const rating = toNumberOrNull(payload.rating);

      if (price === null || duration === null || rating === null) {
        throw new Error("price, duration va rating number bo'lishi shart");
      }

      const formData = new FormData();
      formData.append("category_id", payload.category_id);
      formData.append("title", payload.title);
      formData.append("price", String(price));
      formData.append("duration", String(duration));
      formData.append("rating", String(rating));
      if (payload.description) formData.append("description", payload.description);
      if (payload.level) formData.append("level", payload.level);
      if (payload.image) formData.append("image", payload.image);

      return (
        await apiClient.post("/courses/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateCourse = useMutation({
    mutationFn: async (payload: UpdateCourseInput) => {
      const { id, ...data } = payload;
      return (await apiClient.put(`/courses/${id}`, data)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateCourseImage = useMutation({
    mutationFn: async ({ id, image }: { id: string; image: File }) => {
      const formData = new FormData();
      formData.append("image", image);
      return (
        await apiClient.post(`/courses/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/courses/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  return {
    courses,
    loading,
    isError,
    error,
    addCourse: addCourse.mutateAsync,
    updateCourse: updateCourse.mutateAsync,
    updateCourseImage: updateCourseImage.mutateAsync,
    deleteCourse: deleteCourse.mutateAsync,
  };
}

export default useCourses;
