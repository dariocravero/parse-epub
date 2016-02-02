'use strict';

function _interopDefault (ex) { return 'default' in ex ? ex['default'] : ex; }

var uniqueId = _interopDefault(require('lodash.uniq'));
var path = require('path-browserify');

var babelHelpers = {};

babelHelpers.slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

babelHelpers;

function items(xml, item, attributes) {
  return Array.prototype.map.call(xml.querySelectorAll(item), item => {
    let ret = {};

    Object.keys(attributes).forEach(key => {
      try {
        ret[key] = item.getAttribute(attributes[key]);
      } catch (exception) {
        ret[key] = undefined;
        console.error(`Can't get ${ key } for ${ item } on ${ tag }.`);
      }
    });

    return ret;
  });
}

function normalise(list) {
  const byId = {};
  const items = list.map(item => {
    byId[item.id] = item;
    return item.id;
  });

  return {
    byId,
    items
  };
}

const ATTRIBUTES = {
  href: 'href',
  id: 'id',
  mediaType: 'media-type',
  mediaOverlay: 'media-overlay',
  properties: 'properties'
};
const ITEM = 'item';
const TAG = 'manifest';

function manifest(rootXml) {
  return normalise(items(rootXml.querySelector(TAG), ITEM, ATTRIBUTES));
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487

function coverHref(manifest) {
  const item = manifest.byId['cover-item'] || manifest.byId['cover'] || manifest.byId[Object.keys(manifest.byId).find(id => /cover-image/.test(manifest.byId[id].properties))];

  if (item) {
    return item.href;
  }
}

// TODO
// - Support ePub2 coverHref
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L395-L417

const ATTRIBUTES$1 = {
  OPTIONAL: ['creator', 'contributor', 'coverage', 'creator', 'date', 'description', 'format', 'publisher', 'relation', 'rights', 'source', 'subject', 'type'],
  REQUIRED: ['identifier', 'language', 'title'],
  PROPERTIES: {
    mediaActiveClass: 'media:active-class',
    mediaDuration: 'media:duration',
    mediaNarrator: 'media:narrator'
  }
};
const NS = '*';
const META = 'meta';
const TAG$1 = 'metadata';

function metadata(rootXml, manifest) {
  let ret = {};
  const xml = rootXml.querySelector(TAG$1);

  function attribute(attr, required) {
    try {
      ret[attr] = xml.getElementsByTagNameNS(NS, attr)[0].textContent;
    } catch (exception) {
      if (required) {
        ret[attr] = undefined;
        console.error(`Can't get required attribute '${ attr }' on metadata.`);
      }
    }
  }

  ATTRIBUTES$1.OPTIONAL.forEach(attr => attribute(attr, false));
  ATTRIBUTES$1.REQUIRED.forEach(attr => attribute(attr, true));

  ret.coverHref = coverHref(manifest);

  const mediaDurationXml = xml.querySelectorAll(`${ META }[property='${ ATTRIBUTES$1.PROPERTIES.mediaDuration }']`);
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

  const mediaActiveClassXml = xml.querySelector(`${ META }[property='${ ATTRIBUTES$1.PROPERTIES.mediaActiveClass }']`);
  if (mediaActiveClassXml) {
    ret.mediaActiveClass = mediaActiveClassXml.textContent;
  }

  const mediaNarratorXml = xml.querySelectorAll(`${ META }[property='${ ATTRIBUTES$1.PROPERTIES.mediaNarrator }']`);
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

const ROOT_FILE = 'rootfile';
const FULL_PATH = 'full-path';

function rootFile(containerXml) {
  return containerXml.querySelector(ROOT_FILE).getAttribute(FULL_PATH);
}

const ATTRIBUTES$2 = {
  id: 'idref',
  linear: 'linear',
  properties: 'properties'
};
const ITEM$1 = 'itemref';
const TAG$2 = 'spine';
const YES = 'yes';

function spine(rootXml, tocItem) {
  return normalise(items(rootXml.querySelector(TAG$2), ITEM$1, ATTRIBUTES$2).filter(item => typeof tocItem === 'undefined' ? true : tocItem.id !== item.id).map(item => ({
    id: item.id,
    linear: item.linear === YES,
    properties: item.properties
  })));
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68

function getTocItem(manifest) {
  const tocManifestId = manifest.items.find(id => /nav/.test(manifest.byId[id].properties));
  return manifest.byId[tocManifestId];
}

const TAG$3 = 'nav[id="toc"]';

const ROOT = '__root__';

function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  const tocItem = getTocItem(manifest);

  parse(tocHtml.querySelector(TAG$3), ROOT);

  function parse(snippet, id, href, label, parentId) {
    const hrefWithoutHash = href && href.split('#')[0];
    const manifestId = Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      const ol = snippet.querySelector('ol');
      let childNodes = [];

      if (ol) {
        childNodes = Array.prototype.filter.call(ol.children, node => node.tagName === 'LI').map(node => {
          const link = node.querySelector('a');
          const childId = uniqueId();
          return parse(node, childId, link.getAttribute('href'), link.textContent, id) && childId;
        }).filter(id => id);
      }

      const isLeaf = childNodes.length === 0;

      // We mainly care about leafs as those are the ones that contain pages and are thus open
      if (isLeaf) {
        byManifestId[manifestId] = id;
        items.push(id);
      }

      byId[id] = {
        childNodes,
        id,
        isLeaf,
        href,
        label,
        linear: snippet.getAttribute('linear'),
        manifestId,
        parentId
      };

      return true;
    } else {
      return false;
    }
  }

  return {
    byId,
    byManifestId,
    items
  };
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68

/* global DOMParser */

const HTML = 'text/html';
const XML = 'text/xml';
const domParser = new DOMParser();

function parseRaw(markup) {
  let contentType = arguments.length <= 1 || arguments[1] === undefined ? XML : arguments[1];

  return domParser.parseFromString(markup, contentType);
}

function parseRawHtml(markup) {
  return parseRaw(markup, HTML);
}

function parseRawXml(markup) {
  return parseRaw(markup, XML);
}

function xml(uri) {
  return fetch(uri).then(res => res.text()).then(body => parseRawXml(body));
}

const CONTAINER_XML = 'META-INF/container.xml';

function containerXml(uri) {
  let source = arguments.length <= 1 || arguments[1] === undefined ? CONTAINER_XML : arguments[1];

  return xml(`${ uri }/${ source }`);
}

function rootXml(uri, source) {
  return xml(`${ uri }/${ source }`);
}

const TOC_HTML = 'toc.xhtml';

function containerHtml(uri) {
  let source = arguments.length <= 1 || arguments[1] === undefined ? TOC_HTML : arguments[1];

  return fetch(`${ uri }/OPS/${ source }`).then(res => res.text()).then(body => parseRawHtml(body));
}

function parse(uri) {
  return containerXml(uri).then(containerXml => rootFile(containerXml)).then(rootFile => rootXml(uri, rootFile)).then(rootXml => {
    const manifest$$ = manifest(rootXml);
    const tocItem = getTocItem(manifest$$);
    const spine$$ = spine(rootXml, tocItem);

    return containerHtml(uri, tocItem.href).then(tocHtml => ({
      manifest$$,
      metadata: metadata(rootXml, manifest$$),
      spine$$,
      toc: toc(tocHtml, manifest$$, spine$$)
    }));
  }).catch(err => {
    let nextErr = err;

    if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
      nextErr = new Error(`We couldn't find a book at ${ uri }.`);
    }

    throw nextErr;
  });
}

function manifestItemXml(uri, source) {
  return xml(`${ uri }/OPS/${ source }`);
}

// this function will return DOM parsed nodes that are not comments or text nodes containing whitespace
function canIgnoreNode(node) {
  return !(node.nodeType === window.Node.COMMENT_NODE || node.nodeType === window.Node.TEXT_NODE && !/[^\t\n\r ]/.test(node.textContent));
}

const HOURS = 'h';
const MINUTES = 'min';
const MILLISECONDS = 'ms';
const SECONDS = 's';
const TIME_SEPARATOR = ':';

// https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L213-L243
// parse the timestamp and return the value in seconds
// supports this syntax:
// http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
function parseClockValue(value) {
  if (!value) return 0;

  let hours = 0;
  let mins = 0;
  let secs = 0;

  const index = {
    hours: value.indexOf(HOURS),
    mins: value.indexOf(MINUTES),
    ms: value.indexOf(MILLISECONDS),
    secs: value.indexOf(SECONDS)
  };

  if (index.mins !== -1) {
    mins = parseFloat(value.substr(0, index.mins), 10);
  } else if (index.ms !== -1) {
    let ms = parseFloat(value.substr(0, index.ms), 10);
    secs = ms / 1000;
  } else if (index.secs !== -1) {
    secs = parseFloat(value.substr(0, index.secs), 10);
  } else if (index.hours !== -1) {
    hours = parseFloat(value.substr(0, index.hours), 10);
  } else {
    // parse as hh:mm:ss.fraction
    // this also works for seconds-only, e.g. 12.345
    let arr = value.split(TIME_SEPARATOR);
    secs = parseFloat(arr.pop(), 10);
    if (arr.length > 0) {
      mins = parseFloat(arr.pop(), 10);
      if (arr.length > 0) {
        hours = parseFloat(arr.pop(), 10);
      }
    }
  }

  return hours * 3600 + mins * 60 + secs;
}

const AUDIO = 'audio';
const BODY = 'body';
const PAR = 'par';
const SEQ = 'seq';
const TAG$4 = 'smil';
const TEXT = 'text';
const VERSION = 'version';

// TODO the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
function smilData(xml, id) {
  let refinement = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  let baseUri = arguments[3];

  const smilXml = xml.querySelector(TAG$4);

  const ret = {
    body: parse$1(smilXml.querySelector(BODY), baseUri),
    id,
    version: smilXml.getAttribute(VERSION)
  };

  if (refinement.clockValue) {
    ret.duration = parseClockValue(refinement.clockValue);
  }
  return ret;
}

function getValidChildNodes(xml) {
  return Array.prototype.filter.call(xml.childNodes, canIgnoreNode);
}

function attrs(itemXml) {
  const node = NODES[itemXml.nodeName];
  const ret = {};

  function attr(key, attr, required) {
    try {
      const val = itemXml.getAttribute(attr);
      if (val) {
        ret[key] = val;
      } else {
        throw Exception(`Attribute tag ${ attr } exists but there's no value.`);
      }
    } catch (exception) {
      if (required) {
        ret[key] = false;
        console.error(`Can't get required attribute '${ attr }' for key '${ key }' on smil.`, itemXml);
        console.error(exception);
      }
    }
  }

  Object.keys(node.OPTIONAL).forEach(key => attr(key, node.OPTIONAL[key], false));
  Object.keys(node.REQUIRED).forEach(key => attr(key, node.REQUIRED[key], true));

  return ret;
}

function resolvePath(baseUri, relativePath) {
  return path.resolve(baseUri, relativePath);
}

function parse$1(xml, baseUri) {
  let ret;

  switch (xml.nodeName) {
    case AUDIO:
      ret = attrs(xml);
      if (ret.src && !path.isAbsolute(ret.src)) {
        ret.src = resolvePath(baseUri, ret.src);
      }
      ret.clipBegin = ret.clipBegin && parseClockValue(ret.clipBegin);
      ret.clipEnd = ret.clipEnd && parseClockValue(ret.clipEnd);
      break;

    case PAR:
      ret = attrs(xml);
      ret.audio = parse$1(xml.querySelector(AUDIO), baseUri);
      ret.isPar = true;
      ret.text = parse$1(xml.querySelector(TEXT), baseUri);
      break;

    case BODY:
    case SEQ:
      ret = attrs(xml);
      ret.childNodes = getValidChildNodes(xml).map(arr => parse$1(arr, baseUri));
      ret.isPar = false;
      break;

    case TEXT:
      ret = attrs(xml);
      if (ret.src && !path.isAbsolute(ret.src)) {
        ret.src = resolvePath(baseUri, ret.src);
      }

      var _ret$src$split = ret.src.split('#');

      var _ret$src$split2 = babelHelpers.slicedToArray(_ret$src$split, 2);

      const srcFile = _ret$src$split2[0];
      const srcFragmentId = _ret$src$split2[1];

      ret.srcFile = srcFile;
      ret.srcFragmentId = srcFragmentId;
      break;

    default:
      break;
  }

  return ret;
}

const NODES = {
  'audio': {
    REQUIRED: {
      src: 'src'
    },
    OPTIONAL: {
      id: 'id',
      clipBegin: 'clipBegin',
      clipEnd: 'clipEnd'
    }
  },
  'body': {
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref',
      type: 'epub:type'
    }
  },
  'par': {
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref'
    }
  },
  'seq': {
    REQUIRED: {
      textref: 'epub:textref'
    },
    OPTIONAL: {
      id: 'id',
      type: 'epub:type'
    }
  },
  'text': {
    REQUIRED: {
      src: 'src'
    },
    OPTIONAL: {
      id: 'id'
    }
  }
};

