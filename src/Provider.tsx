import * as React from "react";
import { TINYSAGA_CONTEXT } from "./context";
import { IStore } from "./types";

interface IProps {
  store: IStore<any>;
}

export function Provider({ store, children }: React.PropsWithChildren<IProps>) {
  return <TINYSAGA_CONTEXT.Provider value={store}>{children}</TINYSAGA_CONTEXT.Provider>;
}
