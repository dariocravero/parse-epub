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
    const mitem = manifest.find(mitem => mitem.id === item.id);

    return {
      ...mitem, // for readium
      ...item,
      idref: item.id, // for readium
      media_overlay_id: mitem.mediaOverlay, // for readium
      media_type: mitem.mediaType // for readium
      // linear: item.linear === YES // TODO Replace. Readium needs it to be a string.
    };
  }).filter(item => typeof item.href === 'string' && item.href !== 'toc.xhtml');
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
