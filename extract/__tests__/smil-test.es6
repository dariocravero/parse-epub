import fetchMock from 'fetch-mock/client';
import { parsedSmils as files } from './fixtures/files';
import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import routes from './fixtures/routes'
import smil, { getSmilFromManifest, fetchAll, parseAll } from '../smil';
import uri from './fixtures/uri';
import test from 'tape';

test('#getSmilFromManifest', t => {
  t.deepEquals(
    getSmilFromManifest(manifest),
    [ 'ch01', 'ch02' ]
  );
  t.end();
});

test('#fetchAll', t => {
  fetchMock.mock({ routes: routes });
  const items = getSmilFromManifest(manifest);
  fetchAll(uri, items, manifest).then(results => {
    t.equals(results[0].contentType, 'application/xml');
    fetchMock.restore();
    t.end();
  }).catch(error => t.fail(error));
});

test('#parseAll', t => {
  const items = getSmilFromManifest(manifest);
  const parsed = parseAll(items, manifest, metadata)(files);
  t.equals(!!parsed.byId, true);
  t.equals(!!parsed.items, true);
  t.end();
});

test('#smil', t => {
  const items = getSmilFromManifest(manifest);
  smil(uri, manifest, metadata).then(result => {
    t.equals(!!result.byId, true);
    t.equals(!!result.items, true);
    t.end();
  }).catch(error => console.log(error));
});
