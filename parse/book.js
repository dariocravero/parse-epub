import {
  containerXml as fetchContainerXml,
  rootXml as fetchRootXml,
  tocHtml as fetchTocHtml
} from '../fetch.js';
import { dirname } from '../path-helpers.js';
import extractManifest from '../extract/manifest.js';
import extractMetadata from '../extract/metadata.js';
import extractRootFile from '../extract/root-file.js';
import extractSpine from '../extract/spine.js';
import extractToc from '../extract/toc.js';
import getTocItem from '../extract/get-toc-item.js';

export default function parse(uri, manifestMediaTypeWhitelist=false) {
  let packageDirectory;

  return fetchContainerXml(uri)
    .then(containerXml => extractRootFile(containerXml))
    .then(rootFile => {
      packageDirectory = dirname(rootFile);
      return fetchRootXml(uri, rootFile);
    })
    .then(rootXml => {
      const manifest = extractManifest(rootXml, manifestMediaTypeWhitelist);
      const tocItem = getTocItem(manifest);
      const spine = extractSpine(rootXml, tocItem);

      return fetchTocHtml(uri, tocItem.href, packageDirectory)
        .then(tocHtml => ({
          packageDirectory,
          manifest,
          metadata: extractMetadata(rootXml, manifest),
          spine,
          toc: extractToc(tocHtml, manifest, spine)
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
