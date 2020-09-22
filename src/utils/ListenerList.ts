import { pull, replaceFirst } from "./collectionUtils";
import { noop } from "./noop";

interface IListener {
  (payload: unknown): void;
}

export class ListenerList {
  private dispatching = false;
  private entries: IListener[] = [];
  private nextEntries: IListener[] | null = null;

  public emit(payload: unknown) {
    if (this.dispatching) {
      throw new Error("emit() when already emitting");
    }

    this.dispatching = true;
    const chain = this.entries;
    for (let i = 0; i < chain.length; i++) {
      try {
        chain[i](payload);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
      }
    }

    this.dispatching = false;
    if (this.nextEntries !== null) {
      this.entries = this.nextEntries;
      this.nextEntries = null;
    }
  }

  public add(cb: (payload: any) => void) {
    if (this.dispatching) {
      if (this.nextEntries === null) {
        this.nextEntries = [...this.entries, cb];
      } else {
        this.nextEntries.push(cb);
      }
    } else {
      this.entries.push(cb);
    }

    return () => this.destroy(cb);
  }

  private destroy(cb: IListener) {
    if (this.dispatching) {
      if (this.nextEntries === null) {
        this.nextEntries = [...this.entries];
      }

      pull(this.nextEntries, cb);
      replaceFirst(this.entries, cb, noop);
    } else {
      pull(this.entries, cb);
    }
  }
}
