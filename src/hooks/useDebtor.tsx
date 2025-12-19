import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Debt, Debtor, ReqDebt, ReqDebtor } from "../types/types";

function useDebtor(debtorId?: number) {
  const queryClient = useQueryClient();
  
  const { data: debtors = [], isLoading: debtorsLoading } = useQuery({
    queryKey: ["debtors"],
    queryFn: async () => {
      const res = await apiClient.get<Debtor[]>("/debtor");
      return res.data;
    },
  });

  const { data: debtor, isLoading: debtorLoading } = useQuery({
    queryKey: ["debtor", debtorId],
    queryFn: async () => {
      if (!debtorId) return null;
      const res = await apiClient.get<Debtor>(`/debtor/${debtorId}`);
      return res.data;
    },
    enabled: !!debtorId,
  });

  const addDebtorMutate = useMutation({
    mutationFn: async (newDebtor: ReqDebtor) => {
      const res = await apiClient.post<ReqDebtor>("/debtor", newDebtor);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ["debts", debtorId],
    queryFn: async () => {
      if (!debtorId) return [];
      const res = await apiClient.get<Debt[]>(`/debtor/${debtorId}/debts`);
      return res.data;
    },
    enabled: !!debtorId,
  });

  const addDebtToDebtorMutate = useMutation({
    mutationFn: async (newDebt: ReqDebt) => {
      const res = await apiClient.post<ReqDebt>(`/debtor/${debtorId}/debt`, newDebt);;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", debtorId] });
    },
  });


  const debtRepaymentMutate = useMutation({
      mutationFn: async (amount : number) => {
        const res = await apiClient.post(
          `/debtor/${debtorId}/repayment`,
          { amount }
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["debts", debtorId] });
      },
    });

  const { data: debtsHistory = [], isLoading: debtsHistoryLoading } = useQuery({
    queryKey: ["debts-history", debtorId],
    queryFn: async () => {
      if (!debtorId) return [];
      const res = await apiClient.get(
        `/debtor/${debtorId}/debts-history`
      );
      return res.data;
    },
    enabled: !!debtorId,
  });


  
  return { 
    debtors, 
    debtorsLoading,
    debtor,
    debts,
    debtorLoading,
    debtsLoading,
    addDebtor: addDebtorMutate.mutate,
    addDebtToDebtor: addDebtToDebtorMutate.mutate,
    debtRepayment: debtRepaymentMutate.mutate,
    debtsHistory,
    debtsHistoryLoading
  };
}

export default useDebtor;