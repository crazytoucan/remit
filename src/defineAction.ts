import { IActionDefinition, IActionType } from "./types";

export function defineAction<T = undefined>(type: string) {
  const definition: IActionDefinition<T> = ((payload: T) => ({ type, payload })) as any;
  definition.TYPE = type as IActionType<T>;
  return definition;
}
