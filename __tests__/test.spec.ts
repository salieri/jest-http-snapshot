import 'isomorphic-fetch';
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
  'should resolve another query',
  async () => {
    const response = await fetch('https://postman-echo.com/get?another=query');

    expect(await response.json()).toMatchSnapshot();
  },
);
