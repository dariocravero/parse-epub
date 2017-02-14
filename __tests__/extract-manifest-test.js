import { contentOpf } from './data.js'
import extractManifest from '../extract/manifest.js'

test('#extractManifest', () => {
  expect(extractManifest(contentOpf)).toMatchSnapshot();
});
