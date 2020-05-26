interface IHandler {
  (payload: any): void;
}

function pull<T>(arr: T[], value: T) {
  const idx = arr.indexOf(value);
  if (idx !== -1) {
    arr.splice(idx, 1);
  }
}

function noop(_payload: any) {
  // empty
}

function setWhere<T>(arr: T[], value: T, nextValue: T) {
  const idx = arr.indexOf(value);
  if (idx !== -1) {
    arr[idx] = nextValue;
  }
}

export class Chain {
  private dispatching = false;
  private chain: IHandler[] = [];
  private nextChain: IHandler[] | null = null;

  public emit(payload: any) {
    this.dispatching = true;
    const chain = this.chain;
    for (let i = 0; i < chain.length; i++) {
      try {
        chain[i](payload);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
      }
    }
    this.dispatching = false;
  }

  public add(handler: IHandler) {
    if (this.dispatching) {
      if (this.nextChain === null) {
        this.nextChain = [...this.chain, handler];
      } else {
        this.nextChain.push(handler);
      }
    } else {
      this.chain.push(handler);
    }
  }

  public remove(handler: IHandler) {
    if (this.dispatching) {
      if (this.nextChain === null) {
        this.nextChain = [...this.chain];
      }

      pull(this.nextChain, handler);
      setWhere(this.chain, handler, noop);
    } else {
      pull(this.chain, handler);
    }
  }
}
