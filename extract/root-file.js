import { extname as getExtension } from '../path-helpers.js';
import querySelector from '../query-selector.js';

const ROOT_FILE = 'rootfile';
const FULL_PATH = 'full-path';

export default function rootFile(xml) {
  const packageDocumentPath = querySelector(xml, ROOT_FILE).attributes[FULL_PATH];

  if (getExtension(packageDocumentPath) === '.opf') {
    return packageDocumentPath;
  } else {
    throw new Error('no .opf file could be found in META-INF/container.xml');
  }
}
