import { join, getDirname } from '../path-helpers.js';
import getTocItem from './get-toc-item.js';
import uniqueId from '../unique-id.js';

// Spec says we need to select the TOC using the epub:type=toc property
const NAV_ATTRIBUTE = 'epub:type';
const NAV_VALUE = 'toc';
export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];
  const tocRoot = findTocRoot(tocHtml.html.body);
  if (!tocRoot) {
    throw 'The root node of your navigation document (table of contents) could not be found. Please ensure the file contains a nav element with an attribute of epub:type="toc"';
  }
  const tocItem = getTocItem(manifest);
  const tocItemPath = getDirname(tocItem.href);
  parse(tocRoot, ROOT);

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

function findTocRoot(currentNode) {
  let found = false;
  Object.keys(currentNode).find(key => {
    if (isRootNode(currentNode[key])) {
      found = currentNode[key];
      return true;
    }
    if (typeof currentNode[key] === 'object') {
      return found = findTocRoot(currentNode[key]);
    }
  });
  return found;
}

function isRootNode(node) {
  if (typeof node !== 'undefined') {
    return (node.hasOwnProperty(NAV_ATTRIBUTE) && node[NAV_ATTRIBUTE] === NAV_VALUE && node.hasOwnProperty('ol'));
  } else {
    return false;
  }
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
