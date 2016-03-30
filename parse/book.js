import extractManifest from '../extract/manifest';
import extractMetadata from '../extract/metadata';
import extractRootFile from '../extract/root-file';
import extractSpine from '../extract/spine';
import extractToc from '../extract/toc';
import fetchContainerXml from '../fetch/container-xml';
import fetchRootXml from '../fetch/root-xml';
import fetchTocHtml from '../fetch/toc-html';
import getTocItem from '../extract/get-toc-item';

export default async function parse(uri) {

  let data;
  let rootFolder;

  try {
    const containerXml = await fetchContainerXml(uri);
    
    const rootFile = await extractRootFile(containerXml);
    rootFolder = rootFile.split('/')[0];
    
    const rootXml = await fetchRootXml(uri, rootFile);

    const manifest = extractManifest(rootXml);
    const tocItem = getTocItem(manifest);
    const spine = extractSpine(rootXml, tocItem);

    const tocHtml = await fetchTocHtml(`${uri}/${rootFolder}`, tocItem.href);

    data = {
      manifest,
      metadata: extractMetadata(rootXml, manifest),
      rootFolder,
      spine,
      toc: extractToc(tocHtml, manifest, spine)
    };

  } catch(err) {
    if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
      throw new Error(`We couldn't find a book at ${uri}.`);
    } else {
      throw err;
    }
  }
  
  //return from here
  return data;
}
