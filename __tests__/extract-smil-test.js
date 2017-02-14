import { contentOpf, testSmil } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractMetadata from '../extract/metadata.js';
import extractSmil from '../extract/smil.js';

const SMIL_ID = 's0036';

test('#extractSmil', () => {
  const metadata = extractMetadata(contentOpf, extractManifest(contentOpf));
  expect(extractSmil(testSmil, SMIL_ID, metadata.mediaOverlayDurations, './OPS')).toMatchSnapshot();
});