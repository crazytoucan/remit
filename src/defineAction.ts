import { IActionDefinition, IActionType } from "./types";

/**
 * Defines a new Action type for typesafe action handling.
 * The syntax is a little tricky, but wsa made this way to
 * prevent spelling errors in action types.
 *
 * Example usage:
 *
 * ```
 * const LoadUser = defineAction("LoadUser")<{ userId: string }>();
 * ```
 *
 * @param type the Action type string being defined
 */
export function defineAction(type: string): <T = undefined>() => IActionDefinition<T> {
  return <T = undefined>() => {
    const definition: IActionDefinition<T> = ((payload: T) => ({ type, payload })) as any;
    definition.TYPE = type as IActionType<T>;
    return definition;
  };
}
