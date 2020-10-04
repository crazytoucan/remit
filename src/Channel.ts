import { IAction, IActionType, IChannel } from "./types";
import { defer } from "./utils/defer";
import { ListenerList } from "./utils/ListenerList";
import { noop } from "./utils/noop";

export interface IChannelOpts {
  afterEmpty?: () => void;
}

class Node {
  public next: Node | null = null;
  constructor(public type: string, public payload: unknown) {}
}

const enum Status {
  IDLE,
  SCHEDULED,
  DRAINING,
}

export class Channel implements IChannel {
  private eventLists = new Map<string, ListenerList>();
  private status = Status.IDLE;
  private front = new Node("", null);
  private end = this.front;
  private afterEmpty: () => void;

  constructor(opts: IChannelOpts = {}) {
    this.afterEmpty = opts.afterEmpty ?? noop;
  }

  public put(action: IAction) {
    this.end = this.end.next = new Node(action.type, action.payload);
    if (this.status === Status.IDLE) {
      this.status = Status.SCHEDULED;
      this.drainDefer();
    }
  }

  public put2(type: IActionType<void>): void;
  public put2<T>(type: IActionType<T>, payload: T): void;
  public put2(type: string, payload?: any) {
    this.put({ type, payload });
  }

  public on<T>(type: IActionType<T>, handler: (payload: T) => void) {
    let list = this.eventLists.get(type);
    if (list === undefined) {
      list = new ListenerList();
      this.eventLists.set(type, list);
    }

    return list.add(handler);
  }

  private drainDefer = defer(() => {
    this.status = Status.DRAINING;
    let iter = this.front.next;
    this.front.next = null; // release chain while we're iterating
    while (iter !== null) {
      const chain = this.eventLists.get(iter.type);
      if (chain !== undefined) {
        chain.emit(iter.payload);
      }

      iter = iter.next;
    }

    this.end = this.front;
    this.status = Status.IDLE;
    this.afterEmpty();
  });
}
