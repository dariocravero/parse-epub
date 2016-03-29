import { parseRaw } from '../../parse-raw';
import rootFile from '../root-file';
import test from 'tape';

const CONTAINER_XML = parseRaw(`<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
<rootfiles>
<rootfile full-path="OPS/package.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>`);

const CONTAINER_XML_EPUB = parseRaw(`<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
<rootfiles>
<rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
</rootfiles>
</container>`);

test('extract #rootFile', t => {
  t.equals(rootFile(CONTAINER_XML), 'OPS/package.opf');
  t.end();
});

test('has #rootFile content folder OPS', t => {
  t.equals(rootFile(CONTAINER_XML).split('/')[0], 'OPS');
  t.end();
});

test('has #rootFile content folder EPUB', t => {
  t.equals(rootFile(CONTAINER_XML_EPUB).split('/')[0], 'EPUB');
  t.end();
});