import normalise from './normalise';

export default function spine(xml, tocItem=false) {
  const items = tocItem ?
    xml.package.spine.itemref.filter(i => i.id !== tocItem) :
    xml.package.spine.itemref;

  return normalise(
    items.map(({ idref:id, linear, properties}) => ({
      id,
      linear: linear === 'yes',
      properties
    }))
  );
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
