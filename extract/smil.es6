import 'core-js/modules/es6.array.find';
import 'es6-promise';
import { manifestItemXml as fetchManifestItemXml } from '../fetch';
import extractSmilData from './smil-data';

const SMIL_MEDIA_TYPE = 'application/smil+xml';

export function getSmilFromManifest(manifest) {
  return manifest.items.filter(id => manifest.byId[id].mediaType === SMIL_MEDIA_TYPE);
}

export function fetchAll(uri, items, manifest) {
  return Promise.all(
    items.map(id => fetchManifestItemXml(uri, manifest.byId[id].href))
  );
}

export function parseAll(items, manifest, metadata) {
  return function parseAllThunk(manifestItemsXml) {
    const byId = {};
    let i = 0;

    manifestItemsXml.forEach((xml, i) => {
      const id = items[i];
      const refinement = metadata.mediaOverlayDurations.find(mod => mod.refines === `#${id}`);
      byId[id] = extractSmilData(xml, manifest.byId, id, refinement);
    });

    return {
      byId,
      items
    };
  }
}

export default function smil(uri, manifest, metadata) {
  const items = getSmilFromManifest(manifest);

  return fetchAll(uri, items, manifest)
    .then(values => parseAll(items, manifest, metadata)(values))
    .catch(error => console.error(error));
}
