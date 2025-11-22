import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Team } from "../types/types";

function useTeams() {
  const queryClient = useQueryClient();
  
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await apiClient.get<Team[]>("/teams");
      return res.data;
    },
  });

  const { mutate: addTeam } = useMutation({
    mutationFn: async (newTeam: { name: string }) => { // Faqat name
      const res = await apiClient.post("/teams", newTeam);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });

  const { mutate: deleteTeam } = useMutation({
    mutationFn: async (teamId: number) => {
      await apiClient.delete(`/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });

  const { mutate: updateTeamByName } = useMutation({
    mutationFn: async ({ teamId, new_name }: { teamId: number, new_name: string }) => {
      const res = await apiClient.patch<Team>(`/teams/${teamId}?new_name=${new_name}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });

  const { mutate: addMembersToTeam } = useMutation({
    mutationFn: async ({ teamId, userIds }: { teamId: number, userIds: number[] }) => {
      const res = await apiClient.post(`/teams/${teamId}/members`, userIds);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    }
  });

  return { teams, addTeam, deleteTeam, updateTeamByName, addMembersToTeam };
}

export default useTeams;