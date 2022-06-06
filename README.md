# Snapsnap

Capture, cache, and replay HTTP queries in your tests using [Nock](https://github.com/nock/nock). 

[![Coverage Status](https://coveralls.io/repos/github/salieri/snapsnap/badge.svg?branch=master)](https://coveralls.io/github/salieri/snapsnap?branch=master)
[![Codecov](https://codecov.io/gh/salieri/snapsnap/branch/master/graph/badge.svg)](https://codecov.io/gh/salieri/snapsnap)
[![Codacy](https://api.codacy.com/project/badge/Grade/8dd26d6a15764bb3a1c0b6c244c28218)](https://www.codacy.com/app/salieri/snapsnap?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=salieri/snapsnap&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/03f89b0f947a52e6c5d2/maintainability)](https://codeclimate.com/github/salieri/snapsnap/maintainability)

1. On the first run, the tests make real HTTP queries.
2. The queries and the responses are stored in `__http__/`.
3. On subsequent runs, cached responses are loaded from `__http__/` and used instead of real queries.
4. This is super helpful if your tests run in an environment that has no internet access, or you wish to maintain a snapshot of the responses.

## Usage

Snapsnap behaves similarly to Jest Snapshots. If an HTTP query has not been snapshotted, a real HTTP query will be made. Otherwise, a cached version of the query will be returned.

To signal that a test should be snapshotted, simply use `it.snap()` instead of `it()`. The framework will manage the rest.

```js
it.snap(
  'should query the API',
  async () => {
    const result = await request('https://postman-echo.com/get?foo1=bar1&foo2=bar2');
    const json = await result.json();
    
    expect(json).toMatchSnapshot();
  }
);
```

## Setting Up

### Jest
Supports Jest with [Circus](https://www.npmjs.com/package/jest-circus) (=default) test runner. 

#### Configuring Jest
Snapsnap is implemented as a [test environment](https://jestjs.io/docs/configuration#testenvironment-string) that extends Jest's built-in `NodeEnvironment`.

```js
// ./jest.config.js
module.exports = {
  testEnvironment: 'snapsnap/jest-env.js'
};
```

## Acknowledgments

Based on [Jest Nock Back](https://github.com/jonjaques/jest-nock-back) and [Jest Nock](https://github.com/spring-media/jest-nock).

