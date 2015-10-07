import xml from './xml';

export default async function rootXml(uri, source) {
  return await xml(`${uri}/${source}`);
}
