import items from './items.js';
import normalise from './normalise.js';
import querySelector from '../query-selector.js';

const ATTRIBUTES = {
  href: 'href',
  id: 'id',
  mediaType: 'media-type',
  mediaOverlay: 'media-overlay',
  properties: 'properties'
};
const ITEM = 'item';
const TAG = 'manifest';

export default function manifest(xml, mediaTypeWhitelist=false) {
  // console.log(JSON.stringify(xml))
  // console.log(querySelector(xml, TAG))
  return normalise(items(querySelector(xml, TAG), ITEM, ATTRIBUTES, mediaTypeWhitelist));
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487
