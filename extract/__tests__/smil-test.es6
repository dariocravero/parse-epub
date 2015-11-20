import 'core-js/modules/es6.promise';
import 'whatwg-fetch';

import fetchMock from 'fetch-mock/client';
import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import parsedFiles from './fixtures/parsed-files';
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
  fetchMock.mock({ routes });

  const items = getSmilFromManifest(manifest);
  fetchAll(uri, items, manifest).then(results => {
    console.log('results', results)
    // TODO

    fetchMock.restore();

    t.end();
  }).catch(error => t.fail(error));
});

test('#parseAll', t => {
  const items = getSmilFromManifest(manifest);
  const parsed = parseAll(items, manifest, metadata)(parsedFiles);
  t.ok(!!parsed.byId, 'it has byId');
  t.ok(!!parsed.items, 'it has items');
  t.end();
});

test('#smil', t => {
  const items = getSmilFromManifest(manifest);
  smil(uri, manifest, metadata).then(result => {
    t.ok(!!result.byId);
    t.ok(!!result.items);
    t.end();
  }).catch(error => console.log(error));
});
