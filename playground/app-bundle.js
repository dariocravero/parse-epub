'use strict';

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


var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

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

var index$3 = __commonjs(function (module) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Checks if `value` is in `cache`.
 *
 * @private
 * @param {Object} cache The set cache to search.
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function cacheHas(cache, value) {
  var map = cache.__data__;
  if (isKeyable(value)) {
    var data = map.__data__,
        hash = typeof value == 'string' ? data.string : data.hash;

    return hash[value] === HASH_UNDEFINED;
  }
  return map.has(value);
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'number' || type == 'boolean' ||
    (type == 'string' && value !== '__proto__') || value == null;
}

module.exports = cacheHas;
});

var require$$0 = (index$3 && typeof index$3 === 'object' && 'default' in index$3 ? index$3['default'] : index$3);

var index$5 = __commonjs(function (module) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.includesWith` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

module.exports = arrayIncludesWith;
});

var require$$1 = (index$5 && typeof index$5 === 'object' && 'default' in index$5 ? index$5['default'] : index$5);

var index$4 = __commonjs(function (module) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  return !!array.length && baseIndexOf(array, value, 0) > -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return indexOfNaN(array, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * Gets the index at which the first occurrence of `NaN` is found in `array`.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
 */
function indexOfNaN(array, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 0 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    var other = array[index];
    if (other !== other) {
      return index;
    }
  }
  return -1;
}

module.exports = arrayIncludes;
});

var require$$2 = (index$4 && typeof index$4 === 'object' && 'default' in index$4 ? index$4['default'] : index$4);

var index$7 = __commonjs(function (module, exports, global) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto = global.Array.prototype,
    objectProto = global.Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = global.Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map = getNative(global, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates an hash object.
 *
 * @private
 * @returns {Object} Returns the new hash object.
 */
function Hash() {}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(hash, key) {
  return hashHas(hash, key) && delete hash[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @param {Object} hash The hash to query.
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(hash, key) {
  if (nativeCreate) {
    var result = hash[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(hash, key) ? hash[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @param {Object} hash The hash to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(hash, key) {
  return nativeCreate ? hash[key] !== undefined : hasOwnProperty.call(hash, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 */
function hashSet(hash, key, value) {
  hash[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @param {Array} [values] The values to cache.
 */
function MapCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.clear();
  while (++index < length) {
    var entry = values[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapClear() {
  this.__data__ = { 'hash': new Hash, 'map': Map ? new Map : [], 'string': new Hash };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapDelete(key) {
  var data = this.__data__;
  if (isKeyable(key)) {
    return hashDelete(typeof key == 'string' ? data.string : data.hash, key);
  }
  return Map ? data.map['delete'](key) : assocDelete(data.map, key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapGet(key) {
  var data = this.__data__;
  if (isKeyable(key)) {
    return hashGet(typeof key == 'string' ? data.string : data.hash, key);
  }
  return Map ? data.map.get(key) : assocGet(data.map, key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapHas(key) {
  var data = this.__data__;
  if (isKeyable(key)) {
    return hashHas(typeof key == 'string' ? data.string : data.hash, key);
  }
  return Map ? data.map.has(key) : assocHas(data.map, key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache object.
 */
function mapSet(key, value) {
  var data = this.__data__;
  if (isKeyable(key)) {
    hashSet(typeof key == 'string' ? data.string : data.hash, key, value);
  } else if (Map) {
    data.map.set(key, value);
  } else {
    assocSet(data.map, key, value);
  }
  return this;
}

/**
 * Removes `key` and its value from the associative array.
 *
 * @private
 * @param {Array} array The array to query.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function assocDelete(array, key) {
  var index = assocIndexOf(array, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = array.length - 1;
  if (index == lastIndex) {
    array.pop();
  } else {
    splice.call(array, index, 1);
  }
  return true;
}

/**
 * Gets the associative array value for `key`.
 *
 * @private
 * @param {Array} array The array to query.
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function assocGet(array, key) {
  var index = assocIndexOf(array, key);
  return index < 0 ? undefined : array[index][1];
}

/**
 * Checks if an associative array value for `key` exists.
 *
 * @private
 * @param {Array} array The array to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function assocHas(array, key) {
  return assocIndexOf(array, key) > -1;
}

/**
 * Gets the index at which the first occurrence of `key` is found in `array`
 * of key-value pairs.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * Sets the associative array `key` to `value`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 */
function assocSet(array, key, value) {
  var index = assocIndexOf(array, key);
  if (index < 0) {
    array.push([key, value]);
  } else {
    array[index][1] = value;
  }
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'number' || type == 'boolean' ||
    (type == 'string' && value !== '__proto__') || value == null;
}

/**
 * Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(funcToString.call(value));
  }
  return isObjectLike(value) &&
    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
}

// Avoid inheriting from `Object.prototype` when possible.
Hash.prototype = nativeCreate ? nativeCreate(null) : objectProto;

// Add functions to the `MapCache`.
MapCache.prototype.clear = mapClear;
MapCache.prototype['delete'] = mapDelete;
MapCache.prototype.get = mapGet;
MapCache.prototype.has = mapHas;
MapCache.prototype.set = mapSet;

module.exports = MapCache;
});

var require$$0$1 = (index$7 && typeof index$7 === 'object' && 'default' in index$7 ? index$7['default'] : index$7);

var index$6 = __commonjs(function (module) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var MapCache = require$$0$1;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 *
 * Creates a set cache object to store unique values.
 *
 * @private
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.push(values[index]);
  }
}

/**
 * Adds `value` to the set cache.
 *
 * @private
 * @name push
 * @memberOf SetCache
 * @param {*} value The value to cache.
 */
function cachePush(value) {
  var map = this.__data__;
  if (isKeyable(value)) {
    var data = map.__data__,
        hash = typeof value == 'string' ? data.string : data.hash;

    hash[value] = HASH_UNDEFINED;
  }
  else {
    map.set(value, HASH_UNDEFINED);
  }
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return type == 'number' || type == 'boolean' ||
    (type == 'string' && value !== '__proto__') || value == null;
}

// Add functions to the `SetCache`.
SetCache.prototype.push = cachePush;

module.exports = SetCache;
});

var require$$3 = (index$6 && typeof index$6 === 'object' && 'default' in index$6 ? index$6['default'] : index$6);

var index$2 = __commonjs(function (module, exports, global) {
/**
 * lodash 4.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var SetCache = require$$3,
    arrayIncludes = require$$2,
    arrayIncludesWith = require$$1,
    cacheHas = require$$0;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns). */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `set` to an array.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the converted array.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var objectProto = global.Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = global.Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Built-in method references that are verified to be native. */
var Set = getNative(global, 'Set');

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a set of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && new Set([1, 2]).size === 2) ? noop : function(values) {
  return new Set(values);
};

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept.
 *
 * @static
 * @memberOf _
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length)
    ? baseUniq(array)
    : [];
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(funcToString.call(value));
  }
  return isObjectLike(value) &&
    (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
}

/**
 * A no-operation function that returns `undefined` regardless of the
 * arguments it receives.
 *
 * @static
 * @memberOf _
 * @category Util
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // No operation performed.
}

module.exports = uniq;
});

var uniqueId = (index$2 && typeof index$2 === 'object' && 'default' in index$2 ? index$2['default'] : index$2);

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
      manifest: manifest$$,
      metadata: metadata(rootXml, manifest$$),
      spine: spine$$,
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

var index = __commonjs(function (module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
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
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

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
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;
});

var dirname = index.dirname;
var isAbsolute = index.isAbsolute;
var resolve = index.resolve;

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
  return resolve(baseUri, relativePath);
}

function parse$1(xml, baseUri) {
  let ret;

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
      if (ret.src && !isAbsolute(ret.src)) {
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
      const baseUri = dirname(manifest.byId[spineId].href);
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

const URI = '/books/demo';

console.log('parse-epub: parsing book', URI);

parse(URI).then(data => {
  console.log('parse-epub: parsed data', data);

  parseSmil(URI, data.manifest, data.metadata).then(smil => {
    console.log('parse-epub: smil data', smil);

    window.$p = {
      book: data,
      smil
    };

    console.log('parse-epub: you can play with window.$p now', $p);
  });
});