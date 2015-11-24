import canIgnoreNode  from '../ignore-node';
import extractSmilData from '../smil-data';
import { getSmilFromManifest } from '../smil';
import manifest from './fixtures/manifest';
import metadata  from './fixtures/metadata';
import parsedFiles from './fixtures/parsed-files';
import test from 'tape';


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
  const i = 0;
  const xml = parsedFiles[i];
  const manifestItem = manifest.byId;
  const id = getSmilFromManifest(manifest)[i];
  const refines = metadata.mediaOverlayDurations.find(mod => mod.refines === `#${id}`);
  const result = extractSmilData(xml, id, refines);

  t.equal(result.body.nodeType, 'body', 'the 1st child of the root node is body');
  t.equal(result.body.childNodes[0].nodeType, 'seq', 'the 1st child of the body is a seq');
  t.ok(result.body.childNodes[0].textref, 'the seq has the required textref attribute');
  t.end()
});
