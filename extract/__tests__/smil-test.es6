import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import smil, { getSmilFromManifest } from '../smil';
import test from 'tape';

test('#getSmilFromManifest', t => {
  t.deepEquals(
    getSmilFromManifest(manifest),
    [ 'btitle', 'intro', 'preface', 'author', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05' ]
  );
  t.end();
});

test('TODO #fetchAll', t => t.end());

test('TODO #parseAll', t => t.end());

test('TODO #smil', t => {

//   t.deepEquals(smil(manifest), [{
//   }]);

  t.end();
});


// import rootXml from './fixtures/package.opf';
// import metadata from '../metadata';
// console.log(JSON.stringify(metadata(rootXml, manifest)));
