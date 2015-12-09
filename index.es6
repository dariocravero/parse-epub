if (typeof window.Promise === 'undefined') {
  require('es6-promise').polyfill();
}
import * as extract from './extract';
import * as fetch from './fetch';
import getTocItem from './extract/get-toc-item';

export default function parse(uri) {
  return fetch.containerXml(uri)
    .then(containerXml => extract.rootFile(containerXml))
    .then(rootFile => fetch.rootXml(uri, rootFile))
    .then(rootXml => {
      const manifest = extract.manifest(rootXml);
      const tocItem = getTocItem(manifest);
      const spine = extract.spine(rootXml, tocItem);

      return fetch.tocHtml(uri, tocItem.href)
        .then(tocHtml => ({
          manifest,
          metadata: extract.metadata(rootXml, manifest),
          spine,
          toc: extract.toc(tocHtml, manifest, spine)
        }));
    })
    .catch(err => {
      let nextErr = err;

      if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
        nextErr = new Error(`We couldn't find a book at ${uri}.`);
      }

      throw nextErr;
    });
}

export function parseSmil(uri, manifest, metadata) {
  return extract.smil(uri, manifest, metadata);
}
