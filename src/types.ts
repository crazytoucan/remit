export interface IAction {
  type: string;
  payload: unknown;
  [key: string]: unknown;
}

export type IActionType<T> = string & {
  __payload: T;
};
