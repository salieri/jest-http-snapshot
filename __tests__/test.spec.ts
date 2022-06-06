import fetch from 'node-fetch';

import '../src/declarations';

it.snap(
  'should deal with error responses',
  async () => {
    const response = await fetch('https://postman-echo.com/missinig-incorrect-url');

    expect(response.status).toEqual(404);
  },
);

it.snap(
  'should use Nock Back cache to resolve queries',
  async () => {
    const response = await fetch('https://postman-echo.com.broken:4443/get?foo1=bar1&foo2=bar2');

    expect(await response.json()).toMatchSnapshot();
  },
);

it.snap(
  'should resolve queries',
  async () => {
    const url = 'https://postman-echo.com/get?another=query';
    const response = await fetch(url);

    const data = await response.json();

    expect(data.url).toEqual(url);
    expect(data.args.another).toEqual('query');
    expect(data.headers.host).toEqual('postman-echo.com');

    expect(data).toMatchSnapshot();
  },
);
