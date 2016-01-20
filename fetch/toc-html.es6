import 'whatwg-fetch';
import { parseRawHtml } from '../parse-raw';

const TOC_HTML = 'toc.xhtml';
const FOLDER_NAME = 'OPS';

export default function containerHtml(uri, source=TOC_HTML, folder=FOLDER_NAME) {
  return fetch(`${uri}/${folder}/${source}`).
    then(res => res.text()).
    then(body => parseRawHtml(body));
}
