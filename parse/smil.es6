import extractSmilData from '../extract/smil-data';
import fetchXml from '../fetch/xml';

export default function index(src) {
  return fetchXml(src)
    .then(xml => extractSmilData(xml, 'widget', {}, '/'));
}
