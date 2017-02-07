import xml from './xml';

export default function rootXml(uri, source) {
  return xml(`${uri}/${source}`);
}
