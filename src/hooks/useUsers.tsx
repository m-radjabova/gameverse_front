import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";

interface UseUsersProps {
  searchTerm?: string;
  cities?: string[] | null;
  page?: number;
}

function useUsers({ searchTerm = "", cities = null, page = 1 }: UseUsersProps = {}) {
  const queryClient = useQueryClient();

   const { data, isLoading, error } = useQuery({
    queryKey: ["users", searchTerm, cities, page],
      queryFn: async () => {
        const params = new URLSearchParams();

        params.append("page", page.toString());
        params.append("limit", "5");

        if (searchTerm.trim()) params.append("username", searchTerm);

        if (cities && cities.length > 0) {
          cities.forEach((city) => params.append("cities", city));
        }

        const response = await apiClient.get("/users", { params });

        return response.data;
      }

  });

  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await apiClient.get("/users/cities");
      return response.data;
    },
  });


  const addUser = useMutation({
    mutationFn: (user: User) =>
      apiClient.post("/users/", user).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: (user: User) =>
      apiClient.put(`/users/${user.id}/`, user).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    users: data?.data || [],
    cities: citiesData || [],
    total: data?.total || 0,
    pages: data?.pages || 1,
    isLoading: isLoading || citiesLoading,
    error,
    addUser: addUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    isAdding: addUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
  };
}

export default useUsers;