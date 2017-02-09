import { contentOpf, tocHtml } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractToc from '../extract/toc.js';

test('#extractToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = [] // TODO
  expect(extractToc(tocHtml, manifest, spine)).toMatchSnapshot();
});
