import { pull } from "./collectionUtils";

class Entry {
  public destroyed = false;
  constructor(public cb: (payload: unknown) => void) {}
}

export class ListenerList {
  private dispatching = false;
  private entries: Entry[] = [];
  private nextEntries: Entry[] | null = null;

  public emit(payload: unknown) {
    if (this.dispatching) {
      throw new Error("emit() when already emitting");
    }

    this.dispatching = true;
    const chain = this.entries;
    for (let i = 0; i < chain.length; i++) {
      if (chain[i].destroyed) {
        continue;
      }

      try {
        chain[i].cb(payload);
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
      }
    }

    this.dispatching = false;
    if (this.nextEntries !== null) {
      this.entries = this.nextEntries.filter((v) => v !== null) as Entry[];
      this.nextEntries = null;
    }
  }

  public add(cb: (payload: unknown) => void) {
    const entry = new Entry(cb);
    if (this.dispatching) {
      if (this.nextEntries === null) {
        this.nextEntries = [...this.entries, entry];
      } else {
        this.nextEntries.push(entry);
      }
    } else {
      this.entries.push(entry);
    }

    return () => this.destroy(entry);
  }

  private destroy(entry: Entry) {
    entry.destroyed = true;
    if (this.dispatching) {
      if (this.nextEntries === null) {
        this.nextEntries = [...this.entries];
      }

      pull(this.nextEntries, entry);
    } else {
      pull(this.entries, entry);
    }
  }
}
