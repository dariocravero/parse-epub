import fetchMock from 'fetch-mock/client';
import test from 'tape';
import xml from '../xml';


test('fetch #xml', async t => {
  fetchMock.mock({
    routes: {
      name: 'xml',
      matcher: 'https://some.xml',
      // objects will be converted to strings using JSON.stringify before being returned
      response: {
        body: `<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
        <some xml='true'></some>
    </container>`
      }
    }
  });

  const res = await xml('https://some.xml')
  t.notEquals(res.documentElement.nodeName, 'HTML', 'is not HTML');
  t.ok(res.querySelector('some').getAttribute('xml'), 'has some value');

  fetchMock.restore();

  t.end();
});
