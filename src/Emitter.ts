import { IAction, IActionType, IEmitter } from "./types";
import { Chain } from "./utils/Chain";

interface IDispatchNode {
  type: string;
  payload: any;
  next: IDispatchNode | null;
}

export class Emitter implements IEmitter {
  private chains = new Map<string, Chain>();
  private end: IDispatchNode | null = null;

  public put({ type, payload }: IAction) {
    const next: IDispatchNode = { type, payload, next: null };
    if (this.end !== null) {
      this.end = this.end.next = next;
    } else {
      this.end = next;
      this.drain();
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

  private drain() {
    let node: IDispatchNode | null = this.end;
    while (node !== null) {
      const chain = this.chains.get(node.type);
      if (chain !== undefined) {
        chain.emit(node.payload);
      }

      node = node.next;
    }

    this.end = null;
  }
}
