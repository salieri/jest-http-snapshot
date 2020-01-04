import path from 'path';

import { NockAnalyzer } from '../../analyzer';
import { Reporter } from './reporter';

interface TestType {
  isLifecycle: boolean;
  testFn: Function;
  timeout: number;
  title: string;
}


class JestIntegration {
  private reporter = new Reporter();

  private jasmine = (global as any).jasmine;

  private jasmineEnv = this.jasmine.getEnv();

  integrate(): void {
    this.jasmineEnv.addReporter(this.reporter);

    const g = global as any;

    g.it.snap = this.createSnapFunction('it', g.it);
  }

  createSnapFunction(methodName: string, method: Function): Function {
    // tslint:disable-next-line no-this-assignment
    const self = this; // eslint-disable-line

    return function jestTest(...args: any[]) {
      const type = self.determineType(methodName, args);
      const wrappedFn = self.createWrappedFunction(type.testFn);

      return type.isLifecycle ? method(wrappedFn, type.timeout) : method(type.title, wrappedFn, type.timeout);
    };
  }


  determineType(method: string, args: any[]): TestType {
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

  createWrappedFunction(testFn: Function): Function {
    return async () => {
      const na = new NockAnalyzer(
        {
          identifier: this.reporter.currentSpec.fullName,
          snapshotPath: path.join(path.dirname(this.reporter.currentSpec.testPath), '__http__'),
        },
      );

      await na.run(() => (testFn.call({})));
    };
  }
}


export function jest(): void {
  const ji = new JestIntegration();

  ji.integrate();
}

