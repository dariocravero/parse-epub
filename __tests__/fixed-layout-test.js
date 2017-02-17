import { fixedLayoutOpf } from './data.js';
import extractManifest from '../extract/manifest.js';
import extractMetadata from '../extract/metadata.js';
import extractSpine from '../extract/spine.js';

const manifest = extractManifest(fixedLayoutOpf);
const metadata = extractMetadata(fixedLayoutOpf, manifest);
const spine = extractSpine(fixedLayoutOpf);

test('#fixed layout metadata properties', () => {
  expect(metadata.renditionLayout).toBe('pre-paginated');
  expect(metadata.renditionOrientation).toBe('auto');
  expect(metadata.renditionSpread).toBe('none');
});

test('#fixed layout spine item single property', () => {
  const SINGLE_PROP_ID = 'xhtml-005';
  expect(spine.byId[SINGLE_PROP_ID].properties).toEqual({ "pageSpread": "center" });
});

test('#fixed layout spine item multiple properties', () => {
  const MULTI_PROP_ID = 'xhtml-006';
  expect(spine.byId[MULTI_PROP_ID].properties).toEqual({ "layout": "prePaginated", "pageSpread": "right" });
});

test('#spine page-progression-direction property', () => {
  expect(spine.pageDirection).toBe('ltr');
});
