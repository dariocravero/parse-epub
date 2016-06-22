import canIgnoreNode  from './ignore-node';
import parseClockValue from './parse-clock-value';
import * as path from 'path-browserify';

const AUDIO = 'audio';
const BODY = 'body';
const PAR = 'par';
const SEQ = 'seq';
const TAG = 'smil';
const TEXT = 'text';
const VERSION = 'version';

let nodeTracker = [];

// TODO the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
export default function smilData(xml, id, refinement={}, baseUri) {
 

  //reset
  nodeTracker = [];

  const smilXml = xml.querySelector(TAG);

  const ret = {
    body: parse(smilXml.querySelector(BODY), baseUri),
    id,
    version: smilXml.getAttribute(VERSION)
  };

  if (refinement.clockValue) {
    ret.duration = parseClockValue(refinement.clockValue);
  }

  if(ret.body.childNodes.length>1) {
    flattenNodes(ret.body);
    ret.body.childNodes = nodeTracker;
  }

  return ret;
}

//flattenNodes
function flattenNodes(nodes){
    return nodes.childNodes.map(node => { 
        if(typeof node.childNodes === 'undefined'){
          return nodeTracker.push(node);
        }else{
         return flattenNodes(node);
        }
    });
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
        throw Exception(`Attribute tag ${attr} exists but there's no value.`);
      }
    } catch(exception) {
      if (required) {
        ret[key] = false;
        console.error(`Can't get required attribute '${attr}' for key '${key}' on smil.`, itemXml);
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

function parse(xml, baseUri) {
  let ret;

  switch(xml.nodeName) {
  case AUDIO:
    ret = attrs(xml);
    if(ret.src && !path.isAbsolute(ret.src)) {
      ret.src = resolvePath(baseUri, ret.src);
    }
    ret.clipBegin = ret.clipBegin && parseClockValue(ret.clipBegin);
    ret.clipEnd = ret.clipEnd && parseClockValue(ret.clipEnd);
    break;

  case PAR:
    ret = attrs(xml);
    // handle the fact that audio tags are optional
    const audioTag = xml.querySelector(AUDIO);
    if (audioTag) {
      ret.audio = parse(audioTag, baseUri);
    }
    ret.isPar = true;
    ret.text = parse(xml.querySelector(TEXT), baseUri);
    break;

  case BODY:
  case SEQ:
    ret = attrs(xml);
    ret.childNodes = getValidChildNodes(xml).map(arr => parse(arr, baseUri));
    ret.isPar = false;
    break;

  case TEXT:
    ret = attrs(xml);
    if(ret.src && !path.isAbsolute(ret.src)) {
      ret.src = resolvePath(baseUri, ret.src);
    }
    const [ srcFile, srcFragmentId ] = ret.src.split('#');
    ret.srcFile = srcFile;
    ret.srcFragmentId = srcFragmentId;
    break;

  default: break;
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
