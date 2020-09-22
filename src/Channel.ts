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
  private end: Node | null = null;
  private afterEmpty: () => void;

  constructor(opts: IChannelOpts = {}) {
    this.afterEmpty = opts.afterEmpty ?? noop;
  }

  public put(action: IAction) {
    if (this.end !== null) {
      this.end.next = new Node(action.type, action.payload);
      this.end = this.end.next;
    } else {
      this.end = new Node(action.type, action.payload);
    }

    if (this.status === Status.IDLE) {
      this.status = Status.SCHEDULED;
      this.drainDefer();
    }
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
    let iter = this.end;
    while (iter !== null) {
      const chain = this.eventLists.get(iter.type);
      if (chain !== undefined) {
        chain.emit(iter.payload);
      }

      iter = iter.next;
    }

    this.end = null;
    this.status = Status.IDLE;
    this.afterEmpty();
  });
}
