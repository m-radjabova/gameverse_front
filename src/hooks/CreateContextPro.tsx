import { useEffect, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { MyContext } from "../context/MyContext";
import type { User } from "../types/types";
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  refreshSession,
} from "../utils/auth";
import { useMeQuery } from "./useProfile";

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

export type ContextType = {
  state: TypeState;
  dispatch: Dispatch<Action>;
};

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
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: true,
    roles: [],
  });
  const [authReady, setAuthReady] = useState(false);

  const hasToken = Boolean(getAccessToken());
  const meQuery = useMeQuery(authReady && hasToken);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken) {
        if (!isMounted) return;
        dispatch({ type: "SET_USER", payload: null });
        dispatch({ type: "SET_LOADING", payload: false });
        setAuthReady(true);
        return;
      }

      if (!isTokenExpired(accessToken)) {
        if (!isMounted) return;
        setAuthReady(true);
        return;
      }

      if (!refreshToken || isTokenExpired(refreshToken)) {
        clearAuthStorage();
        if (!isMounted) return;
        dispatch({ type: "SET_USER", payload: null });
        dispatch({ type: "SET_LOADING", payload: false });
        setAuthReady(true);
        return;
      }

      const nextAccessToken = await refreshSession();

      if (!isMounted) return;

      if (!nextAccessToken) {
        dispatch({ type: "SET_USER", payload: null });
        dispatch({ type: "SET_LOADING", payload: false });
      }

      setAuthReady(true);
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!hasToken) {
      dispatch({ type: "SET_USER", payload: null });
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: meQuery.isLoading });

    if (meQuery.data) {
      dispatch({ type: "SET_USER", payload: meQuery.data });
    }

    if (meQuery.error) {
      clearAuthStorage();
      dispatch({ type: "SET_USER", payload: null });
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [authReady, hasToken, meQuery.data, meQuery.error, meQuery.isLoading]);

  // role redirect
  useEffect(() => {
    if (!state.user) return;

    if (state.user.roles?.includes("admin")) return;
  }, [state.user]);

  return <MyContext.Provider value={{ state, dispatch }}>{children}</MyContext.Provider>;
}

export default CreateContextPro;
