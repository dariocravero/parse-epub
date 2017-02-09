import { tocHtml } from './data.js'
import extractToc from '../extract/toc.js'

test('#extractToc', () => {
  expect(extractToc(tocHtml)).toMatchSnapshot();
});
