import * as extract from './extract';
import * as fetch from './fetch';

export default async function parse(uri) {
  const containerXml = await fetch.containerXml(uri);
  const rootFile = extract.rootFile(containerXml);
  const rootXml = await fetch.rootXml(uri, rootFile);
  const manifest = extract.manifest(rootXml);
  const metadata = extract.metadata(rootXml, manifest);
  const spine = extract.spine(rootXml, manifest);

  return {
    manifest,
    metadata,
    spine
  };
}
