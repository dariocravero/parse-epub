import extractManifest from '../extract/manifest';
import extractMetadata from '../extract/metadata';
import extractRootFile from '../extract/root-file';
import extractSpine from '../extract/spine';
import extractToc from '../extract/toc';
import fetchContainerXml from '../fetch/container-xml';
import fetchRootXml from '../fetch/root-xml';
import fetchTocHtml from '../fetch/toc-html';
import getTocItem from '../extract/get-toc-item';

export default function parse(uri) {
  return fetchContainerXml(uri)
    .then(containerXml => extractRootFile(containerXml))
    .then(rootFile => {
      const contentFolder = rootFile.split('/')[0];
      
      return fetchRootXml(uri, rootFile)
        .then(rootXml => {
          const manifest = extractManifest(rootXml);
          const tocItem = getTocItem(manifest);
          const spine = extractSpine(rootXml, tocItem);
    
          return fetchTocHtml(uri, tocItem.href, contentFolder)
            .then(tocHtml => ({
              manifest,
              metadata: extractMetadata(rootXml, manifest),
              spine,
              toc: extractToc(tocHtml, manifest, spine)
            }));
        });
    })
    .catch(err => {
      if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
        throw new Error(`We couldn't find a book at ${uri}.`);
      } else {
        throw err;
      }
    });
}
