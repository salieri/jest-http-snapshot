# Snapsnap

Capture, cache, and replay HTTP queries in your tests using [Nock](https://github.com/nock/nock). 

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

