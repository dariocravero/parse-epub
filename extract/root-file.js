import { extname as getExtension } from '../path-helpers.js';
const ROOT_FILE = 'rootfile';
const FULL_PATH = 'full-path';

export default function rootFile(containerXml) {
  const packageDocumentPath = containerXml.querySelector(ROOT_FILE).getAttribute(FULL_PATH);
  if (getExtension(packageDocumentPath) === '.opf') {
    return packageDocumentPath;
  } else {
    throw new Error('no .opf file could be found in META-INF/container.xml');
  }
}
