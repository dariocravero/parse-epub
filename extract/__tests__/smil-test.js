import fetchMock from 'fetch-mock/client';
import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import parsedFiles from './fixtures/parsed-files';
import routes from './fixtures/routes'
import smil, { getMediaOverlayItems, fetchAll, parseAll } from '../smil';
import uri from './fixtures/uri';
import test from 'tape';


const domParser = new DOMParser();

test('#getMediaOverlayItems', t => {
  const smils = getMediaOverlayItems(manifest);
  t.deepEquals(
    getMediaOverlayItems(manifest),
    [ 's001', 's003', 's004', 's005', 's006', 's007', 's008', 's009', 's010' ]
  );
  t.end();
});

test('#fetchAll', t => {
  fetchMock.mock({ routes });

  const items = getMediaOverlayItems(manifest);
  fetchAll(uri, items, manifest).then(results => {
    t.equal(results[0].contentType, 'application/xml');
    t.equal(results[1].contentType, 'application/xml');
    fetchMock.restore();
    t.end();
  }).catch(error => t.fail(error));
});

test('#parseAll', t => {
  const items = getMediaOverlayItems(manifest);
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
