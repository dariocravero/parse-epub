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
    mediaNarrator: 'media:narrator'
  }
}
const NS = '*';
const META = 'meta';
const TAG = 'metadata';

export default function metadata(rootXml, manifest) {
  let ret = {};
  const xml = rootXml.querySelector(TAG);

  function attribute(attr, required) {
    try {
      ret[attr] = xml.getElementsByTagNameNS(NS, attr)[0].textContent;
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

  const mediaDurationXml = xml.querySelectorAll(`${META}[property='${ATTRIBUTES.PROPERTIES.mediaDuration}']`);
  if (mediaDurationXml.length) {
    ret.mediaOverlayDurations = [];
    ret.mediaDuration;
    Array.prototype.forEach.call(mediaDurationXml, item => {
      const refines = item.getAttribute('refines');

      if (refines) {
        // If refines is specified, it's a media overlay duration
        ret.mediaOverlayDurations.push({
          refines: item.getAttribute('refines'),
          clockValue: item.textContent
        });
      } else {
        // Otherwise it's the whole publication's duration
        ret.mediaDuration = item.textContent;
      }
    });
  }

  const mediaActiveClassXml = xml.querySelector(`${META}[property='${ATTRIBUTES.PROPERTIES.mediaActiveClass}']`);
  if (mediaActiveClassXml) {
    ret.mediaActiveClass = mediaActiveClassXml.textContent;
  }

  const mediaNarratorXml = xml.querySelectorAll(`${META}[property='${ATTRIBUTES.PROPERTIES.mediaNarrator}']`);
  if (mediaNarratorXml.length) {
    ret.mediaNarrator = Array.prototype.map.call(mediaNarratorXml, item => item.textContent);
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
