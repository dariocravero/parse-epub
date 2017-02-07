import * as path from 'path-browserify';
import extractSmilData from '../extract/smil-data';
import fetchXml from '../fetch/xml';

export default function parseSingleSmil(src, id, refinement, baseUri) {
  return fetchXml(src)
    .then(xml => extractSmilData(xml, id, refinement, path.dirname(src)));
}
