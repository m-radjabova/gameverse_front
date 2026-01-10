import { useReducer, type Dispatch, type ReactNode, useEffect } from "react";
import { MyContext } from "../context/MyContext";
import type { Shop } from "../types/types";
import apiClient from "../apiClient/apiClient";

export interface ContextType {
  state: TypeState;
  dispatch: Dispatch<Action>;
  login: (
    shopName: string
  ) => Promise<{ success: boolean; shop?: Shop; error?: string }>;
}

export interface TypeState {
  shop: Shop | null;
  isLoading: boolean;
  error: string | null;
}

type SETAction = { type: "SET_SHOP"; payload: Shop };
type LOGOUTAction = { type: "LOGOUT" };
type SETLoadingAction = { type: "SET_LOADING"; payload: boolean };
type SET_ERRORAction = { type: "SET_ERROR"; payload: string | null };

type Action = SETAction | LOGOUTAction | SETLoadingAction | SET_ERRORAction;

const initialState: TypeState = {
  shop: null,
  isLoading: true,
  error: null,
};

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_SHOP":
      return { ...state, shop: action.payload, error: null };
    case "LOGOUT":
      localStorage.removeItem("shop_id");
      return { ...state, shop: null, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function CreateContextPro({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const shopId = localStorage.getItem("shop_id");

        if (!shopId) {
          dispatch({ type: "SET_LOADING", payload: false });
          return;
        }

        dispatch({ type: "SET_LOADING", payload: true });

        const response = await apiClient.get(`/shop/${shopId}`);

        if (response.data) {
          dispatch({ type: "SET_SHOP", payload: response.data });
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.clear();
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (shopName: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // 1️⃣ search
      const searchRes = await apiClient.get("/shop/search/", {
        params: { name: shopName },
      });

      if (!searchRes.data.shops || searchRes.data.shops.length === 0) {
        dispatch({ type: "SET_ERROR", payload: "Shop topilmadi" });
        return { success: false, error: "Shop topilmadi" };
      }

      const shopId = searchRes.data.shops[0].shop_id;

      // 2️⃣ full shop
      const shopRes = await apiClient.get(`/shop/${shopId}`);

      localStorage.setItem("shop_id", shopId.toString());
      dispatch({ type: "SET_SHOP", payload: shopRes.data });

      return { success: true, shop: shopRes.data };
    } catch (error: any) {
      let errorMessage = "Server xatosi";

      if (error.response) {
        errorMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          `Server xatosi: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Serverga ulanishda xatolik";
      }

      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    state,
    dispatch,
    login,
    logout,
  };

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

export default CreateContextPro;
