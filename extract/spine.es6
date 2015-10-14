import 'core-js/modules/es6.array.find-index';
import items from './items';

const ATTRIBUTES = {
  id: 'idref',
  linear: 'linear',
  properties: 'properties'
};
const ITEM = 'itemref';
const TAG = 'spine';
const YES = 'yes';

export default function spine(rootXml, manifest) {
  return items(rootXml.querySelector(TAG), ITEM, ATTRIBUTES).map(item => {
    const manifestIndex = manifest.findIndex(mitem => mitem.id === item.id);

    return {
      id: item.id,
      linear: item.linear === YES,
      manifestIndex,
      properties: item.properties
    }
  });
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
