import getTocItem from '../get-toc-item';
import test from 'tape';

const manifest = {
  items: ['a', 'b', 'c'],
  byId: {
    'a': {
      properties: 'nav'
    },
    'b': {
      properties: ''
    },
    'c': {
      properties: ''
    }
  }
}

test('#getTocItem', t => {
  t.deepEquals(
    getTocItem(manifest),
    manifest.byId.a,
    'a toc item is an item on the manifest that has properties set to nav'
  );
  t.end();
});
