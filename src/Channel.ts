import { IAction, IActionType, IChannel } from "./types";
import { ListenerList } from "./utils/Chain";

interface IDispatchNode {
  type: string;
  payload: any;
  next: IDispatchNode | null;
}

export class Channel implements IChannel {
  private chains = new Map<string, ListenerList>();
  private end: IDispatchNode | null = null;

  constructor(private
  public put(action: IAction) {
    const next: IDispatchNode = { type: action.type, payload: action.payload, next: null };
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
      chain = new ListenerList();
      this.chains.set(type, chain);
    }

    chain.add(handler);
    return () => {
      chain!.remove(handler);
    };
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
