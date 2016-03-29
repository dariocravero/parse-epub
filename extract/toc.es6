import find from 'array-find';
import items from './items';
import getTocItem from './get-toc-item';
import uniqueId from 'lodash/utility/uniqueId';

const TAG = 'nav[id="toc"]';

export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  const tocItem = getTocItem(manifest);

  parse(tocHtml.querySelector(TAG), ROOT);

  function parse(snippet, id, href, label, parentId) {
    const hrefWithoutHash = href && href.split('#')[0];
    const manifestId = find(Object.keys(manifest.byId), id => {
      const { href } = manifest.byId[id];
      return href === hrefWithoutHash || href.split('/').pop() === hrefWithoutHash;
    });

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      const ol = snippet.querySelector('ol');
      let childNodes = [];

      if (ol) {
        childNodes = Array.prototype.filter.call(ol.children, node => node.tagName === 'LI')
          .map(node => {
            const link = node.querySelector('a');
            const childId = uniqueId();
            return parse(node, childId, link.getAttribute('href'), link.textContent, id) && childId;
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
        href,
        label,
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
