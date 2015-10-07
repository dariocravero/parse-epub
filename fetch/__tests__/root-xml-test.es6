import fetchMock from 'fetch-mock/client';
import test from 'tape';
import rootXml from '../root-xml';

test('fetch #rootXml', async t => {
  fetchMock.mock({
    routes: {
      name: 'root-file',
      matcher: 'https://book.com/META-INF/container.xml',
      // objects will be converted to strings using JSON.stringify before being returned
      response: {
        body: `<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
    <rootfiles>
    <rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
    </container>`
      }
    }
  });

  const res = await rootXml('https://book.com', 'META-INF/container.xml');
  t.equals(res.querySelector('rootfile').getAttribute('full-path'), 'OPS/package.opf');

  fetchMock.restore();
  t.end();
});
