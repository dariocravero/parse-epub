import canIgnoreNode  from './ignore-node';
import parseClockValue from './parse-clock-value';

const AUDIO = 'audio';
const BODY = 'body';
const TAG = 'smil';
const TEXT = 'text';
const VERSION = 'version';

// TODO the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
export default function smilData(xml, id, {clockValue}) {
  const smilXml = xml.querySelector(TAG);

  const ret = {
    body: extractAttributes(smilXml.querySelector(BODY)),
    id,
    version: smilXml.getAttribute(VERSION)
  };

  if (clockValue) {
    ret.duration = parseClockValue(clockValue);
  }
  return ret;
}

function extractChildNodes(xml) {
  return Array.prototype.filter.call(xml.childNodes, canIgnoreNode).map(extractAttributes);
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

    if (node.canHavechildNodes) {
      ret.childNodes = extractChildNodes(itemXml);
    }
  // } else {
    // TODO Review this edge case. Should we throw or silently fail?
    // console.error(`${itemXml.tagName} isn't a valid smil data node`, itemXml);
  }

  return ret;
}

const NODES = {
  'audio': {
    canHavechildNodes: false,
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
    canHavechildNodes: true,
    type: 'body',
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref',
      type: 'epub:type'
    }
  },
  'par': {
    canHavechildNodes: true,
    type: 'par',
    REQUIRED: {},
    OPTIONAL: {
      id: 'id',
      textref: 'epub:textref'
    }
  },
  'seq': {
    canHavechildNodes: true,
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
    canHavechildNodes: false,
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
