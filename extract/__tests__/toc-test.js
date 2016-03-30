import manifest from './fixtures/manifest';
import spine from './fixtures/spine';
import test from 'tape';
import toc from '../toc';
import tocHtml from './fixtures/toc-html';
import tocJson from './fixtures/toc-json';

test('#toc', t => {
  const calc = toc(tocHtml, manifest, spine);

  t.deepEquals(
    calc.items,
    tocJson.items,
    'items'
  );

  t.deepEquals(
    calc.byManifestId,
    tocJson.byManifestId,
    'byManifestId'
  );

  calc.items.forEach(id => {
    t.deepEquals(
      calc.byId[id],
      tocJson.byId[id],
      `item ${id}`
    );
  })

  t.end();
});
