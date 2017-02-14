export default function getTocItem(manifest) {
  const tocManifestId = manifest.items.find(id => /nav/.test(manifest.byId[id].properties));
  return manifest.byId[tocManifestId];
}
