import { dirname } from '../path-helpers.js';
import { manifestItemXml as fetchManifestItemXml } from '../fetch.js';
import extractSmilData from './smil-data';

const SMIL_MEDIA_TYPE = 'application/smil+xml';

// this filters and gets the spine items that have a media overlay associated
// with it.
export function getMediaOverlayItems(manifest) {
  return manifest.items.filter(id => manifest.byId[id].mediaOverlay);
}

export function fetchAll(uri, items, manifest, path) {
  return Promise.all(
    items.map(spineId => {
      const smilId = manifest.byId[spineId].mediaOverlay;
      const { href: smilUri } = manifest.byId[smilId];

      return fetchManifestItemXml(uri, smilUri, path)
        .then(manifestItemsXml => ({ manifestItemsXml, smilUri }));
    })
  );
}

export function parseAll(items, manifest, metadata, uri) {
  return function parseAllThunk(smilData) {
    const byId = {};
    let i = 0;

    smilData.forEach((smilDetail, i) => {
      const spineId = items[i];
      const smilId = manifest.byId[spineId].mediaOverlay;
      const refinement = metadata.mediaOverlayDurations.find(mod => mod.refines === `#${smilId}`);
      const baseUri = dirname(smilDetail.smilUri);
      byId[smilId] = extractSmilData(smilDetail.manifestItemsXml, smilId, refinement, baseUri);
    });

    return {
      byId,
      items
    };
  }
}

export default function smil(uri, manifest, metadata, path) {
  const items = getMediaOverlayItems(manifest);
  return fetchAll(uri, items, manifest, path)
    .then(smilData => parseAll(items, manifest, metadata, uri)(smilData))
    .catch(error => console.error(error));
}