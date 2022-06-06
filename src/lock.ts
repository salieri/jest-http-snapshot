import AsyncLock from 'async-lock';

import { LockManager } from './lock-manager';


export class Locker {
  private static readonly LOCK_NAME = 'snapshot-mock-lock';

  private lock = new AsyncLock();

  public acquire(): Promise<LockManager> {
    return new Promise(
      (resolve, reject) => {
        try {
          this.lock.acquire(
            Locker.LOCK_NAME,
            async () => {
              const lm = new LockManager();

              resolve(lm); // ready to execute

              await lm.get(); // wait until executed
            },
          ).catch((err) => reject(err));
        } catch (err) {
          reject(err);
        }
      },
    );
  }
}

export const globalLock = new Locker();
