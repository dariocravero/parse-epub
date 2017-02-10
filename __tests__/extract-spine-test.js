import { contentOpf } from './data.js'
import extractSpine from '../extract/spine.js'

test('#extractSpine', () => {
  expect(extractSpine(contentOpf)).toMatchSnapshot();
});
