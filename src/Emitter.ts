import { IActionType, IEmitter } from "./types";
import { Chain } from "./utils/Chain";

interface IDispatchNode {
  type: string;
  payload: any;
  next: IDispatchNode | null;
}

export class Emitter implements IEmitter {
  private chains = new Map<string, Chain>();
  private end: IDispatchNode | null = null;

  public emit(type: IActionType<undefined>): void;
  public emit<T>(type: IActionType<T>, payload: T): void;
  public emit(type: string, payload?: any) {
    if (this.end !== null) {
      this.end = this.end.next = {
        type,
        payload,
        next: null,
      };
    } else {
      this.drain(type, payload);
    }
  }

  public on<T>(type: IActionType<T>, handler: (payload: T) => void) {
    let chain = this.chains.get(type);
    if (chain === undefined) {
      chain = new Chain();
      this.chains.set(type, chain);
    }

    chain.add(handler);
  }

  public off<T>(type: IActionType<T>, handler: (payload: T) => void) {
    const chain = this.chains.get(type);
    if (chain !== undefined) {
      chain.remove(handler);
    }
  }

  private drain(type: string, payload: any) {
    let node: IDispatchNode | null = (this.end = { type, payload, next: null });
    while (node !== null) {
      const chain = this.chains.get(node.type);
      if (chain !== undefined) {
        chain.emit(payload);
      }

      node = node.next;
    }

    this.end = null;
  }
}
