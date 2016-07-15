import items from './items';
import getTocItem from './get-toc-item';
import uniqueId from 'lodash/utility/uniqueId';

const TAG = 'nav[id="toc"]';

export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  const tocItem = (manifest && getTocItem(manifest)) || {};

  parse(tocHtml.querySelector(TAG), ROOT);

  function parse(snippet, id, href, label, parentId, level=0) {
    const hrefWithoutHash = href && href.split('#')[0];
    const manifestId = manifest && Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Don't include the TOC reference item in the spine
    if ((manifest && tocItem.id !== manifestId) || !manifest) {
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

      // We mainly care about leaves as those are the ones that contain pages and are thus open
      if (isLeaf) {
        if(manifest) {
          byManifestId[manifestId] = id;
        }
        items.push(id);
      }

      byId[id] = {
        childNodes,
        id,
        isLeaf,
        href,
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
