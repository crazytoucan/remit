import { IActionDefinition, IActionType } from "./types";

/**
 * Defines a new Action type for typesafe action handling.
 *
 * @param type the Action type string being defined
 */
export function defineAction<T = undefined>(type: string) {
  const definition: IActionDefinition<T> = ((payload: T) => ({ type, payload })) as any;
  definition.TYPE = type as IActionType<T>;
  return definition;
}
