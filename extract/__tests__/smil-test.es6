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


const domParser = new DOMParser();

test('#getSmilFromManifest', t => {
  const smils = getSmilFromManifest(manifest);
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
    console.log('results[0].nodeName', results[0].documentElement.innerText);
    t.equal(results[0].contentType, 'application/xml');
    t.equal(results[1].contentType, 'application/xml');
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
  fetchMock.mock({ routes });
  smil(uri, manifest, metadata).then(result => {
    t.ok(!!result.byId, 'it has byId');
    t.ok(!!result.items, 'it has items');
    fetchMock.restore();
    t.end();
  }).catch(error => t.fail(error));
});
