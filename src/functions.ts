import { Emitter } from "./Emitter";
import { IAction, IActionType } from "./types";

export function defineAction<T>(str: string) {
  return (str as unknown) as IActionType<T>;
}

export function createAction<T>(type: IActionType<T>, payload: T): IAction {
  return { type, payload };
}

export function once<T>(emitter: Emitter, type: IActionType<T>, cb: (t: T) => void) {
  const handler = (value: T) => {
    destroy();
    cb(value);
  };

  const destroy = emitter.on(type, handler);
  return destroy;
}

export function take<T>(emitter: Emitter, type: IActionType<T>): Promise<T>;
export function take<T>(
  emitter: Emitter,
  type: IActionType<T>,
  maxWait: number,
): Promise<T | null>;
export function take<T>(emitter: Emitter, type: IActionType<T>, maxWait?: number) {
  return new Promise<T | null>((resolve) => {
    let handle = 0;
    if (maxWait !== undefined) {
      const timeoutCallback = () => {
        destroy();
        resolve(null);
      };

      setTimeout(timeoutCallback, maxWait);
    }

    const emitterCallback = (value: T) => {
      destroy();
      if (handle !== 0) {
        clearTimeout(handle);
      }

      resolve(value);
    };

    const destroy = emitter.on(type, emitterCallback);
  });
}
