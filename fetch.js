import parseXml from 'txml';

const CONTAINER_XML = 'META-INF/container.xml';
const TOC_HTML = 'toc.xhtml';
const OPS_DIRECTORY = 'OPS';

export const xml = uri => (
  fetch(uri, { credentials: 'include' }).then(r => r.text()).then(t => parseXml(t)[0])
);

export const containerXml = (uri, source=CONTAINER_XML) => xml(`${uri}/${source}`);
export const manifestItemXml = (uri, source, path) => xml(`${uri}/${path}/${source}`);
export const rootXml = (uri, source) => xml(`${uri}/${source}`);
export const tocHtml = (uri, source=TOC_HTML, path=OPS_DIRECTORY) => xml(`${uri}/${path}/${source}`);
