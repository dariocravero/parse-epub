const ROOT_FILE = 'rootfile';
const FULL_PATH = 'full-path';

export default function rootFile(containerXml) {
  return containerXml.querySelector(ROOT_FILE).getAttribute(FULL_PATH);
}
