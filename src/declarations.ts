/* eslint-disable @typescript-eslint/no-namespace, no-redeclare */

export {};

declare global {
  namespace jest {
    interface It {
      snap: It;
    }
  }
}
