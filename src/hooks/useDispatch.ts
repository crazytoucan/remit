import { useContext } from "react";
import { TINYSAGA_CONTEXT } from "../context";

export function useDispatch() {
  const store = useContext(TINYSAGA_CONTEXT);
  return store.dispatch;
}

export function createUseDispatch<TDISPATCH extends (action: any) => void>() {
  return useDispatch as () => TDISPATCH;
}
