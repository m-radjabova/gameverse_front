import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category } from "../types/types";
import apiClient from "../apiClient/apiClient";

type CreateCategoryInput = {
  name: string;
  description?: string;
  icon?: File | null;
};

type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string;
};

function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading: loading,
    isError,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories/")).data,
  });

  const addCategory = useMutation({
    mutationFn: async (payload: CreateCategoryInput) => {
      const formData = new FormData();
      formData.append("name", payload.name);

      if (payload.description) {
        formData.append("description", payload.description);
      }

      if (payload.icon) {
        formData.append("icon", payload.icon); 
      }

      return (
        await apiClient.post("/categories/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const updateCategory = useMutation({
    mutationFn: async (payload: UpdateCategoryInput) => {
      const { id, ...data } = payload;
      return (await apiClient.put(`/categories/${id}`, data)).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const getCategoryDetail = async (categoryId: string) => {
    return (await apiClient.get(`/categories/${categoryId}`)).data as Category;
  };

  return {
    categories,
    loading,
    isError,
    error,
    addCategory: addCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    getCategoryDetail,
  };
}

export default useCategories;
