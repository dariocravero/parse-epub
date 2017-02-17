import coverHref from './cover-href';

const ATTRIBUTES = {
  OPTIONAL: [
    'creator',
    'contributor',
    'coverage',
    'creator',
    'date',
    'description',
    'format',
    'publisher',
    'relation',
    'rights',
    'source',
    'subject',
    'type'
  ],
  REQUIRED: [
    'identifier',
    'language',
    'title'
  ],
  PROPERTIES: {
    mediaActiveClass: 'media:active-class',
    mediaDuration: 'media:duration',
    mediaNarrator: 'media:narrator',
    renditionLayout: 'rendition:layout',
    renditionOrientation: 'rendition:orientation',
    renditionSpread: 'rendition:spread'
  }
}
const NS = '*';
const META = 'meta';
const TAG = 'metadata';

export default function metadata(parsedRootXml, manifest) {
  let ret = {};
  const metadataInfo = parsedRootXml.package.metadata;

  function attribute(attr, required) {
    try {
      ret[attr] = metadataInfo[attr].__text;
    } catch(exception) {
      if (required) {
        ret[attr] = undefined;
        console.error(`Can't get required attribute '${attr}' on metadata.`);
      }
    }
  }

  ATTRIBUTES.OPTIONAL.forEach(attr => attribute(attr, false));
  ATTRIBUTES.REQUIRED.forEach(attr => attribute(attr, true));

  ret.coverHref = coverHref(manifest);
  ret.mediaOverlayDurations = [];
  ret.mediaDuration;
  let mediaDurationData = [];
  let mediaNarratorData = [];

  metadataInfo.meta.forEach(item => {
    if (item.property === ATTRIBUTES.PROPERTIES.mediaDuration) {
      mediaDurationData.push(item);
    } else if (item.property === ATTRIBUTES.PROPERTIES.mediaActiveClass) {
      ret.mediaActiveClass = item.__text;
    } else if (item.property === ATTRIBUTES.PROPERTIES.mediaNarrator) {
      mediaNarratorData.push(item);
    } else if (item.property === ATTRIBUTES.PROPERTIES.renditionLayout) {
      ret.renditionLayout = item.__text;
    } else if (item.property === ATTRIBUTES.PROPERTIES.renditionOrientation) {
      ret.renditionOrientation = item.__text;
    } else if (item.property === ATTRIBUTES.PROPERTIES.renditionSpread) {
      ret.renditionSpread = item.__text;
    }
  });

  if (mediaDurationData.length) {
    ret.mediaOverlayDurations = [];
    ret.mediaDuration;
    mediaDurationData.forEach(item => {
      const refines = item.refines;

      if (refines) {
        // If refines is specified, it's a media overlay duration
        ret.mediaOverlayDurations.push({
          refines: refines,
          clockValue: item.__text
        });
      } else {
        // Otherwise it's the whole publication's duration
        ret.mediaDuration = item.__text;
      }
    });
  }

  if (mediaNarratorData.length) {
    ret.mediaNarrator = mediaNarratorData.map(item => item.__text);
  }

  return ret;
}

// TODO
// - refactor!
// - updateMetadataWithIBookProperties
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L96-L130
// - refinements
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L262-L279
//   http://www.idpf.org/epub/301/spec/epub-publications.html#sec-metadata-elem
// - rendition
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L241-L261
// - more media attributes?
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L310-L322
