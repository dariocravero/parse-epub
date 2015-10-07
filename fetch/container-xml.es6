import xml from './xml';

const CONTAINER_XML = 'META-INF/container.xml';

export default async function containerXml(uri, source=CONTAINER_XML) {
  return await xml(`${uri}/${source}`);
}
