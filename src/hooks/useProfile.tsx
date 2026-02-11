import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";

type UpdateMePayload = {
  username: string;
  email: string;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};


function getApiErrorMessage(err: unknown, fallback: string) {
  if (!isAxiosError(err)) return fallback;

  const data: any = err.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.message === "string") return data.message;

  if (Array.isArray(data?.detail)) {
    // FastAPI validation errors
    const first = data.detail[0];
    if (first?.msg) return String(first.msg);
  }

  return fallback;
}

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ["me"],
    enabled,
    queryFn: async () => {
      const res = await apiClient.get<User>("/users/me");
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateMeMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMePayload) => {
      // ✅ recommended backend: PUT /users/me
      const res = await apiClient.put<User>("/users/me", payload);
      return res.data;
    },
    onSuccess: async (nextUser) => {
      qc.setQueryData(["me"], nextUser);
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      throw new Error(getApiErrorMessage(err, "Failed to update profile."));
    },
  });
}

export function useUploadAvatarMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      // ✅ backend expects: image: UploadFile = File(...)
      formData.append("image", file);

      const res = await apiClient.post<User>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    onSuccess: async (nextUser) => {
      qc.setQueryData(["me"], nextUser);
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      throw new Error(getApiErrorMessage(err, "Failed to upload avatar."));
    },
  });
}

export function useChangeMyPasswordMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const res = await apiClient.patch<User>("/users/me/password", payload);
      return res.data;
    },
    onSuccess: async (nextUser) => {
      qc.setQueryData(["me"], nextUser);
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      throw new Error(getApiErrorMessage(err, "Failed to change password."));
    },
  });
}
