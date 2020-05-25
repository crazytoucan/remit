export interface IAction {
  type: string;
  payload: unknown;
}

export type IActionDefinition<T> = {
  TYPE: IActionType<T>;
  __payload: T;
  (payload: T): { type: string; payload: T };
} & (T extends undefined
  ? {
      (): { type: string; payload: undefined };
    }
  : {});

export type IActionType<T> = string & {
  __payload: T;
};
