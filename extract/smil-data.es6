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
  //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(children));
  const version = smilXml.getAttribute(VERSION);

  let ret = {
    children,
    //href: manifestItem.href,
    id: manifestItem.id,
    //spineItemId: spineItem.id,
    version
  };

  if (clockValue) {
    ret.duration = parseClockValue(clockValue);
  }
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', JSON.stringify(ret));
  return ret;
}

function extractChildren(xml) {
  console.log('xml', xml);
  console.log('xml.childNodes', xml.childNodes);
  //console.log('--->', Array.prototype.map.call(xml.childNodes, extractAttributes).filter(c => !!c));
  return Array.prototype.map.call(xml.childNodes, extractAttributes).filter(c => {
    //console.log('cccccccccc', c);
    return !!c;
  });
}

function extractAttributes(itemXml) {
  const node = NODES[itemXml.nodeName];

  if(isNodeIgnorable(itemXml)) {
    console.log('ignoring', itemXml);
    return;
  }

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

  console.log('node', node, 'itemXml', itemXml, 'ret', ret);

  return ret;
}

function isNodeIgnorable(nod) {
  return (nod.nodeType == 8) || // A comment node
         ((nod.nodeType == 3) && !(/[^\t\n\r ]/.test(nod.textContent))); // a text node, constaining whitespace
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
    type: 'seq',
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
