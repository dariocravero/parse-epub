import { join, getDirname } from '../path-helpers.js';
import getTocItem from './get-toc-item.js';
import uniqueId from '../unique-id.js';

// Spec says we need to select the TOC using the epub:type=toc property
const EPUB_TYPE = 'epub:type';
const NAV_ROOT = 'toc';
const PAGE_LIST = 'page-list';
export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const items = [];
  const byManifestId = {};
  const tocRoot = findNav(tocHtml.html.body, NAV_ROOT);
  if (!tocRoot) {
    throw 'The root node of your navigation document (table of contents) could not be found. Please ensure the file contains a nav element with an attribute of epub:type="toc"';
  }
  const tocItem = getTocItem(manifest);
  const tocItemPath = getDirname(tocItem.href);
  parse(tocRoot, ROOT);

  function parse(rootNode, id, href, label, parentId, level=0, hidden = false) {
    const hrefWithoutHash = href && join(tocItemPath, href.split('#')[0]);
    const manifestId = Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      const { ol } = rootNode;
      let childNodes = [];

      if (ol) {
        const listHidden = typeof ol.hidden === 'string';
        if (Array.isArray(ol.li)) {
          childNodes = Array.from(ol.li).map(node => {
            const link = node.a;
            const childId = uniqueId();
            const nodeHidden = hidden || listHidden || typeof node.hidden === 'string';
            return parse(node, childId, link.href, link.__text, id, level+1, nodeHidden) && childId;
          }).filter(Boolean);
        } else {
          const node = ol.li;
          const link = node.a;
          const childId = uniqueId();
          const nodeHidden = hidden || listHidden || typeof node.hidden === 'string';
          childNodes.push(parse(node, childId, link.href, link.__text, id, level+1, nodeHidden) && childId);
        }
      }

      if (manifestId) {
        if(manifestId in byManifestId) {
          byManifestId[manifestId].push(id);
        } else {
          byManifestId[manifestId] = [id];
        }
      }

      items.push(id);

      byId[id] = {
        childNodes,
        id,
        isLeaf: childNodes.length === 0,
        hidden,
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

  const ret = {
    byId,
    byManifestId,
    items
  };

  const pageListRoot = findNav(tocHtml.html.body, PAGE_LIST);
  if (pageListRoot) {
    ret.pageList = getPageListData(pageListRoot);
  }

  return ret;
}

function getPageListData(nav) {
  const pageList = {
    byId: {},
    items: []
  };

  return Array.from(nav.ol.li).reduce((ret, li) => {
    if (li.hasOwnProperty('a')) {
      ret.byId[li.a.__text] = li.a.href;
      ret.items.push(li.a.__text);
    }
    return ret;
  }, pageList);
}

function findNav(currentNode, navType) {
  let found = false;
  Object.keys(currentNode).find(key => {
    if (isNavType(currentNode[key], navType)) {
      found = currentNode[key];
      return true;
    }
    if (typeof currentNode[key] === 'object') {
      return found = findNav(currentNode[key], navType);
    }
  });
  return found;
}

function isNavType(node, type) {
  if (typeof node !== 'undefined') {
    return (node.hasOwnProperty(EPUB_TYPE) && node[EPUB_TYPE] === type && node.hasOwnProperty('ol'));
  } else {
    return false;
  }
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
