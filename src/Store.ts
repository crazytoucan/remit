import { IAction } from "./types";
import { Chain } from "./utils/Chain";
import { defer } from "./utils/defer";

export class Store<S> {
  private chain = new Chain();

  public constructor(public state: S, public dispatch: (action: IAction) => void) {}
  public getState() {
    return this.state;
  }

  public setState(nextState: S) {
    if (nextState !== this.state) {
      this.state = nextState;
      this.notifyLater();
    }
  }

  public subscribe(cb: () => void) {
    this.chain.add(cb);
    return () => this.chain.remove(cb);
  }

  public flush() {
    this.notifyLater.flush();
  }

  private notifyLater = defer(() => {
    this.chain.emit(undefined);
  });
}
