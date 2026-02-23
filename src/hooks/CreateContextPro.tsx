import { useEffect, useReducer, type ReactNode } from "react";
import { MyContext } from "../context/MyContext";
import type { User } from "../types/types";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiClient/apiClient";
import { clearAuthStorage } from "../utils/auth";

export interface TypeState {
  user: User | null;
  isLoading: boolean;
  roles: string[];

}

type SET_USER = { type: "SET_USER"; payload: User | null };
type LOGOUT = { type: "LOGOUT" };
type SET_LOADING = { type: "SET_LOADING"; payload: boolean };
type REMOVE_FROM_CART = { type: "REMOVE_FROM_CART"; payload: string };
type UPDATE_USER = { type: "UPDATE_USER"; payload: Partial<User> };


type Action =
  | SET_USER
  | LOGOUT
  | SET_LOADING
  | REMOVE_FROM_CART
  | UPDATE_USER;

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "LOGOUT":
      return { ...state, user: null };

    case "UPDATE_USER":
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;

    default:
      return state;
  }
}

function CreateContextPro({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: true,
    roles: [],
  });

  const fetchUser = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch({ type: "SET_USER", payload: null });
        return;
      }

      const res = await apiClient.get<User>("/users/me");
      dispatch({ type: "SET_USER", payload: res.data });
    } catch {
      clearAuthStorage();
      dispatch({ type: "SET_USER", payload: null });
      navigate("/login"); 
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // app start
  useEffect(() => {
    fetchUser();
  }, []);

  // role redirect
  useEffect(() => {
    if (!state.user) return;

    if (state.user.roles?.includes("admin")) return;
  }, [state.user, navigate]);

  return <MyContext.Provider value={{ state, dispatch }}>{children}</MyContext.Provider>;
}

export default CreateContextPro;
