import { IAction, IActionType, IEmitter } from "./types";

const TRUE_PREDICATE = () => true;

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
  filter: (payload: T) => boolean,
  maxWait: number,
): Promise<T | null>;

export function take<T>(
  emitter: IEmitter,
  type: IActionType<T>,
  arg2?: number | Function, // tslint:disable-line:ban-types
  arg3?: number,
) {
  const filter = typeof arg2 === "function" ? arg2 : TRUE_PREDICATE;
  const maxWait = typeof arg2 === "number" ? arg2 : arg3;

  return new Promise<T | null>((resolve) => {
    const unsubscribe = emitter.on(type, (value: T) => {
      if (filter(value)) {
        if (timeout !== 0) {
          clearTimeout(timeout);
        }

        resolve(value);
      }
    });

    const timeout =
      maxWait !== undefined
        ? setTimeout(() => {
            unsubscribe();
            resolve(null);
          }, maxWait)
        : 0;
  });
}

/**
 * Equivalent to `emitter.on()`, exported as an Effect for consistency.
 *
 * @param emitter the emitter to hook into
 * @param type the action type to listen on
 * @param cb a callback called whenever the action is emitted
 */
export function takeEvery<T>(emitter: IEmitter, type: IActionType<T>, cb: (t: T) => void) {
  return emitter.on(type, cb);
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
