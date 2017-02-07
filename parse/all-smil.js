import extractSmil from '../extract/smil';

export default function parseSmil(uri, manifest, metadata, packageDirectory) {
  return extractSmil(uri, manifest, metadata, packageDirectory);
}
