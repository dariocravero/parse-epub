import { xml as fetchXml } from '../fetch';
import extractSmilData from '../extract/smil-data';

export default function index(src) {
  return fetchXml(src)
    .then(xml => extractSmilData(xml, 'widget', {}, '/'));
}
