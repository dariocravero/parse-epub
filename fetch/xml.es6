import 'whatwg-fetch';
import { parseRawXml } from '../parse-raw';

export default async function xml(uri) {
  return await fetch(uri).
    then(res => res.text()).
    then(body => parseRawXml(body));
}
