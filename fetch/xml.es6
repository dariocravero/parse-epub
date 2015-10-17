import 'whatwg-fetch';
import { parseRawXml } from '../parse-raw';

export default function xml(uri) {
  return fetch(uri).
    then(res => res.text()).
    then(body => parseRawXml(body));
}
