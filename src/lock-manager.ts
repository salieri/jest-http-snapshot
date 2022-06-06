export class LockManager {
  private promise   : Promise<void>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  private resolver? : Function;

  public constructor() {
    this.promise = new Promise(
      (resolve) => {
        this.resolver = resolve;
      },
    );
  }

  public release(): void {
    if (!this.resolver) {
      throw new Error('Unknown resolver');
    }

    this.resolver();

    delete this.resolver;
  }

  public get(): Promise<void> {
    return this.promise;
  }
}

