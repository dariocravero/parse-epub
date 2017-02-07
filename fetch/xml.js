import { parseRawXml } from '../parse-raw';

export default function xml(uri) {
  return fetch(uri, { credentials: 'include' }).
    then(res => res.text()).
    then(body => parseRawXml(body));
}
