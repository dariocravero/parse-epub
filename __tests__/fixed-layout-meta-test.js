import { fixedLayoutOpf } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractMetadata from '../extract/metadata.js';

test('#fixed layout metadata properties', () => {
  // TODO match what happens with the toc test here
  const manifest = extractManifest(fixedLayoutOpf);
  const metadata = extractMetadata(fixedLayoutOpf, manifest);

  expect(metadata.renditionLayout).toBe('pre-paginated');
  expect(metadata.renditionOrientation).toBe('auto');
  expect(metadata.renditionSpread).toBe('none');
});
