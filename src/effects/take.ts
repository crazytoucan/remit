import { IActionType, IChannel } from "../types";

/**
 * Returns a promise whose resolved value will be the next action of the given type
 * emitted on the channel. If the `maxWait` parameter is specified, then at most
 * `maxWait` milliseconds will be waited before returning the default value `null`.
 *
 * @param channel channel to hook into
 * @param type the action type to listen on
 */
export function take<T>(channel: IChannel, type: IActionType<T>): Promise<T> {
  return new Promise<T>((resolve) => {
    const unsubscribe = channel.on(type, (value: T) => {
      unsubscribe();
      resolve(value);
    });
  });
}
