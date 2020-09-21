import { useContext, useLayoutEffect, useMemo, useReducer } from "react";
import { TINYSAGA_CONTEXT } from "../context";

function referenceEquals<T>(a: T, b: T) {
  return a === b;
}

function useForceUpdate() {
  const [, forceUpdate] = useReducer((s) => s + 1, 0);
  return forceUpdate;
}

export function useSelector<T>(
  selector: (state: any) => T,
  equalityFn: <V>(a: V, b: V) => boolean = referenceEquals,
) {
  const forceUpdate = useForceUpdate();
  const store = useContext(TINYSAGA_CONTEXT);
  const result = selector(store.state);
  const ref = useMemo<{
    isUpdateQueued: boolean;
    lastResult: T;
    selector: typeof selector;
  }>(() => ({} as any), undefined);

  ref.isUpdateQueued = false;
  ref.lastResult = result;
  ref.selector = selector;

  useLayoutEffect(() => {
    return store.subscribe(() => {
      if (ref.isUpdateQueued) {
        return;
      }

      const nextResult = ref.selector(store.state);
      if (!equalityFn(ref.lastResult, nextResult)) {
        ref.isUpdateQueued = true;
        forceUpdate();
      }
    });
  }, undefined);
  return result;
}

export function createUseSelector<TSTATE>(
  defaultEqualityFn: <T>(a: T, b: T) => boolean = referenceEquals,
) {
  return <T>(
    selector: (state: TSTATE) => T,
    equalityFn: <V>(a: V, b: V) => boolean = defaultEqualityFn,
  ) => {
    return useSelector(selector, equalityFn);
  };
}
