/* eslint-disable no-dupe-class-members, lines-between-class-members, no-unused-vars */

import NodeEnvironment from 'jest-environment-node';
import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { Circus } from '@jest/types';
import _ from 'lodash';
import path from 'path';

import { NockAnalyzer } from '../../analyzer';

interface RunningTest {
  testPath: string;
  test: any;
}

interface TestType {
  isLifecycle: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  testFn: Function;
  timeout: number;
  title: string;
}

export default class SnapEnvironment extends NodeEnvironment {
  public readonly testPath: string;

  private runningTests: RunningTest[] = [];

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    this.testPath = context.testPath;
  }

  async setup(): Promise<void> {
    // (this.global.it as any).snap = this.createSnapFunction('it', this.global.it);

    // eslint-disable-next-line no-underscore-dangle
    this.global.__snapsnap = this;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private createSnapFunction(methodName: string, method: Function): Function {
    // tslint:disable-next-line no-this-assignment
    const self = this; // eslint-disable-line

    return function jestTest(...args: any[]) {
      const type = self.determineType(methodName, args);
      const wrappedFn = self.createWrappedFunction(type);

      return type.isLifecycle ? method(wrappedFn, type.timeout) : method(type.title, wrappedFn, type.timeout);
    };
  }

  private determineType(method: string, args: any[]): TestType {
    const isLifecycle = ((args.length <= 2) && (typeof args[0] === 'function'));

    if (isLifecycle) {
      return {
        isLifecycle,
        testFn: args[0],
        timeout: args[1],
        title: method,
      };
    }

    return {
      isLifecycle,
      title: args[0],
      testFn: args[1],
      timeout: args[2],
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private createWrappedFunction(type: TestType): Function {
    return async () => {
      // eslint-disable-next-line no-underscore-dangle
      const test = (this.global.__snapsnap as SnapEnvironment).findRunningTest(type.title);

      const na = new NockAnalyzer(
        {
          identifier: `${this.getCleanTestFileName(test)}-${test.test.name}`, /* this.reporter.currentSpec?.fullName */
          snapshotPath: path.join(path.dirname(test.testPath), '__http__'), /* this.reporter.currentSpec?.testPath || '' */
        },
      );

      await na.run(() => (type.testFn.call({})));
    };
  }

  private getCleanTestFileName(test: RunningTest): string {
    const fn = path.basename(test.testPath); /* this.reporter.currentSpec?.testPath || '' */

    return _.reduce(
      [
        /.js$/,
        /.ts$/,
        /.jsx$/,
        /.tsx$/,
        /.test$/,
        /.spec$/,
      ],
      (aggregator, regex) => aggregator.replace(regex, ''),
      fn,
    );
  }

  handleTestEvent(event: Circus.AsyncEvent, state: Circus.State): void | Promise<void>;
  handleTestEvent(event: Circus.SyncEvent, state: Circus.State): void;
  handleTestEvent(event: Circus.AsyncEvent | Circus.SyncEvent, _state: Circus.State): void | Promise<void> {
    // console.log('Event', event.name);

    // eslint-disable-next-line default-case
    switch (event.name) {
      case 'test_start':
        this.addRunningTest(event.test, this.testPath);
        break;

      case 'test_done':
        this.removeRunningTest(event.test);
        break;

      case 'setup':
        (this.global.it as any).snap = this.createSnapFunction('it', this.global.it);
        break;
    }
  }

  private addRunningTest(test: any, testPath: string): void {
    this.removeRunningTest(test);

    this.runningTests.push({ test, testPath });
  }

  private removeRunningTest(test: any): void {
    this.runningTests = _.filter(this.runningTests, (t) => t.test !== test);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public findRunningTest(name: string): RunningTest {
    const found = _.filter(this.runningTests, (test) => (test.test.name === name));

    if (found.length > 1) {
      throw new Error(`Multiple running tests have the same name and function: '${name}' -- Use unique test names and run again.`);
    }

    if (found.length === 0) {
      throw new Error(`Could not identify running test: '${name}'`);
    }

    return found[0];
  }
}
