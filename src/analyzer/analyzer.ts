import path from 'path';
import _ from 'lodash';

import { globalLock } from '../lock';
import { LockManager } from '../lock-manager';

export interface AnalyzerOpts {
  snapshotPath  : string;
  identifier    : string;
}

export abstract class BaseAnalyzer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private static readonly LOCK_NAME = 'mock-analyzer-lock';

  private lockManager? : LockManager;

  protected running = false;

  protected hasRun = false;

  protected readonly opts: AnalyzerOpts;


  public constructor(opts: AnalyzerOpts) {
    this.opts = opts;
  }


  public async start(): Promise<void> {
    if (this.hasRun) {
      throw new Error('Tried to run multiple times');
    }

    if (this.running) {
      throw new Error('Tried to start() while already running');
    }

    this.hasRun = true;
    this.lockManager = await globalLock.acquire();

    await this.clear();

    try {
      await this.startExec();

      this.running = true;
    } catch (err) {
      this.releaseLock();
      throw err;
    }
  }


  public async stop(): Promise<void> {
    if (!this.running) {
      throw new Error('Tried to stop() while not running');
    }

    try {
      await this.stopExec();
      await this.clear();
    } finally {
      this.releaseLock();
    }
  }


  public async run(callback: () => Promise<void>|void): Promise<void> {
    await this.start();

    try {
      await callback();
    } finally {
      await this.stop();
    }
  }


  private releaseLock(): void {
    if (!this.lockManager) {
      throw new Error('Tried to release lock when one was not acquired');
    }

    this.lockManager.release();

    delete this.lockManager;
  }


  protected getOutputFile(withPath = false, extension = 'json.htsnap'): string {
    const fn = `${_.kebabCase(this.opts.identifier)}.${extension}`;

    return withPath
      ? path.join(this.opts.snapshotPath, fn)
      : fn;
  }


  protected abstract startExec(): Promise<void>;

  protected abstract stopExec(): Promise<void>;

  public abstract clear(): Promise<void>;
}
