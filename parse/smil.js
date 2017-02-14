import { xml as fetchXml } from '../fetch';
import { getDirname } from '../path-helpers.js';
import extractSmilData from '../extract/smil';

export default function parseSmil(src, id, refinement, baseUri) {
  return fetchXml(src)
    .then(xml => extractSmilData(xml, id, refinement, getDirname(src)));
}
