import {useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { MyContext } from '../context/MyContext';
import type { Product, User } from '../types/types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export interface ContextType {
    state: TypeState
    dispatch: Dispatch<Action>
}

export interface TypeState {
    user: User | null,
    isLoading: boolean,
    cart: Product[],
    roles: string[]
}

type SETAction = { type: "SET_USER", payload: User }
type LOGOUTAction = { type: "LOGOUT" }
type SETLoadingAction = { type: "SET_LOADING", payload: boolean }
type EDITUserAction = { type: "EDIT_USER", payload: Partial<User> }
type CHANGE_PASSWORDAction = { type: "CHANGE_PASSWORD", payload: string }
type AddUserAction = { type: "ADD_USER" }
type REMOVE_FROM_CARTAction = { type: "REMOVE_FROM_CART", payload: string }
type ADD_TO_CARTAction = { type: "ADD_TO_CART", payload: Product }
type INCREASE_QUANTITY = { type: "INCREASE_QUANTITY", payload: string }
type DECREASE_QUANTITY = { type: "DECREASE_QUANTITY", payload: string }

type Action = SETAction | LOGOUTAction | SETLoadingAction | EDITUserAction | CHANGE_PASSWORDAction | AddUserAction | REMOVE_FROM_CARTAction | ADD_TO_CARTAction | INCREASE_QUANTITY | DECREASE_QUANTITY


export interface ContextType {
    state: TypeState
    dispatch: Dispatch<Action>
}


function reducer(state: TypeState, action: Action): TypeState {
    switch (action.type) {
        case "SET_USER":
            return { ...state, user: action.payload as User }
        case "LOGOUT":
            return { ...state, user: null }
        case 'EDIT_USER':
            return { ...state, user: { ...state.user, ...action.payload } as User };
        case "CHANGE_PASSWORD":
            return { ...state, user: { ...state.user, password: action.payload } as User };
        case "SET_LOADING":
            console.log("loading", action.payload)
            return { ...state, isLoading: action.payload as boolean }
         case "ADD_TO_CART":
            return { ...state, cart: [...state.cart, {...action.payload,quantity: 1}] }
        case "REMOVE_FROM_CART":
            return { ...state, cart: state.cart.filter((p) => p.id !== action.payload) }
        case "INCREASE_QUANTITY":
            return { ...state, cart: state.cart.map((p) => p.id === action.payload ? { ...p, quantity: p.quantity + 1 } : p) }
        case "DECREASE_QUANTITY":
            return { ...state, cart: state.cart.map((p) => p.id === action.payload ? { ...p, quantity: p.quantity - 1 } : p) }
        default:
            return state;
    }
}

function CreateContextPro({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, {
        user: null,
        isLoading : true,
        cart: JSON.parse(localStorage.getItem("cart") || "[]") as Product[],
        roles: []
    })



    useEffect(() => {
        const unsubscribe = fetchUser();
        localStorage.setItem("cart", JSON.stringify(state.cart));
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        }
    }, [state.cart])

    const fetchUser = () => {
        const auth = getAuth();
        const db = getFirestore();
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        dispatch({ type: "SET_USER", payload: userData as User });
                    } else {
                        dispatch({ type: "LOGOUT" });
                    }
                } catch (err) {
                    console.log(err);
                } finally {
                    dispatch({ type: "SET_LOADING", payload: false });
                }
            } else {
                dispatch({ type: "LOGOUT" });
                dispatch({ type: "SET_LOADING", payload: false });
            }
        });
        return unsub;
    }



    return (
        <MyContext.Provider value={{ state, dispatch }} >
            {children}
        </MyContext.Provider>
    )
}

export default CreateContextPro