# Snapsnap

Capture, cache, and replay HTTP queries in your tests using [Nock](https://github.com/nock/nock). 

[![Travis CI](https://travis-ci.org/salieri/snapsnap.svg?branch=master)](https://travis-ci.org/salieri/snapsnap/)
[![Coverage Status](https://coveralls.io/repos/github/salieri/snapsnap/badge.svg?branch=master)](https://coveralls.io/github/salieri/snapsnap?branch=master)
[![Codecov](https://codecov.io/gh/salieri/snapsnap/branch/master/graph/badge.svg)](https://codecov.io/gh/salieri/snapsnap)
[![Codacy](https://api.codacy.com/project/badge/Grade/8dd26d6a15764bb3a1c0b6c244c28218)](https://www.codacy.com/app/salieri/snapsnap?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=salieri/snapsnap&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/03f89b0f947a52e6c5d2/maintainability)](https://codeclimate.com/github/salieri/snapsnap/maintainability)
[![David](https://david-dm.org/salieri/snapsnap.svg)](https://david-dm.org/salieri/snapsnap)
[![David](https://david-dm.org/salieri/snapsnap/dev-status.svg)](https://david-dm.org/salieri/snapsnap?type=dev)



1.  On the first run, real HTTP queries are made.
1.  The queries and the responses are stored in `__http__/`.
1.  On subsequent runs, cached responses are loaded from `__http__/` and used instead of real queries.


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

#### 1. Create a `snap-setup.js` file in your project

```js
// ./snap-setup.js
import { integrations } from 'snapsnap';

integrations.jest();
```

#### 2. Configure Jest to load `snap-setup.js`

```js
// ./jest.config.js
module.exports = {
  setupFilesAfterEnv: ['./snap-setup.js']
};
```


## Acknowledgments

Based on [Jest Nock Back](https://github.com/jonjaques/jest-nock-back) and [Jest Nock](https://github.com/spring-media/jest-nock).

