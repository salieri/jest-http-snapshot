import nock, { back as nockBack, BackContext, BackMode } from 'nock';
import { BaseAnalyzer } from './analyzer';
// import fs from 'fs';


interface NockBackManager {
  context: BackContext;
  nockDone: Function;
}

export class NockAnalyzer extends BaseAnalyzer {
  private nockBackManager?: NockBackManager;

  private oldFixtures?: any;

  protected async startExec(): Promise<void> {
    nockBack.setMode('record');

    this.oldFixtures = nockBack.fixtures;
    nockBack.fixtures = this.opts.snapshotPath;

    // fs.mkdirSync(this.opts.snapshotPath, { recursive: true });

    this.nockBackManager = await nockBack(this.getOutputFile());
  }


  protected async stopExec(): Promise<void> {
    if (!this.nockBackManager) {
      throw new Error('Could not access nockBack manager');
    }

    try {
      this.nockBackManager.context.assertScopesFinished();
    } finally {
      this.nockBackManager.nockDone();

      nockBack.fixtures = this.oldFixtures;
    }
  }


  public async clear(): Promise<void> {
    nockBack.setMode((process.env.NOCK_BACK_MODE || 'dryrun') as BackMode);
    nock.cleanAll();
    nock.enableNetConnect();
    nock.restore();
  }
}
