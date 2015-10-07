import xml from './xml';

export default async function manifestItemXml(uri, source) {
  return await xml(`${uri}/OPS/${source}`);
}
