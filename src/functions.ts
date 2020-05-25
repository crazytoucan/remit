import { Emitter } from "./Emitter";
import { IActionDefinition, IActionType } from "./types";

export function defineAction<T>(type: string) {
  const definition: IActionDefinition<T> = ((payload: T) => ({ type, payload })) as any;
  definition.TYPE = type as IActionType<T>;
  return definition;
}

export function on<T>(emitter: Emitter, type: IActionType<T>, cb: (t: T) => void) {
  return emitter.on(type, cb);
}

export function off<T>(emitter: Emitter, type: IActionType<T>, cb: (t: T) => void) {
  return emitter.off(type, cb);
}

export function once<T>(emitter: Emitter, type: IActionType<T>, cb: (t: T) => void) {
  const handler = (value: T) => {
    emitter.off(type, handler);
    cb(value);
  };

  emitter.on(type, handler);
  return { cancel: () => emitter.off(type, handler) };
}

export function take<T>(emitter: Emitter, type: IActionType<T>): Promise<T>;
export function take<T>(emitter: Emitter, type: IActionType<T>, maxWait: number): Promise<T | null>;
export function take<T>(emitter: Emitter, type: IActionType<T>, maxWait?: number) {
  return new Promise<T | null>((resolve) => {
    const o = once(emitter, type, (value) => {
      if (handle !== 0) {
        clearTimeout(handle);
      }

      resolve(value);
    });

    const handle = maxWait !== undefined ? setTimeout(o.cancel, maxWait) : 0;
  });
}
