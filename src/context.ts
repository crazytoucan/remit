import { createContext } from "react";
import { IStore } from "./types";

export const TINYSAGA_CONTEXT = createContext<IStore<any>>(null!);
