import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { ReqShop } from "../types/types";

export interface Shop {
  shop_id: number;
  shop_name: string;
  owner_name?: string;
  phone_number?: string;
  address: string;
  is_active: boolean;
  created_at?: string;
}

export interface ShopStatistics {
  shop_id: number;
  shop_name: string;
  statistics: {
    total_debtors: number;
    total_debts: number;
    total_unpaid_debt: number;
    total_paid_debt: number;
  };
}


function useShop(shopId?: number) {
  const queryClient = useQueryClient();

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await apiClient.get<{ shops: Shop[]; total: number }>("/shop/");
      return res.data?.shops ?? [];
    },
    staleTime: 300000, 
    refetchOnWindowFocus: true,
  });

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      if (typeof shopId !== "number") return null;
      const res = await apiClient.get<Shop>(`/shop/${shopId}`);
      return res.data ?? null;
    },
    enabled: typeof shopId === "number",
    staleTime: 300000,
    refetchOnWindowFocus: true,
  });

  const { data: statistics, isLoading: statisticsLoading } = useQuery({
    queryKey: ["shop-statistics", shopId],
    queryFn: async () => {
      if (typeof shopId !== "number") return null;
      const res = await apiClient.get<ShopStatistics>(`/shop/${shopId}/statistics`);
      return res.data ?? null;
    },
    enabled: typeof shopId === "number",
    staleTime: 60000, // 1 daqiqa
    refetchOnWindowFocus: true,
  });

  const createShopMutate = useMutation({
    mutationFn: async (newShop: ReqShop) => {
      const res = await apiClient.post<{ success: boolean; shop_id: number }>("/shop/", newShop);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });

  const updateShopMutate = useMutation({
    mutationFn: async ({ shopId: sId, data }: { shopId: number; data: Partial<ReqShop> }) => {
      const res = await apiClient.put(`/shop/${sId}`, data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shop", variables.shopId] });
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });

  const deleteShopMutate = useMutation({
    mutationFn: async (shopIdToDelete: number) => {
      const res = await apiClient.delete(`/shop/${shopIdToDelete}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });

  const selectShop = (selectedShopId: number) => {
    localStorage.setItem("shop_id", selectedShopId.toString());
    queryClient.invalidateQueries();
  };

  const getCurrentShopId = (): number | null => {
    const shopId = localStorage.getItem("shop_id");
    return shopId ? parseInt(shopId) : null;
  };

  const clearShop = () => {
    localStorage.removeItem("shop_id");
    queryClient.clear();
  };

  return {
    shops,
    shopsLoading,
    shop,
    shopLoading,
    statistics,
    statisticsLoading,
    createShop: createShopMutate.mutate,
    createShopAsync: createShopMutate.mutateAsync,
    updateShop: (data: Partial<ReqShop>) =>
      updateShopMutate.mutate({ shopId: shopId as number, data }),
    deleteShop: deleteShopMutate.mutate,
    selectShop,
    getCurrentShopId,
    clearShop,
    isCreatingShop: createShopMutate.isPending,
    isUpdatingShop: updateShopMutate.isPending,
    isDeletingShop: deleteShopMutate.isPending,
  };
}

export default useShop;