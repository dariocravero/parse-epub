import * as path from 'path-browserify';
import fetchManifestItemXml from '../fetch/manifest-item-xml';
import extractSmilData from './smil-data';
import find from 'array-find';

const SMIL_MEDIA_TYPE = 'application/smil+xml';

// this filters and gets the spine items that have a media overlay associated
// with it.
export function getMediaOverlayItems(manifest) {
  return manifest.items.filter(id => manifest.byId[id].mediaOverlay);
}

export function fetchAll(uri, items, manifest) {
  return Promise.all(
    items.map(spineId => {
      const smilId = manifest.byId[spineId].mediaOverlay;
      const smilItem = manifest.byId[smilId];
      return fetchManifestItemXml(uri, smilItem.href);
    })
  );
}

export function parseAll(items, manifest, metadata, uri) {
  return function parseAllThunk(manifestItemsXml) {
    const byId = {};
    let i = 0;

    manifestItemsXml.forEach((xml, i) => {
      const spineId = items[i];
      const smilId = manifest.byId[spineId].mediaOverlay;
      const refinement = find(metadata.mediaOverlayDurations, mod => mod.refines === `#${smilId}`);
      const baseUri = path.dirname(manifest.byId[spineId].href);
      byId[smilId] = extractSmilData(xml, smilId, refinement, baseUri);
    });

    return {
      byId,
      items
    };
  }
}

export default function smil(uri, manifest, metadata) {
  const items = getMediaOverlayItems(manifest);
  return fetchAll(uri, items, manifest)
    .then(values => parseAll(items, manifest, metadata, uri)(values))
    .catch(error => console.error(error));
}
