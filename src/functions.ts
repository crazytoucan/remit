import { Emitter } from "./Emitter";
import { IAction, IMessageChannel } from "./types";

export function channel<T>(str: string) {
  return (str as unknown) as IMessageChannel<T>;
}

export function createAction<T>(type: IMessageChannel<T>, payload: T): IAction {
  return { type, payload };
}

export function once<T>(emitter: Emitter, type: IMessageChannel<T>, cb: (t: T) => void) {
  const handler = (value: T) => {
    destroy();
    cb(value);
  };

  const destroy = emitter.on(type, handler);
  return destroy;
}

export function take<T>(emitter: Emitter, type: IMessageChannel<T>): Promise<T>;
export function take<T>(
  emitter: Emitter,
  type: IMessageChannel<T>,
  maxWait: number,
): Promise<T | null>;
export function take<T>(emitter: Emitter, type: IMessageChannel<T>, maxWait?: number) {
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
