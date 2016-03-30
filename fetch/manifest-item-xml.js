import xml from './xml';

export default function manifestItemXml(uri, source) {
  return xml(`${uri}/OPS/${source}`);
}
