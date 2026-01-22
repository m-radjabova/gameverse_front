import { useEffect, useReducer, type ReactNode, useMemo } from "react";
import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";
import { MyContext } from "../context/MyContext";
import { parseJwt } from "../utils";

export interface TypeState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

type SETUserAction = { type: "SET_USER"; payload: User };
type LOGOUTAction = { type: "LOGOUT" };
type SETLoadingAction = { type: "SET_LOADING"; payload: boolean };
type SETErrorAction = { type: "SET_ERROR"; payload: string | null };

type Action = SETUserAction | LOGOUTAction | SETLoadingAction | SETErrorAction;

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, error: null };
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const clearStorage = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

function CreateContextPro({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: true,
    error: null,
  });

  const login = async (username: string, password: string): Promise<void> => {
  dispatch({ type: "SET_LOADING", payload: true });
  try {
    const res = await apiClient.post("/auth/login", { username, password });

    const access = res.data.access_token as string;
    const refresh = res.data.refresh_token as string;

    saveTokens(access, refresh);

    const payload = parseJwt(access);
    const role = payload?.role as "admin" | "user" | undefined;

    const user: User = {
      username,
      role
    };

    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "SET_USER", payload: user });
  } catch (err: any) {
    dispatch({
      type: "SET_ERROR",
      payload: err?.response?.data?.detail || "Login failed",
    });
    throw err;
  } finally {
    dispatch({ type: "SET_LOADING", payload: false });
  }
};

  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await apiClient.post("/users/", data);
      dispatch({ type: "SET_ERROR", payload: null }); 
    } catch (err: any) {
      dispatch({
        type: "SET_ERROR",
        payload: err?.response?.data?.detail || "Register failed",
      });
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearStorage();
      dispatch({ type: "LOGOUT" });
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (storedUser && token) {
      dispatch({ type: "SET_USER", payload: JSON.parse(storedUser) });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const isAuthenticated = useMemo(() => {
    return !!state.user && !!localStorage.getItem("access_token");
  }, [state.user]);

  const contextValue = {
    state,
    dispatch,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
  );
}

export default CreateContextPro;
