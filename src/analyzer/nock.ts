import nock, { back as nockBack, BackContext, BackMode } from 'nock';
import fs from 'fs';

import { BaseAnalyzer } from './analyzer';


interface NockBackManager {
  context: BackContext;
  nockDone: Function;
}

export class NockAnalyzer extends BaseAnalyzer {
  private nockBackManager?: NockBackManager;

  private oldFixtures?: any;

  private shouldCleanUpOnFailure = false;

  private didFail = false;

  protected async startExec(): Promise<void> {
    nockBack.setMode('record');

    this.oldFixtures = nockBack.fixtures;
    nockBack.fixtures = this.opts.snapshotPath;

    this.shouldCleanUpOnFailure = !fs.existsSync(this.getOutputFile(true));

    this.nockBackManager = await nockBack(this.getOutputFile());
  }


  protected async stopExec(): Promise<void> {
    if (!this.nockBackManager) {
      throw new Error('Could not access nockBack manager');
    }

    try {
      if (!this.didFail) {
        this.nockBackManager.context.assertScopesFinished();
      }
    } finally {
      this.nockBackManager.nockDone();

      if ((this.shouldCleanUpOnFailure) && (this.didFail)) {
        fs.unlinkSync(this.getOutputFile(true));
      }

      nockBack.fixtures = this.oldFixtures;
    }
  }


  protected async onFailure(): Promise<void> {
    this.didFail = true;
  }


  public async clear(): Promise<void> {
    nockBack.setMode((process.env.NOCK_BACK_MODE || 'dryrun') as BackMode);
    nock.cleanAll();
    nock.enableNetConnect();
    nock.restore();
  }
}
