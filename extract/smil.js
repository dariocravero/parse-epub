import canIgnoreNode  from './ignore-node';
import parseClockValue from './parse-clock-value';
import { isAbsolute, resolve } from '../path-helpers.js';

const AUDIO = 'audio';
const BODY = 'body';
const PAR = 'par';
const SEQ = 'seq';
const TAG = 'smil';
const TEXT = 'text';
const VERSION = 'version';

const parse = (root, baseUri) => {
  let ret = [];

  if (root.seq) {
    const list = Array.isArray(root.seq)? root.seq : [root.seq]

    ret = list.map(s => ({
      childNodes: parse(s, baseUri),
      isPar: false,
      textref: s['epub:textref'],
      // optional TODO maybe we want to only include them if they're there
      id: s.id,
      type: s['epub:type'],
    }))
  } else if (root.par) {
    const list = Array.isArray(root.par)? root.par : [root.par]

    ret = list.map(p => {
      const par = {
        isPar: true,
        text: getText(p.text, baseUri),
        // optional TODO maybe we want to only include them if they're there
        id: p.id,
        type: p['epub:type'],
        textref: p['epub:textref'],
      }

      if (p.audio) {
        par.audio = getAudio(p.audio, baseUri)
      }
      return par
    })
  }

  return ret;
}

// TODO the parsing of the `clockValue` could be deferred
// up to when its used. We put it in here to comply with Readium's data structure needs.
export default function smilData(root, id, refinement={}, baseUri) {
  const ret = {
    body: {
      childNodes: parse(root.smil.body, baseUri),
      // optional TODO maybe we want to only include them if they're there
      id: root.smil.id,
      type: root.smil['epub:type'],
      textref: root.smil['epub:textref'],
    },
    id,
    version: root.smil.version
  };

  if (refinement.clockValue) {
    ret.duration = parseClockValue(refinement.clockValue);
  }
  return ret;
}

function getValidChildNodes(xml) {
  return Array.prototype.filter.call(xml.childNodes, canIgnoreNode);
}

function resolvePath(baseUri, relativePath) {
  return resolve(baseUri, relativePath);
}

const getAudio = (root, baseUri) => {
  const ret = {
    id: root.id,
    clipBegin: root.clipBegin && parseClockValue(root.clipBegin),
    clipEnd: root.clipEnd && parseClockValue(root.clipEnd),
    src: root.src,
  }

  if (ret.src && !isAbsolute(ret.src)) {
    ret.src = resolvePath(baseUri, ret.src);
  }
  return ret;
}

const getText = (root, baseUri) => {
  const ret = {
    id: root.id,
    src: root.src,
  };

  if (ret.src && !isAbsolute(ret.src)) {
    ret.src = resolvePath(baseUri, ret.src);
  }

  const [ srcFile, srcFragmentId ] = ret.src.split('#');
  ret.srcFile = srcFile;
  ret.srcFragmentId = srcFragmentId;
  return ret;
}
