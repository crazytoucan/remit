import { IAction, IStore } from "./types";
import { defer } from "./utils/defer";
import { ListenerList } from "./utils/ListenerList";
import { noop } from "./utils/noop";

export class Store<S> implements IStore<S> {
  private listeners = new ListenerList();

  /**
   * Constructs a Store with the given initial state and dispatch function.
   *
   * @param state initial state
   * @param dispatch function called whenever a React component emits an Action using `dispatch()`
   */
  constructor(public state: S, public dispatch: (action: IAction) => void = noop) {}

  public getState() {
    return this.state;
  }

  public setState(nextState: S) {
    if (nextState !== this.state) {
      this.state = nextState;
      this.notifySubscribers();
    }
  }

  public subscribe(cb: () => void) {
    return this.listeners.add(cb);
  }

  public flush() {
    this.notifySubscribers.flush();
  }

  private notifySubscribers = defer(() => {
    this.listeners.emit(null);
  });
}
