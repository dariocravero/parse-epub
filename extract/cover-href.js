import find from 'array-find';

export default function coverHref(manifest) {
  const item =
    manifest.byId['cover-item'] ||
    manifest.byId['cover'] ||
    manifest.byId[find(Object.keys(manifest.byId), id => /cover-image/.test(manifest.byId[id].properties))];

  if (item) {
    return item.href;
  }
}

// TODO
// - Support ePub2 coverHref
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L395-L417
