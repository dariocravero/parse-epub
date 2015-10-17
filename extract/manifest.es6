import items from './items';
import normalise from './normalise';

const ATTRIBUTES = {
  href: 'href',
  id: 'id',
  mediaType: 'media-type',
  mediaOverlay: 'media-overlay',
  properties: 'properties'
};
const ITEM = 'item';
const TAG = 'manifest';

export default function manifest(rootXml) {
  return normalise(items(rootXml.querySelector(TAG), ITEM, ATTRIBUTES));
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487
