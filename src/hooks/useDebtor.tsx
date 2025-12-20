import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Debt, Debtor, FilterParams, ReqDebt, ReqDebtor } from "../types/types";
interface MutationVariables {
  debtorId: number;
  amount?: number;
}

interface MutationVariables2 {
  debtorId: number;
  newDebt: ReqDebt;
}

function useDebtor(debtorId?: number, pollingIntervalMs = 3000, filterParams?: FilterParams) {
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
    refetchInterval: pollingIntervalMs || false,
    refetchOnWindowFocus: true,
  });

  const { data: debtor, isLoading: debtorLoading } = useQuery({
    queryKey: ["debtor", debtorId],
    queryFn: async () => {
      if (typeof debtorId !== "number") return null;
      const res = await apiClient.get<Debtor>(`/debtor/${debtorId}`);
      return res.data ?? null;
    },
    enabled: typeof debtorId === "number",
    refetchInterval: typeof debtorId === "number" ? pollingIntervalMs : false,
    refetchOnWindowFocus: true,
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery({
    queryKey: ["debts", debtorId],
    queryFn: async () => {
      if (typeof debtorId !== "number") return [];
      const res = await apiClient.get<Debt[]>(`/debtor/${debtorId}/debts`);
      return res.data ?? [];
    },
    enabled: typeof debtorId === "number",
    refetchInterval: typeof debtorId === "number" ? pollingIntervalMs : false,
    refetchOnWindowFocus: true,
  });

  const {
    data: debtsHistory = [],
    isLoading: debtsHistoryLoading,
  } = useQuery({
    queryKey: ["debts-history", debtorId],
    queryFn: async () => {
      if (typeof debtorId !== "number") return [];
      const res = await apiClient.get(`/debtor/${debtorId}/debts-history`);
      return res.data ?? [];
    },
    enabled: typeof debtorId === "number",
    refetchInterval: typeof debtorId === "number" ? pollingIntervalMs : false,
    refetchOnWindowFocus: true,
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
    },
  });

  useEffect(() => {
  }, [pollingIntervalMs, queryClient]);

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
      debtRepaymentMutate.mutate({ debtorId: debtorId as number, amount }),
    debtsHistory,
    debtsHistoryLoading,
  };
}

export default useDebtor;