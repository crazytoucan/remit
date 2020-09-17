import { IJobHandle, IJobMonitor } from "./types";
import { Chain } from "./utils/Chain";

class Job implements IJobMonitor, IJobHandle {
  private killChain = new Chain();
  private cleanupChain = new Chain();

  public stopped = false;

  public kill() {
    if (!this.stopped) {
      this.stopped = true;
      this.killChain.emit(null);
      this.cleanupChain.emit(null);
    }
  }

  public finish() {
    if (!this.stopped) {
      this.stopped = true;
      this.cleanupChain.emit(null);
    }
  }

  public onCleanup(cb: () => void) {
    this.cleanupChain.add(cb);
    return () => this.cleanupChain.remove(cb);
  }

  public onKill(cb: () => void) {
    this.killChain.add(cb);
    return () => this.killChain.remove(cb);
  }
}

export function spawn<TARGS extends readonly unknown[]>(
  fn: (mon: IJobMonitor, ...args: TARGS) => void,
  ...args: TARGS
): IJobHandle {
  const job = new Job();
  try {
    fn(job, ...args);
  } catch (e1) {
    // tslint:disable-next-line:no-console
    console.error(e1);
    try {
      job.kill();
    } catch (e2) {
      // tslint:disable-next-line:no-console
      console.error(e2);
    }
  }

  return job;
}
