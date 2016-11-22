import xml from './xml';

export default function manifestItemXml(uri, source, path) {
  return xml(`${uri}/${path}/${source}`);
}
