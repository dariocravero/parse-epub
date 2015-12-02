import canIgnoreNode  from '../ignore-node';
import extractSmilData from '../smil-data';
import { getMediaOverlayItems } from '../smil';
import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import parsedFiles from './fixtures/parsed-files';
import parsedSmilData from './fixtures/parsed-smil-data';
import test from 'tape';
import uri from './fixtures/uri';

test('#canIgnoreNode', t => {
  const ignoreTextNode = {
    nodeType: 3,
    textContent: " " // whitespace
  };
  const noIgnoreTextNode = {
    nodeType: 3,
    textContent: "this node contains some text"
  };
  const ignoreCommentNode = {
    nodeType: 8,
    textContent: "<!-- comment -->"
  }
  t.notOk(canIgnoreNode(ignoreTextNode), 'text node with whitespace is ignored');
  t.ok(canIgnoreNode(noIgnoreTextNode), 'text node containing text is not ignored');
  t.notOk(canIgnoreNode(ignoreCommentNode), 'comment node is ignored');
  t.end()
});

test('#smilData', t => {
  const id = getMediaOverlayItems(manifest)[0];
  const refines = metadata.mediaOverlayDurations.find(mod => mod.refines === `#${id}`);
  const extracted = extractSmilData(parsedFiles[0], id, refines, '.');
  t.deepEqual(
    extracted,
    parsedSmilData
  );
  t.end()
});
