import items from './items';
import normalise from './normalise';

const ATTRIBUTES = {
  id: 'idref',
  linear: 'linear',
  properties: 'properties'
};
const ITEM = 'itemref';
const TAG = 'spine';
const YES = 'yes';

// TODO do the same as the manifest
export default function spine(rootXml, tocItem) {
  return normalise(
    items(rootXml.querySelector(TAG), ITEM, ATTRIBUTES)
      .filter(item => typeof tocItem === 'undefined' ? true : tocItem.id !== item.id)
      .map(item => ({
        id: item.id,
        linear: item.linear === YES,
        properties: item.properties
      }))
  );
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
