import { parseRawHtml } from '../parse-raw';

const TOC_HTML = 'toc.xhtml';
const OPF_DIRECTORY = 'OPS';

export default function containerHtml(uri, source=TOC_HTML, path=OPF_DIRECTORY) {
  return fetch(`${uri}/${path}/${source}`, { credentials: 'include' }).
    then(res => res.text()).
    then(body => parseRawHtml(body));
}
