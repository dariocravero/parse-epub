import find from 'array-find';

export default function getTocItem(manifest) {
  const tocManifestId = find(manifest.items, id => /nav/.test(manifest.byId[id].properties));
  return manifest.byId[tocManifestId];
}
