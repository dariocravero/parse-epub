import * as extract from './extract';
import * as fetch from './fetch';

export default function parse(uri) {
  return fetch.containerXml(uri)
    .then(containerXml => extract.rootFile(containerXml))
    .then(rootFile => fetch.rootXml(uri, rootFile))
    .then(rootXml => {
      const manifest = extract.manifest(rootXml);

      return {
        manifest,
        metadata: extract.metadata(rootXml, manifest),
        spine: extract.spine(rootXml, manifest)
      };
    });
}
