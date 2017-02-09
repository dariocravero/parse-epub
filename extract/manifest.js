import items from './items.js';
import normalise from './normalise.js';

const ATTRIBUTES = {
  href: 'href',
  id: 'id',
  mediaType: 'media-type',
  mediaOverlay: 'media-overlay',
  properties: 'properties'
};
const ITEM = 'item';
const TAG = 'manifest';

const DEFAULT_WHITELIST = [
  'application/xhtml+xml',
  'application/smil+xml'
];

export default function manifest(xml, mediaTypeWhitelist=DEFAULT_WHITELIST) {
  return normalise(items(xml.package.manifest.item, ATTRIBUTES, mediaTypeWhitelist));
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487
