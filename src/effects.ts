import { IActionType, IChannel } from "./types";

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

/**
 * Returns a promise whose resolved value will be the next action of the given type
 * emitted on the channel. If the `maxWait` parameter is specified, then at most
 * `maxWait` milliseconds will be waited before returning the default value `null`.
 *
 * @param channel channel to hook into
 * @param type the action type to listen on
 * @param maxWait the maximum time, in millis, to wait for the given action type
 */
export function takeAdvanced<T>(
  channel: IChannel,
  type: IActionType<T>,
  opts: {
    filter?: (payload: T) => boolean;
    maxWait?: number;
  },
): Promise<T | null> {
  const filter = opts.filter ?? (() => true);
  const maxWait = opts.maxWait;

  if (maxWait !== undefined) {
    return new Promise<T>((resolve) => {
      const unsubscribe = channel.on(type, (value: T) => {
        if (filter(value)) {
          unsubscribe();
          resolve(value);
        }
      });
    });
  } else {
    return new Promise<T | null>((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(null);
      });

      const unsubscribe = channel.on(type, (value: T) => {
        if (filter(value)) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(value);
        }
      });
    });
  }
}
