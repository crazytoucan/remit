import { IAction, IActionType } from "./types";

export function createAction(type: IActionType<undefined | void>): IAction;
export function createAction<T>(type: IActionType<T>, payload: T): IAction;
export function createAction(type: string, payload?: unknown): IAction {
  return { type, payload };
}
