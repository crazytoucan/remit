import { IAction, IViewStore } from "./types";
import { Chain } from "./utils/Chain";
import { defer } from "./utils/defer";

export class ViewStore<S> implements IViewStore<S> {
  private chain = new Chain();

  public constructor(public state: S, public dispatch: (action: IAction) => void) {}
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
    this.chain.add(cb);
    return () => this.chain.remove(cb);
  }

  public flush() {
    this.notifySubscribers.flush();
  }

  private notifySubscribers = defer(() => {
    this.chain.emit(undefined);
  });
}
