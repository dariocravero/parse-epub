import { containerXml } from './data.js'
import extractRootFile from '../extract/root-file.js'

test('#extractRootFile', () => {
  expect(extractRootFile(containerXml)).toEqual('OPS/content.opf');
});
