export interface IAction {
  type: string;
  payload: unknown;
  [key: string]: unknown;
}

export type IMessageChannel<T> = string & {
  __payload: T;
};
