import canIgnoreNode  from './ignore-node';
import parseClockValue from './parse-clock-value';

const AUDIO = 'audio';
const BODY = 'body';
const TAG = 'smil';
const TEXT = 'text';
const VERSION = 'version';

// TODO `smilVersion` could be `version` and the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
export default function smilData(xml, manifestItem, spineItem, {clockValue}) {
  const smilXml = xml.querySelector(TAG);
  const children = extractChildren(smilXml);
  const version = smilXml.getAttribute(VERSION);

  let ret = {
    children,
    id: manifestItem.id,
    version
  };

  if (clockValue) {
    ret.duration = parseClockValue(clockValue);
  }
  return ret;
}

function extractChildren(xml) {
  const filteredNodes = Array.prototype.filter.call(xml.childNodes, canIgnoreNode);
  return Array.prototype.map.call(filteredNodes, extractAttributes);
}

function extractAttributes(itemXml) {
  const node = NODES[itemXml.nodeName];

  let ret;

  if (node) {
    // TODO Refactor together with metadata:38's fn
    function attribute(key, attr, required) {
      try {
        let val = itemXml.getAttribute(attr);
        if (val) {
          ret[key] = val;
        } else {
          throw Exception(`Attribute tag ${attr} exists but there's no value.`);
        }
      } catch(exception) {
        if (required) {
          ret[key] = undefined;
          console.error(`Can't get required attribute '${attr}' for key '${key}' on smil.`, itemXml);
          console.error(exception);
        }
      }
    }

    ret = {
      nodeType: node.type
    };

    Object.keys(node.OPTIONAL).forEach(key => attribute(key, node.OPTIONAL[key], false));
    Object.keys(node.REQUIRED).forEach(key => attribute(key, node.REQUIRED[key], true));

    // TODO Review. Readium seems to need this
    // https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L113-L115
    // http://www.idpf.org/epub/linking/cfi/epub-cfi.html
    if (ret.nodeType === TEXT) {
      const [ srcFile, srcFragmentId ] = ret.src.split('#');
      ret.srcFile = srcFile;
      ret.srcFragmentId = srcFragmentId;
    }

    if (ret.nodeType === AUDIO) {
      if (ret.clipBegin) {
        ret.clipBegin = parseClockValue(ret.clipBegin);
      }
      if (ret.clipEnd) {
        ret.clipEnd = parseClockValue(ret.clipEnd);
      }
    }

    if (node.canHaveChildren) {
      ret.children = extractChildren(itemXml);
    }
  // } else {
    // TODO Review this edge case. Should we throw or silently fail?
    // console.error(`${itemXml.tagName} isn't a valid smil data node`, itemXml);
  }

  return ret;
}

const NODES = {
  'audio': {
    canHaveChildren: false,
    type: 'audio',
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
    canHaveChildren: true,
    type: 'body',
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref',
      type: 'epub:type'
    }
  },
  'par': {
    canHaveChildren: true,
    type: 'par',
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref'
    }
  },
  'seq': {
    canHaveChildren: true,
    type: 'seq',
    REQUIRED: {
      textref: 'epub:textref'
    },
    OPTIONAL: {
      id: 'id',
      type: 'epub:type'
    }
  },
  'text': {
    canHaveChildren: false,
    type: 'text',
    REQUIRED: {
      src: 'src'
    },
    OPTIONAL: {
      id: 'id'
    }
  }
}

// TODO
// - Double check the spec on body and seq / par as it seems that par and seq are equals and by
//   Readium's code it seems that body is a seq too? The code is implemented to follow Readium's way
//   of doing it so we can reuse the MediaOverlayPlayer.
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/smil-document-parser.js#L90
//   http://www.idpf.org/epub/30/spec/epub30-mediaoverlays.html#sec-smil-body-elem
