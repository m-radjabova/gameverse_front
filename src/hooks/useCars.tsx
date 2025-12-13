import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient/apiClient";
import type { Car, ReqCar } from "../types/types";

function useCars() {
  const queryClient = useQueryClient();
  
  const { data: cars = [] } = useQuery({
    queryKey: ["cars"], 
    queryFn: async () => {
      const res = await apiClient.get<Car[]>("/cars");
      return res.data;
    },
  });

  const addCarMutation = useMutation({
    mutationFn: async (newCar: ReqCar) => {
      const res = await apiClient.post<Car>("/cars", newCar);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: async (carId: number) => {
      await apiClient.delete(`/cars/${carId}`);
      return carId; 
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReqCar }) => {
      const res = await apiClient.put<Car>(
        `/cars/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });

  return { 
    cars,
    isLoading: cars.length === 0, 
    addCar: addCarMutation.mutate,
    deleteCar: deleteCarMutation.mutate,
    updateCar: updateCarMutation.mutate,
  };
}

export default useCars;