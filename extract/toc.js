import { join, dirname } from '../path-helpers.js';
import items from './items';
import getTocItem from './get-toc-item';
import uniqueId from 'mini-unique-id';

// Spec says we need to select the TOC using the epub:type=toc property
const TAG = 'nav[epub\\\:type~=toc]';
export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  const tocItem = getTocItem(manifest);
  const tocItemPath = dirname(tocItem.href);
  parse(tocHtml.querySelector(TAG), ROOT);

  function parse(snippet, id, href, label, parentId, level=0) {
    const hrefWithoutHash = href && join(tocItemPath, href.split('#')[0]);
    const manifestId = Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      const ol = snippet.querySelector('ol');
      let childNodes = [];

      if (ol) {
        childNodes = Array.prototype.filter.call(ol.children, node => node.tagName === 'LI')
          .map(node => {
            const link = node.querySelector('a');
            const childId = uniqueId();
            return parse(node, childId, link.getAttribute('href'), link.textContent, id, level+1) && childId;
          })
          .filter(id => id);
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
        linear: snippet.getAttribute('linear'),
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
