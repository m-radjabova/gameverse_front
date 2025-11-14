import { useReducer, type Dispatch, type ReactNode } from "react";
import { MyContext } from "../context/MyContext";
import type {User } from "../types/types";

export interface ContextType {
  state: TypeState;
  dispatch: Dispatch<Action>;
}

export interface TypeState {
  user: User | null;
  isLoading: boolean;
}

type SETAction = { type: "SET_USER"; payload: User };
type LOGOUTAction = { type: "LOGOUT" };
type SETLoadingAction = { type: "SET_LOADING"; payload: boolean };
type AddUserAction = { type: "ADD_USER" };

type Action =
  | SETAction
  | LOGOUTAction
  | SETLoadingAction
  | AddUserAction

export interface ContextType {
  state: TypeState;
  dispatch: Dispatch<Action>;
}

function reducer(state: TypeState, action: Action): TypeState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload as User };
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_LOADING":
      console.log("loading", action.payload);
      return { ...state, isLoading: action.payload as boolean };
    default:
      return state;
  }
}

function CreateContextPro({ children }: { children: ReactNode }) {
 const [state, dispatch] = useReducer(reducer, {
    user: null,
    isLoading: true,
  });


  return (
    <MyContext.Provider value={{ state, dispatch }}>
      {children}
    </MyContext.Provider>
  );
}

export default CreateContextPro;
