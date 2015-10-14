import items from './items';

const ATTRIBUTES = {
  id: 'idref',
  href: 'href'
};
const ITEM = 'li';
const TAG = 'nav[id="toc"]';

function isLi(node) {
  return node.tagName === 'LI';
}

export default function toc(tocHtml, manifest) {
  // map items by url in toc and url in manifest
  // use manifest's id

  const byId = {};

  parse(tocHtml.querySelector(TAG), '__root__');

  function parse(snippet, href, label) {
    const ol = snippet.querySelector('ol');
    let childNodes = [];

    if (ol) {
      childNodes = Array.prototype.filter.call(ol.children, isLi)
        .map(node => {
          const link = node.querySelector('a');
          const childHref = link.getAttribute('href').split('#')[0];
          parse(node, childHref, link.textContent);
          return childHref;
        });
    }

    byId[href] = {
      childNodes,
      href,
      label,
      manifestIndex: manifest.findIndex(mitem => mitem.href === href)
    };
  }

  return byId;
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