// this filters and gets the spine items that have a media overlay associated
// with it.
function getMediaOverlayItems(manifest) {
  return manifest.items.filter(id => manifest.byId[id].mediaOverlay);
}

function fetchAll(uri, items, manifest) {
  return Promise.all(items.map(spineId => {
    const smilId = manifest.byId[spineId].mediaOverlay;
    const smilItem = manifest.byId[smilId];
    return manifestItemXml(uri, smilItem.href);
  }));
}

function parseAll(items, manifest, metadata, uri) {
  return function parseAllThunk(manifestItemsXml) {
    const byId = {};
    let i = 0;

    manifestItemsXml.forEach((xml, i) => {
      const spineId = items[i];
      const smilId = manifest.byId[spineId].mediaOverlay;
      const refinement = metadata.mediaOverlayDurations.find(mod => mod.refines === `#${ smilId }`);
      const baseUri = path.dirname(manifest.byId[spineId].href);
      byId[smilId] = smilData(xml, smilId, refinement, baseUri);
    });

    return {
      byId,
      items
    };
  };
}

function smil(uri, manifest, metadata) {
  const items = getMediaOverlayItems(manifest);
  return fetchAll(uri, items, manifest).then(values => parseAll(items, manifest, metadata, uri)(values)).catch(error => console.error(error));
}

function parseSmil(uri, manifest, metadata) {
  return smil(uri, manifest, metadata);
}

function parseSmil$1(uri, manifest, metadata) {
  return smil(uri, manifest, metadata);
}

exports.parseBook = parse;
exports.parseAllSmil = parseSmil;
exports.parseSmil = parseSmil$1;