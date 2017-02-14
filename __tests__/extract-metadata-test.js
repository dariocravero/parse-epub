import { contentOpf } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractMetadata from '../extract/metadata.js';

test('#extractMetadata', () => {
  // TODO match what happens with the toc test here
  const manifest = extractManifest(contentOpf)
  expect(extractMetadata(contentOpf, manifest)).toMatchSnapshot();
});
