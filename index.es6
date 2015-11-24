import 'es6-promise';
import * as extract from './extract';
import * as fetch from './fetch';

export default function parse(uri) {
  return fetch.containerXml(uri)
    .then(containerXml => extract.rootFile(containerXml))
    .then(rootFile => fetch.rootXml(uri, rootFile))
    .then(rootXml => {
      const manifest = extract.manifest(rootXml);
      const spine = extract.spine(rootXml);

      return fetch.tocHtml(uri)
        .then(tocHtml => ({
          manifest,
          metadata: extract.metadata(rootXml, manifest),
          spine,
          toc: extract.toc(tocHtml, manifest, spine)
        }));
    });
}

export function parseSmil(uri, manifest, metadata) {
  return extract.smil(uri, manifest, metadata);
}
