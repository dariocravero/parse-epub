import { join, getDirname } from '../path-helpers.js';
import getTocItem from './get-toc-item.js';
import uniqueId from '../unique-id.js';

// Spec says we need to select the TOC using the epub:type=toc property
const TAG = 'nav[epub\\\:type~=toc]';
export const ROOT = '__root__';

// TODO do the same as manifest
export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  const tocItem = getTocItem(manifest);
  const tocItemPath = getDirname(tocItem.href);
  parse(tocHtml.html.body.nav, ROOT);

  function parse(rootNode, id, href, label, parentId, level=0) {
    const hrefWithoutHash = href && join(tocItemPath, href.split('#')[0]);
    const manifestId = Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      const { ol } = rootNode;
      let childNodes = [];

      if (ol) {
        childNodes = Array.from(ol.li).map(node => {
          const link = node.a;
          const childId = uniqueId();
          return parse(node, childId, link.href, link.__text, id, level+1) && childId;
        }).filter(Boolean);
      }

      const isLeaf = childNodes.length === 0;

      // We mainly care about leafs as those are the ones that contain pages and are thus open
      if (isLeaf) {
        byManifestId[manifestId] = id;
        items.push(id);
      }

      byId[id] = {
        childNodes,
        id,
        isLeaf,
        href: hrefWithoutHash,
        label,
        level,
        linear: rootNode.linear,
        manifestId,
        parentId
      };

      return true;
    } else {
      return false;
    }
  }

  return {
    byId,
    byManifestId,
    items
  };
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
