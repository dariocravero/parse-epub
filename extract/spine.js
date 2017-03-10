import normalise from './normalise';

const PAGE_DIRECTION = 'page-progression-direction';

const PROPERTIES = {
  'rendition:layout-pre-paginated': { layout: 'prePaginated' },
  'rendition:layout-reflowable': { layout: 'reflowable' },
  'rendition:orientation-landscape': { orientation: 'landscape' },
  'rendition:orientation-portrait': { orientation: 'portrait' },
  'rendition:orientation-auto': { orientation: 'auto' },
  'rendition:spread-none': { spread: 'none' },
  'rendition:spread-landscape': { spread: 'none' },
  'rendition:spread-portrait': { spread: 'portrait' },
  'rendition:spread-both': { spread: 'both' },
  'rendition:spread-auto': { spread: 'auto' },
  "rendition:page-spread-center": { pageSpread: 'center' },
  "page-spread-left": { pageSpread: 'left' },
  "page-spread-right": { pageSpread: 'right' }
}

export default function spine(xml, tocItem=false) {
  // TODO This will need to change when we use the spine to navgate the book
  // and allow hidden toc items
  const items = tocItem ?
    xml.package.spine.itemref.filter(i => i.id !== tocItem) :
    xml.package.spine.itemref;

  const spine = normalise(
    items.map(({ idref:id, linear, properties}) => ({
      id,
      linear: typeof linear === 'string' ? linear === 'yes' : true,
      properties: properties ? refineProperties(properties) : properties
    }))
  );

  if (xml.package.spine[PAGE_DIRECTION]) {
    spine.pageDirection = xml.package.spine[PAGE_DIRECTION];
  }

  return spine
}

function refineProperties(props) {
  return props.split(' ').reduce((obj, prop) => {
    try {
      const key = Object.keys(PROPERTIES[prop])[0];
      const value = PROPERTIES[prop][key];
      obj[key] = value;
    } catch (err) {
      console.error('The parser does not understand the following spine item property:', prop);
    }
    return obj;
  }, {});
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68
