import 'whatwg-fetch';
import { parseRawHtml } from '../parse-raw';

const TOC_HTML = 'toc.xhtml';

export default function containerHtml(uri, source=TOC_HTML) {
  return fetch(`${uri}/OPS/${source}`).
    then(res => res.text()).
    then(body => parseRawHtml(body));
}
