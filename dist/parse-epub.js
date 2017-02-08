(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ParseEpub = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var uniqueId = _interopDefault(require('mini-unique-id'));

// These functions are lifted directly from https://www.npmjs.com/package/path-browserify
// I have only included the ones that we are currently using - if we need any more in future: go get 'em!
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function splitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
};

function filter(xs, f) {
  if (xs.filter) return xs.filter(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
}

var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
  return str.substr(start, len);
} : function (str, start, len) {
  if (start < 0) start = str.length + start;
  return str.substr(start, len);
};

function resolve() {
  var resolvedPath = '';
  var resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
}

function normalize(path) {
  var absolute = isAbsolute(path);
  var trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function (p) {
    return !!p;
  }), !absolute).join('/');

  if (!path && !absolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (absolute ? '/' : '') + path;
}

function isAbsolute(path) {
  return path.charAt(0) === '/';
}

function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function (p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}

function dirname(path) {
  var result = splitPath(path);
  var root = result[0];
  var dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function extname(path) {
  return splitPath(path)[3];
}

function items(xml, item, attributes, mediaTypeWhitelist) {
  return Array.prototype.filter.call(xml.querySelectorAll(item), function (item) {
    return !mediaTypeWhitelist || mediaTypeWhitelist.indexOf(item.getAttribute(attributes.mediaType)) > -1;
  }).map(function (item) {
    var ret = {};

    Object.keys(attributes).forEach(function (key) {
      try {
        ret[key] = item.getAttribute(attributes[key]);
      } catch (exception) {
        ret[key] = undefined;
        console.error("Can't get " + key + " for " + item + " on " + tag + ".");
      }
    });

    return ret;
  });
}

function normalise(list) {
  var byId = {};
  var items = list.map(function (item) {
    byId[item.id] = item;
    return item.id;
  });

  return {
    byId: byId,
    items: items
  };
}

var ATTRIBUTES = {
  href: 'href',
  id: 'id',
  mediaType: 'media-type',
  mediaOverlay: 'media-overlay',
  properties: 'properties'
};
var ITEM = 'item';
var TAG = 'manifest';

function manifest(rootXml, mediaTypeWhitelist) {
  return normalise(items(rootXml.querySelector(TAG), ITEM, ATTRIBUTES, mediaTypeWhitelist));
}

// TODO
// - content in the properties attribute may need to be parsed
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L420-L487

function coverHref(manifest) {
  var item = manifest.byId['cover-item'] || manifest.byId['cover'] || manifest.byId[Object.keys(manifest.byId).find(function (id) {
    return (/cover-image/.test(manifest.byId[id].properties)
    );
  })];

  if (item) {
    return item.href;
  }
}

// TODO
// - Support ePub2 coverHref
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L395-L417

var ATTRIBUTES$1 = {
  OPTIONAL: ['creator', 'contributor', 'coverage', 'creator', 'date', 'description', 'format', 'publisher', 'relation', 'rights', 'source', 'subject', 'type'],
  REQUIRED: ['identifier', 'language', 'title'],
  PROPERTIES: {
    mediaActiveClass: 'media:active-class',
    mediaDuration: 'media:duration',
    mediaNarrator: 'media:narrator'
  }
};
var NS = '*';
var META = 'meta';
var TAG$1 = 'metadata';

function metadata(rootXml, manifest) {
  var ret = {};
  var xml = rootXml.querySelector(TAG$1);

  function attribute(attr, required) {
    try {
      ret[attr] = xml.getElementsByTagNameNS(NS, attr)[0].textContent;
    } catch (exception) {
      if (required) {
        ret[attr] = undefined;
        console.error('Can\'t get required attribute \'' + attr + '\' on metadata.');
      }
    }
  }

  ATTRIBUTES$1.OPTIONAL.forEach(function (attr) {
    return attribute(attr, false);
  });
  ATTRIBUTES$1.REQUIRED.forEach(function (attr) {
    return attribute(attr, true);
  });

  ret.coverHref = coverHref(manifest);

  var mediaDurationXml = xml.querySelectorAll(META + '[property=\'' + ATTRIBUTES$1.PROPERTIES.mediaDuration + '\']');
  if (mediaDurationXml.length) {
    ret.mediaOverlayDurations = [];
    ret.mediaDuration;
    Array.prototype.forEach.call(mediaDurationXml, function (item) {
      var refines = item.getAttribute('refines');

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

  var mediaActiveClassXml = xml.querySelector(META + '[property=\'' + ATTRIBUTES$1.PROPERTIES.mediaActiveClass + '\']');
  if (mediaActiveClassXml) {
    ret.mediaActiveClass = mediaActiveClassXml.textContent;
  }

  var mediaNarratorXml = xml.querySelectorAll(META + '[property=\'' + ATTRIBUTES$1.PROPERTIES.mediaNarrator + '\']');
  if (mediaNarratorXml.length) {
    ret.mediaNarrator = Array.prototype.map.call(mediaNarratorXml, function (item) {
      return item.textContent;
    });
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

var ROOT_FILE = 'rootfile';
var FULL_PATH = 'full-path';

function rootFile(containerXml) {
  var packageDocumentPath = containerXml.querySelector(ROOT_FILE).getAttribute(FULL_PATH);
  if (extname(packageDocumentPath) === '.opf') {
    return packageDocumentPath;
  } else {
    throw new Error('no .opf file could be found in META-INF/container.xml');
  }
}

var ATTRIBUTES$2 = {
  id: 'idref',
  linear: 'linear',
  properties: 'properties'
};
var ITEM$1 = 'itemref';
var TAG$2 = 'spine';
var YES = 'yes';

function spine(rootXml, tocItem) {
  return normalise(items(rootXml.querySelector(TAG$2), ITEM$1, ATTRIBUTES$2).filter(function (item) {
    return typeof tocItem === 'undefined' ? true : tocItem.id !== item.id;
  }).map(function (item) {
    return {
      id: item.id,
      linear: item.linear === YES,
      properties: item.properties
    };
  }));
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68

function getTocItem(manifest) {
  var tocManifestId = manifest.items.find(function (id) {
    return (/nav/.test(manifest.byId[id].properties)
    );
  });
  return manifest.byId[tocManifestId];
}

// Spec says we need to select the TOC using the epub:type=toc property
var TAG$3 = 'nav[epub\\\:type~=toc]';
var ROOT = '__root__';

function toc(tocHtml, manifest, spine) {
  var byId = {};
  var byManifestId = {};
  var items$$1 = [];

  var tocItem = getTocItem(manifest);
  var tocItemPath = dirname(tocItem.href);
  parse(tocHtml.querySelector(TAG$3), ROOT);

  function parse(snippet, id, href, label, parentId) {
    var level = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    var hrefWithoutHash = href && join(tocItemPath, href.split('#')[0]);
    var manifestId = Object.keys(manifest.byId).find(function (id) {
      return manifest.byId[id].href === hrefWithoutHash;
    });

    // Don't include the TOC reference item in the spine
    if (tocItem.id !== manifestId) {
      var ol = snippet.querySelector('ol');
      var childNodes = [];

      if (ol) {
        childNodes = Array.prototype.filter.call(ol.children, function (node) {
          return node.tagName === 'LI';
        }).map(function (node) {
          var link = node.querySelector('a');
          var childId = uniqueId();
          return parse(node, childId, link.getAttribute('href'), link.textContent, id, level + 1) && childId;
        }).filter(function (id) {
          return id;
        });
      }

      var isLeaf = childNodes.length === 0;

      // We mainly care about leafs as those are the ones that contain pages and are thus open
      if (isLeaf) {
        byManifestId[manifestId] = id;
        items$$1.push(id);
      }

      byId[id] = {
        childNodes: childNodes,
        id: id,
        isLeaf: isLeaf,
        href: hrefWithoutHash,
        label: label,
        level: level,
        linear: snippet.getAttribute('linear'),
        manifestId: manifestId,
        parentId: parentId
      };

      return true;
    } else {
      return false;
    }
  }

  return {
    byId: byId,
    byManifestId: byManifestId,
    items: items$$1
  };
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68

/* global DOMParser */

var HTML = 'text/html';
var XML = 'text/xml';
var domParser = new DOMParser();

function parseRaw(markup) {
  var contentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : XML;

  return domParser.parseFromString(markup, contentType);
}

function parseRawHtml(markup) {
  return parseRaw(markup, HTML);
}

function parseRawXml(markup) {
  return parseRaw(markup, XML);
}

function xml(uri) {
  return fetch(uri, { credentials: 'include' }).then(function (res) {
    return res.text();
  }).then(function (body) {
    return parseRawXml(body);
  });
}

var CONTAINER_XML = 'META-INF/container.xml';

function containerXml(uri) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CONTAINER_XML;

  return xml(uri + '/' + source);
}

function rootXml(uri, source) {
  return xml(uri + '/' + source);
}

var TOC_HTML = 'toc.xhtml';
var OPF_DIRECTORY = 'OPS';

function containerHtml(uri) {
  var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TOC_HTML;
  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : OPF_DIRECTORY;

  return fetch(uri + '/' + path + '/' + source, { credentials: 'include' }).then(function (res) {
    return res.text();
  }).then(function (body) {
    return parseRawHtml(body);
  });
}

function parse(uri) {
  var manifestMediaTypeWhitelist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var packageDirectory = void 0;

  return containerXml(uri).then(function (containerXml$$1) {
    return rootFile(containerXml$$1);
  }).then(function (rootFile$$1) {
    packageDirectory = dirname(rootFile$$1);
    return rootXml(uri, rootFile$$1);
  }).then(function (rootXml$$1) {
    var manifest$$1 = manifest(rootXml$$1, manifestMediaTypeWhitelist);
    var tocItem = getTocItem(manifest$$1);
    var spine$$1 = spine(rootXml$$1, tocItem);

    return containerHtml(uri, tocItem.href, packageDirectory).then(function (tocHtml) {
      return {
        packageDirectory: packageDirectory,
        manifest: manifest$$1,
        metadata: metadata(rootXml$$1, manifest$$1),
        spine: spine$$1,
        toc: toc(tocHtml, manifest$$1, spine$$1)
      };
    });
  }).catch(function (err) {
    var nextErr = err;

    if (/Cannot read property 'getAttribute' of null/.test(err.message)) {
      nextErr = new Error('We couldn\'t find a book at ' + uri + '.');
    }

    throw nextErr;
  });
}

function manifestItemXml(uri, source, path) {
  return xml(uri + '/' + path + '/' + source);
}

// this function will return DOM parsed nodes that are not comments or text nodes containing whitespace
function canIgnoreNode(node) {
  return !(node.nodeType === window.Node.COMMENT_NODE || node.nodeType === window.Node.TEXT_NODE && !/[^\t\n\r ]/.test(node.textContent));
}

var HOURS = 'h';
var MINUTES = 'min';
var MILLISECONDS = 'ms';
var SECONDS = 's';
var TIME_SEPARATOR = ':';

// https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L213-L243
// parse the timestamp and return the value in seconds
// supports this syntax:
// http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
function parseClockValue(value) {
  if (!value) return 0;

  var hours = 0;
  var mins = 0;
  var secs = 0;

  var index = {
    hours: value.indexOf(HOURS),
    mins: value.indexOf(MINUTES),
    ms: value.indexOf(MILLISECONDS),
    secs: value.indexOf(SECONDS)
  };

  if (index.mins !== -1) {
    mins = parseFloat(value.substr(0, index.mins), 10);
  } else if (index.ms !== -1) {
    var ms = parseFloat(value.substr(0, index.ms), 10);
    secs = ms / 1000;
  } else if (index.secs !== -1) {
    secs = parseFloat(value.substr(0, index.secs), 10);
  } else if (index.hours !== -1) {
    hours = parseFloat(value.substr(0, index.hours), 10);
  } else {
    // parse as hh:mm:ss.fraction
    // this also works for seconds-only, e.g. 12.345
    var arr = value.split(TIME_SEPARATOR);
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

var slicedToArray = function () {
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

var AUDIO = 'audio';
var BODY = 'body';
var PAR = 'par';
var SEQ = 'seq';
var TAG$4 = 'smil';
var TEXT = 'text';
var VERSION = 'version';

// TODO the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
function smilData(xml, id) {
  var refinement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var baseUri = arguments[3];

  var smilXml = xml.querySelector(TAG$4);

  var ret = {
    body: parse$1(smilXml.querySelector(BODY), baseUri),
    id: id,
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
  var node = NODES[itemXml.nodeName];
  var ret = {};

  function attr(key, attr, required) {
    try {
      var val = itemXml.getAttribute(attr);
      if (val) {
        ret[key] = val;
      } else {
        throw Exception('Attribute tag ' + attr + ' exists but there\'s no value.');
      }
    } catch (exception) {
      if (required) {
        ret[key] = false;
        console.error('Can\'t get required attribute \'' + attr + '\' for key \'' + key + '\' on smil.', itemXml);
        console.error(exception);
      }
    }
  }

  Object.keys(node.OPTIONAL).forEach(function (key) {
    return attr(key, node.OPTIONAL[key], false);
  });
  Object.keys(node.REQUIRED).forEach(function (key) {
    return attr(key, node.REQUIRED[key], true);
  });

  return ret;
}

function resolvePath(baseUri, relativePath) {
  return resolve(baseUri, relativePath);
}

function parse$1(xml, baseUri) {
  var ret = void 0;

  switch (xml.nodeName) {
    case AUDIO:
      ret = attrs(xml);
      if (ret.src && !isAbsolute(ret.src)) {
        ret.src = resolvePath(baseUri, ret.src);
      }
      ret.clipBegin = ret.clipBegin && parseClockValue(ret.clipBegin);
      ret.clipEnd = ret.clipEnd && parseClockValue(ret.clipEnd);
      break;

    case PAR:
      ret = attrs(xml);
      // handle the fact that audio tags are optional
      var audioTag = xml.querySelector(AUDIO);
      if (audioTag) {
        ret.audio = parse$1(audioTag, baseUri);
      }
      ret.isPar = true;
      ret.text = parse$1(xml.querySelector(TEXT), baseUri);
      break;

    case BODY:
    case SEQ:
      ret = attrs(xml);
      ret.childNodes = getValidChildNodes(xml).map(function (arr) {
        return parse$1(arr, baseUri);
      });
      ret.isPar = false;
      break;

    case TEXT:
      ret = attrs(xml);
      if (ret.src && !isAbsolute(ret.src)) {
        ret.src = resolvePath(baseUri, ret.src);
      }

      var _ret$src$split = ret.src.split('#'),
          _ret$src$split2 = slicedToArray(_ret$src$split, 2),
          srcFile = _ret$src$split2[0],
          srcFragmentId = _ret$src$split2[1];

      ret.srcFile = srcFile;
      ret.srcFragmentId = srcFragmentId;
      break;

    default:
      break;
  }

  return ret;
}

var NODES = {
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
      textref: 'epub:textref',
      type: 'epub:type'
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
  return manifest.items.filter(function (id) {
    return manifest.byId[id].mediaOverlay;
  });
}

function fetchAll(uri, items, manifest, path) {
  return Promise.all(items.map(function (spineId) {
    var smilId = manifest.byId[spineId].mediaOverlay;
    var smilUri = manifest.byId[smilId].href;


    return manifestItemXml(uri, smilUri, path).then(function (manifestItemsXml) {
      return { manifestItemsXml: manifestItemsXml, smilUri: smilUri };
    });
  }));
}

function parseAll(items, manifest, metadata, uri) {
  return function parseAllThunk(smilData$$1) {
    var byId = {};
    var i = 0;

    smilData$$1.forEach(function (smilDetail, i) {
      var spineId = items[i];
      var smilId = manifest.byId[spineId].mediaOverlay;
      var refinement = metadata.mediaOverlayDurations.find(function (mod) {
        return mod.refines === '#' + smilId;
      });
      var baseUri = dirname(smilDetail.smilUri);
      byId[smilId] = smilData(smilDetail.manifestItemsXml, smilId, refinement, baseUri);
    });

    return {
      byId: byId,
      items: items
    };
  };
}

function smil(uri, manifest, metadata, path) {
  var items = getMediaOverlayItems(manifest);
  return fetchAll(uri, items, manifest, path).then(function (smilData$$1) {
    return parseAll(items, manifest, metadata, uri)(smilData$$1);
  }).catch(function (error) {
    return console.error(error);
  });
}

function parseSmil(uri, manifest, metadata, packageDirectory) {
  return smil(uri, manifest, metadata, packageDirectory);
}

function parseSingleSmil(src, id, refinement, baseUri) {
    return xml(src).then(function (xml$$1) {
        return smilData(xml$$1, id, refinement, dirname(src));
    });
}

function index(src) {
    return xml(src).then(function (xml$$1) {
        return smilData(xml$$1, 'widget', {}, '/');
    });
}

exports.parseBook = parse;
exports.parseAllSmil = parseSmil;
exports.parseSingleSmil = parseSingleSmil;
exports.parseSmil = index;

}).call(this,require('_process'))

},{"_process":3,"mini-unique-id":2}],2:[function(require,module,exports){
'use strict';

var id = 1;

function index () {
  return "" + id++;
}

module.exports = index;
},{}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});
//# sourceMappingURL=parse-epub.js.map
