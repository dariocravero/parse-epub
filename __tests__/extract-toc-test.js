import { contentOpf, nestedTocHtml, tocHtml } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractSpine from '../extract/spine.js';
import extractToc from '../extract/toc.js';

test('#extractToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(tocHtml, manifest, spine)).toMatchSnapshot();
});

test('#extractNestedToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(nestedTocHtml, manifest, spine)).toMatchSnapshot();
});
