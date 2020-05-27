import { IAction, IActionType, IEmitter } from "./types";

/**
 * Equivalent to `emitter.on()`, exported as an Effect for consistency.
 *
 * @param emitter the emitter to hook into
 * @param type the action type to listen on
 * @param cb a callback called whenever the action is emitted
 */
export function on<T>(emitter: IEmitter, type: IActionType<T>, cb: (t: T) => void) {
  return emitter.on(type, cb);
}

/**
 * Listens for `emitter.on()`, invokes the callback exactly once, and then unlistens.
 * Returns a handle which, when called, cancels this effect.
 *
 * @param emitter the emitter to hook into
 * @param type the action type to listen on
 * @param cb a callback called exactly once when the next action is emitted
 */
export function once<T>(emitter: IEmitter, type: IActionType<T>, cb: (t: T) => void) {
  const destroy = emitter.on(type, (value: T) => {
    destroy();
    cb(value);
  });

  return destroy;
}

/**
 * Returns a promise whose resolved value will be the next action of the given type
 * emitted on the emitter. If the `maxWait` parameter is specified, then at most
 * `maxWait` milliseconds will be waited before returning the default value `null`.
 *
 * @param emitter emitter to hook into
 * @param type the action type to listen on
 */
export function take<T>(emitter: IEmitter, type: IActionType<T>): Promise<T>;

/**
 * Returns a promise whose resolved value will be the next action of the given type
 * emitted on the emitter. If the `maxWait` parameter is specified, then at most
 * `maxWait` milliseconds will be waited before returning the default value `null`.
 *
 * @param emitter emitter to hook into
 * @param type the action type to listen on
 * @param maxWait the maximum time, in millis, to wait for the given action type
 */
export function take<T>(
  emitter: IEmitter,
  type: IActionType<T>,
  maxWait: number,
): Promise<T | null>;
export function take<T>(emitter: IEmitter, type: IActionType<T>, maxWait?: number) {
  return new Promise<T | null>((resolve) => {
    const unsubscribe = once(emitter, type, (value) => {
      if (handle !== 0) {
        clearTimeout(handle);
      }

      resolve(value);
    });

    const handle = maxWait !== undefined ? setTimeout(unsubscribe, maxWait) : 0;
  });
}

/**
 *
 * Equivalent to `emitter.put()`, exported as an Effect for consistency.
 *
 * @param emitter the emitter to use
 * @param action the action to emit
 */
export function put(emitter: IEmitter, action: IAction) {
  emitter.put(action);
}
