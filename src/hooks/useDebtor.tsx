import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Debt, Debtor, FilterParams, ReqDebt, ReqDebtor } from "../types/types";

interface MutationVariables {
  debtorId: number;
  amount?: number;
  debt_id?: number;
}

interface MutationVariables2 {
  debtorId: number;
  newDebt: ReqDebt;
  debt_id?: number;
}

function useDebtor(debtorId?: number, filterParams?: FilterParams) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: debtors = { data: [] , total : 0}, isLoading: debtorsLoading } = useQuery({
    queryKey: ["debtors", filterParams,  page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterParams?.name?.trim()) {
        params.set("name", filterParams.name.trim());
      }
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      const res = await apiClient.get(`/debtor?${params.toString()}`);
      return res.data ?? [];
    },
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  const { data: debtor, isLoading: debtorLoading } = useQuery({
    queryKey: ["debtor", debtorId],
    queryFn: async () => {
      if (typeof debtorId !== "number") return null;
      const res = await apiClient.get<Debtor>(`/debtor/${debtorId}`);
      return res.data ?? null;
    },
    enabled: typeof debtorId === "number",
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ["debts", debtorId],
    queryFn: async () => {
      if (typeof debtorId !== "number") return [];
      const res = await apiClient.get<Debt[]>(`/debtor/${debtorId}/debts`);
      return res.data ?? [];
    },
    enabled: typeof debtorId === "number",
    refetchInterval: 5000, 
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });

  const {
    data: debtsHistory = [],
    isLoading:  debtsHistoryLoading,
  } = useQuery({
    queryKey: ["debts-history", debtorId],
    queryFn:  async () => {
      if (typeof debtorId !== "number") return [];
      const res = await apiClient.get(`/debtor/${debtorId}/debts-history`);
      return res.data ??  [];
    },
    enabled: typeof debtorId === "number",
    staleTime:  Infinity,
  });

  const addDebtorMutate = useMutation({
    mutationFn: async (newDebtor: ReqDebtor) => {
      const res = await apiClient.post<Debtor>("/debtor", newDebtor);
      return res.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });

  const addDebtToDebtorMutate = useMutation({
    mutationFn: async ({ debtorId: dId, newDebt }: MutationVariables2) => {
      const res = await apiClient.post<Debt>(`/debtor/${dId}/debt`, newDebt);
      return res.data;
    },
    onSettled: (_data, _error, vars : MutationVariables2) => {
      queryClient.invalidateQueries({ queryKey: ["debts", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debts-history", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debtor", vars.debtorId] }); // QO'SHILDI
    },
  });

  const debtRepaymentMutate = useMutation({
    mutationFn: async ({ debtorId: dId, amount }: MutationVariables) => {
      const res = await apiClient.post(`/debtor/${dId}/repayment`, { amount });
      return res.data;
    },
    onSettled: (_data, _error, vars : MutationVariables) => {
      queryClient.invalidateQueries({ queryKey: ["debts", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debts-history", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debtor", vars.debtorId] });
    },
  });

  const repaySingleDebtMutate = useMutation({
    mutationFn: async ({ debt_id, amount, debtorId:  dId }: MutationVariables) => {
      const res = await apiClient.post(`/debtor/debt/${debt_id}/repayment`, { 
        amount 
      });
      return res.data;
    },
    onSettled: (_data, _error, vars) => {
      queryClient.invalidateQueries({ queryKey: ["debts", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debts-history", vars.debtorId] });
      queryClient.invalidateQueries({ queryKey: ["debtor", vars.debtorId] });
    },
  });
  
  useEffect(() => {
  }, [queryClient]);

  return {
    debtors,
    page, 
    setPage,
    limit,
    debtorsLoading,
    debtor,
    debts,
    debtorLoading,
    debtsLoading,
    addDebtor: addDebtorMutate.mutate,
    addDebtToDebtor: (newDebt: ReqDebt) =>
      addDebtToDebtorMutate.mutate({ debtorId: debtorId as number, newDebt }),
    debtRepayment: (amount: number) =>
      debtRepaymentMutate.mutateAsync({ debtorId: debtorId as number, amount }),
    repaySingleDebt: (debt_id: number, amount: number) =>
      repaySingleDebtMutate.mutate({ debtorId: debtorId as number, debt_id, amount }),
    debtsHistory,
    debtsHistoryLoading,
  };
}

export default useDebtor;