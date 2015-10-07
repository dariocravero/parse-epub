import { manifestItemXml as fetchManifestItemXml } from '../fetch';
import extractSmilData from './smil-data';

const SMIL_MEDIA_TYPE = 'application/smil+xml';

// Smil files are declared in the manifest and are related to a spine item.
export default async function smil(uri, spine, manifest, mediaOverlayDurations) {
  // Reduce the manifest to smil entries only so the lookup is faster
  const smilsInManifest = manifest.filter(item => item.mediaType === SMIL_MEDIA_TYPE);
  let smils = [];

  for (let item of spine) {
    let ret;
    if (item.mediaOverlay) {
      // Get the matching manifest item
      const manifestItem = smilsInManifest.find(mitem => mitem.id === item.mediaOverlay);
      const refinement = mediaOverlayDurations.find(moditem => moditem.refines === `#${item.mediaOverlay}`);

      if (manifestItem) {
        try {
          // Try to parse its contents
          const manifestItemXml = await fetchManifestItemXml(uri, manifestItem.href);
          ret = extractSmilData(manifestItemXml, manifestItem, item, refinement);
        } catch(exception) {
          console.error(exception);
        }
      } else {
        console.error(`Can't find SMIL item ${item.mediaOverlay} in the manifest for spine item ${item.id}`);
      }
    }

    // If the smil reference isn't there, insert a fakeSmil as Readium does. TODO Review this.
    smils.push(ret || fakeSmil(item));
  }

  return smils;
}

// https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L131
function fakeSmil(item) {
  return {
    id: '',
    href: '',
    spineItemId: item.id,
    children: [{
      nodeType: 'seq',
      textref: item.href,
      children: [{
        nodeType: 'par',
        children: [{
          nodeType: 'text',
          src: item.href,
          srcFile: item.href,
          srcFragmentId: ''
        }]
      }]
    }]
  };
}
