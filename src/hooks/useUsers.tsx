import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";

interface UseUsersProps {
  searchTerm?: string;
  page?: number;
}

function useUsers({ searchTerm = "", page = 1}: UseUsersProps = {}) {
  const queryClient = useQueryClient();

 const { data, isLoading, error } = useQuery({
  queryKey: ["users", searchTerm, page],
  queryFn: async () => {
    const params: Record<string, string | number> = { page, limit: 4 };
    if (searchTerm.trim()) params.username = searchTerm;

    const response = await apiClient.get("/users/", { params });
    return response.data;
  }
});

  const addUser = useMutation({
    mutationFn: (user: User) => apiClient.post("/users/", user).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const updateUser = useMutation({
    mutationFn: (user: User) => apiClient.put(`/users/${user.id}/`, user).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  });

  return {
    users: data?.data || [],
  total: data?.total || 0,
  pages: data?.pages || 1,
    isLoading,
    error,
    addUser: addUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    isAdding: addUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending
  };
}

export default useUsers;