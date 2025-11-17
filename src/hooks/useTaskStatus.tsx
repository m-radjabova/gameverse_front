import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Status } from "../types/types";

function useTaskStatus() {

  const queryClient = useQueryClient(); 

  const {
    data: statusList = [],
  } = useQuery({
    queryKey: ["statusList"],
    queryFn: async () => {
      const res = await apiClient.get("/status/list");
      return res.data;
    },
  });

  const {
    data: statusType = [],
  } = useQuery({
    queryKey: ["statusTypes"],
    queryFn: async () => {
      const res = await apiClient.get("/status/types");
      return res.data;
    },
  });

  const { mutate: addTaskStatus, isPending: isAdding } = useMutation({
    mutationFn: async (statusType: string) => {
      const existingStatusTypes = statusList.map((status: Status) => status.title);

      if (existingStatusTypes.includes(statusType)) {
        return Promise.reject("Status already exists");
      }

      const res = await apiClient.post(
        `/status/create?status_type=${statusType}`
      );
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statusList"] });  
      queryClient.invalidateQueries({ queryKey: ["statusTypes"] }); 
    }
  });

  const existingStatusTypes = statusList.map((status: Status) => status.title);

  return {
    statusList,
    statusType,
    existingStatusTypes,
    isAdding,
    addTaskStatus,
  };
}

export default useTaskStatus;
