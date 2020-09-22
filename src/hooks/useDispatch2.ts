import { useCallback, useContext } from "react";
import { TINYSAGA_CONTEXT } from "../context";
import { IDispatch2 } from "../types";

export function useDispatch2() {
  const store = useContext(TINYSAGA_CONTEXT);
  const dispatch2: IDispatch2 = useCallback((type: string, payload?: any) => {
    store.dispatch({ type, payload });
  }, []);

  return dispatch2;
}
