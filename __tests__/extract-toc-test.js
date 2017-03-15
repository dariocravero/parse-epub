import {
  contentOpf,
  entireHiddenTocHtml,
  hiddenItemTocHtml,
  hiddenSectionTocHtml,
  hiddenSingleItemTocHtml,
  nestedTocHtml,
  tocHtml
} from './data.js';
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

test('#extractEntireHiddenToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(entireHiddenTocHtml, manifest, spine)).toMatchSnapshot();
});

test('#extractHiddenSectionToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(hiddenSectionTocHtml, manifest, spine)).toMatchSnapshot();
});

test('#extractHiddenItemToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(hiddenItemTocHtml, manifest, spine)).toMatchSnapshot();
});

test('#extractHiddenSingleItemToc', () => {
  const manifest = extractManifest(contentOpf)
  const spine = extractSpine(contentOpf)
  expect(extractToc(hiddenSingleItemTocHtml, manifest, spine)).toMatchSnapshot();
});
