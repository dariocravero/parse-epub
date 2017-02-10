import normalise from './normalise.js';

const DEFAULT_WHITELIST = [
  'application/xhtml+xml',
  'application/smil+xml'
];

export default function manifest(xml, mediaTypeWhitelist=DEFAULT_WHITELIST) {
  const items = Array.isArray(mediaTypeWhitelist) ?
    xml.package.manifest.item.filter(i => mediaTypeWhitelist.includes(i['media-type'])) :
    xml.package.manifest.item;

  return normalise(
    items.map(({ href, id, 'media-type':mediaType, 'media-overlay':mediaOverlay, properties }) => ({
      href,
      id,
      mediaType,
      mediaOverlay,
      properties
    }))
  );
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487
