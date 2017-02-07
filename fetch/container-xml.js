import xml from './xml';

const CONTAINER_XML = 'META-INF/container.xml';

export default function containerXml(uri, source=CONTAINER_XML) {
  return xml(`${uri}/${source}`);
}
